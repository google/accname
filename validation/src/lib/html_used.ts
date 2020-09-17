import {Protocol} from 'devtools-protocol';
import {NodeRef, getNodeRefFromBackendId} from './node_ref';
import {CDPSession, Page, JSHandle} from 'puppeteer';

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
  const chromeHandles = await getNodesUsedByChrome(nodeRef, client, page);
  const htmlUsedByChrome = await getHTMLFromHandles(chromeHandles, page);

  const accnameHandles = (await page.evaluateHandle(`
    Array.from(accname.getNameComputationDetails(document.querySelector('${nodeRef.selector}')).nodesUsed);
  `)) as JSHandle<Element[]>;
  const htmlUsedByAccname = await getHTMLFromHandles(accnameHandles, page);

  return {chrome: htmlUsedByChrome, accname: htmlUsedByAccname};
}

/**
 * Calculate the HTML snippet containing the array of elements referenced
 * by a given JSHandle.
 * @param handles - The ElementHandles for whom a HTML snippet is being computed
 * @param page - The page containing the ElementHandles.
 */
async function getHTMLFromHandles(
  handles: JSHandle<Element[]>,
  page: Page
): Promise<string> {
  // Get the outerHTML of the nodes used by Chrome
  const htmlString = await page.evaluate((nodes: Element[]) => {
    // Find 'redundant' nodes: nodes whose outerHTML is included in that of
    // an ancestor node.
    const redundantNodes = new Array<Element>();
    for (const nodeA of nodes) {
      for (const nodeB of nodes) {
        if (nodeA.contains(nodeB) && nodeA !== nodeB) {
          redundantNodes.push(nodeB);
        }
      }
    }

    return nodes
      .filter(node => !redundantNodes.includes(node))
      .map(node => node.outerHTML)
      .join('\n');
  }, handles);

  return htmlString;
}

/**
 * Gets a JSHandle containing the array of nodes used by Chrome
 * to compute the accessible name for nodeRef.
 * @param nodeRef - Node whose accessible name is being computed.
 * @param client - CDPSession for page.
 * @param page - Page containing nodeRef.
 */
async function getNodesUsedByChrome(
  nodeRef: NodeRef,
  client: CDPSession,
  page: Page
): Promise<JSHandle<Element[]>> {
  const stack: NodeRef[] = [];
  // Create a JSHandle containing an empty array
  const nodesUsedHandle = await page.evaluateHandle('[]');

  // Track backendIds of visited nodes to avoid infinite cycle.
  const visitedNodes: Protocol.DOM.BackendNodeId[] = [];
  stack.push(nodeRef);

  // Iterative DFS traverses nodes connected by label references
  while (stack.length > 0) {
    const currentNodeRef = stack.pop()!;
    // Add current Node to nodesUsed array
    await page.evaluate(
      (node, nodesUsed) => nodesUsed.push(node),
      currentNodeRef.handle,
      nodesUsedHandle
    );

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

  return nodesUsedHandle;
}
