import {Protocol} from 'devtools-protocol';
import {NodeRef, getNodeRefFromBackendId} from './node_ref';
import {CDPSession, Page, ElementHandle} from 'puppeteer';

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
  const nodesUsedByChrome = await getNodesUsedByChrome(nodeRef, client, page);
  const chromeHandles = nodesUsedByChrome.map(node => node.handle);
  const htmlUsedByChrome = await getHTMLFromHandles(chromeHandles, page);

  // Initialise nodeArray and get its length
  const accnameNodeArrayLength = await page.evaluate(`
    const nodeSet = accname.getNameComputationDetails(document.querySelector('${nodeRef.selector}')).nodesUsed;
    const nodeArray = Array.from(nodeSet);
    nodeArray.length;`);
  // Make an array containing an ElementHandle for each Node in nodeArray
  const accnameHandles = (await Promise.all(
    [...Array(accnameNodeArrayLength).keys()].map(i =>
      page.evaluateHandle(`nodeArray[${i}]`)
    )
  )) as ElementHandle<Element>[];
  const htmlUsedByAccname = await getHTMLFromHandles(accnameHandles, page);

  return {chrome: htmlUsedByChrome, accname: htmlUsedByAccname};
}

/**
 * Calculate the HTML snippet containing the elements referenced
 * by a given array of ElementHandles.
 * @param handles - The ElementHandles for whom a HTML snippet is being computed
 * @param page - The page containing the ElementHandles.
 */
async function getHTMLFromHandles(
  handles: ElementHandle<Element>[],
  page: Page
): Promise<string> {
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
  }, ...handles);

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
