import {Protocol} from 'devtools-protocol';
import {NodeRef, getNodeRefFromBackendId} from './node_ref';
import {CDPSession, Page} from 'puppeteer';

/**
 * Gets strings containing the HTML markup for the Nodes used to compute
 * the accessible name for NodeRef.
 * @param nodeRef - Reference to Node whose name is being computed
 * @param client - CDPSession for page
 * @param page - Page containing Node referenced by NodeRef
 */
export async function getHTMLUsed(
  nodeRef: NodeRef,
  client: CDPSession,
  page: Page
): Promise<{[implementation: string]: string}> {
  const htmlUsedByChrome = await getHTMLUsedByChrome(nodeRef, client, page);
  const htmlUsedByOurAccName = (await page.evaluate(
    "ourLib.getAccessibleName(document.querySelector('" +
      nodeRef.selector +
      "')).visitedHTMLSnippet;"
  )) as string;
  return {chrome: htmlUsedByChrome, accname: htmlUsedByOurAccName};
}

/**
 * Get a string containing the HTML used by Chrome DevTools to compute the accessible name
 * for nodeRef.
 * @param nodeRef - The node whose accessible name is being computed.
 * @param client - The CDPSession for page.
 * @param page - The page in which to run the accessible name computation.
 */
async function getHTMLUsedByChrome(
  nodeRef: NodeRef,
  client: CDPSession,
  page: Page
): Promise<string> {
  const nodesUsedByChrome = await getNodesUsedByChrome(nodeRef, client, page);

  const nodeHandles = nodesUsedByChrome.map(node => node.handle);
  // Get the outerHTML of the nodes used by Chrome
  const htmlString = await page.evaluate((...nodes) => {
    // Sort nodes by DOM order
    nodes.sort((first, second) => {
      const relativePosition = first.compareDocumentPosition(second);
      if (
        relativePosition & Node.DOCUMENT_POSITION_PRECEDING ||
        relativePosition & Node.DOCUMENT_POSITION_CONTAINS
      ) {
        return 1;
      } else if (
        relativePosition & Node.DOCUMENT_POSITION_FOLLOWING ||
        relativePosition & Node.DOCUMENT_POSITION_CONTAINED_BY
      ) {
        return -1;
      } else {
        return 0;
      }
    });
    // Remove 'redundant' nodes: nodes whose outerHTML is included in that of
    // an ancestor node.
    return nodes
      .filter((node, i) => !nodes[i - 1]?.contains(node))
      .map(node => node.outerHTML)
      .join('\n');
  }, ...nodeHandles);

  return htmlString;
}

/**
 * Gets all nodes used by Chrome to compute the accessible name for nodeRef.
 * @param nodeRef - Node whose accessible name is being computed.
 * @param client - CDPSession for page.
 * @param page - Page containing nodeRef.
 */
async function getNodesUsedByChrome(
  nodeRef: NodeRef,
  client: CDPSession,
  page: Page
): Promise<NodeRef[]> {
  const stack: NodeRef[] = [];
  const nodesUsed: NodeRef[] = [];
  // Track backendIds of visited nodes to avoid infinite cycle.
  const visitedNodes: Protocol.DOM.BackendNodeId[] = [];
  stack.push(nodeRef);
  // Iterative DFS traverses nodes connected by label references
  while (stack.length > 0) {
    const currentNodeRef = stack.pop()!;
    nodesUsed.push(currentNodeRef);

    const axTree = (await client.send('Accessibility.getPartialAXTree', {
      backendNodeId: currentNodeRef.backendId,
    })) as Protocol.Accessibility.GetPartialAXTreeResponse;

    // Find the index of the currentNodeRef's corresponding AXNode
    const indexOfCurrentNode = axTree.nodes.findIndex(
      axNode => axNode.backendDOMNodeId === currentNodeRef?.backendId
    );

    // Contains AXNodes descendant of currentNodeRef's corresponding AXNode
    const descandantNodes = axTree.nodes.slice(0, indexOfCurrentNode + 1);

    // Check if any descendant AXNodes are labelled
    for (const axNode of descandantNodes) {
      let labelNodes: Protocol.Accessibility.AXRelatedNode[] = [];
      const sources: Protocol.Accessibility.AXValueSource[] =
        axNode.name?.sources ?? [];

      for (const source of sources) {
        if (source.type === 'relatedElement') {
          // Handles nodes connected by attribute value (aria-labelleby)
          if (source.attributeValue?.relatedNodes) {
            labelNodes = source.attributeValue.relatedNodes;
            // Handles nodes connected natively (<label>)
          } else if (source.nativeSourceValue?.relatedNodes) {
            labelNodes = source.nativeSourceValue.relatedNodes;
          }
        }
      }

      // Repeat the process for all unvisited label nodes.
      for (const labelNode of labelNodes) {
        if (!visitedNodes.includes(labelNode.backendDOMNodeId)) {
          const labelNodeRef = await getNodeRefFromBackendId(
            labelNode.backendDOMNodeId,
            client,
            page
          );
          if (labelNodeRef) {
            stack.push(labelNodeRef);
          }
          visitedNodes.push(labelNode.backendDOMNodeId);
        }
      }
    }
  }

  return nodesUsed;
}
