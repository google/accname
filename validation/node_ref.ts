import {ElementHandle, CDPSession, Page} from 'puppeteer';
import {Protocol} from 'devtools-protocol';

/**
 * Provides multiple references for the same DOM Node
 */
export interface NodeRef {
  // If the selector property is present then document.querySelector(selector) returns the referenced node.
  selector?: string;
  handle: ElementHandle;
  backendId: Protocol.DOM.BackendNodeId;
}

/**
 * Create a NodeRef for the node uniquely identified by 'selector'
 * @param selector - Selector uniquely identifying the node to be referenced.
 * @param client - CDPSession for page.
 * @param page - Page containing the node for whom a NodeRef will be created.
 * @return - A NodeRef if one could be created from the provided selector,
 * null otherwise.
 */
export async function getNodeRefFromSelector(
  selector: string,
  client: CDPSession,
  page: Page
): Promise<NodeRef | null> {
  const getDocumentResponse = (await client.send(
    'DOM.getDocument'
  )) as Protocol.DOM.GetDocumentResponse;

  const querySelectorResponse = (await client.send('DOM.querySelector', {
    nodeId: getDocumentResponse.root.nodeId,
    selector: selector,
  })) as Protocol.DOM.QuerySelectorResponse;

  const describeNodeResponse = (await client.send('DOM.describeNode', {
    nodeId: querySelectorResponse.nodeId,
  })) as Protocol.DOM.DescribeNodeResponse;

  const backendNodeId = describeNodeResponse.node.backendNodeId;
  const nodeHandle = await page.$(selector);

  return nodeHandle
    ? {selector: selector, handle: nodeHandle, backendId: backendNodeId}
    : null;
}

/**
 * Create a NodeRef using a DevTools Protocol BackendNodeId.
 * @param backendId - BackendNodeId for the node whose NodeRef is being created.
 * @param client - CDPSession for page.
 * @param page - Page in which the node whose NodeRef is being created exists.
 * @return - A NodeRef if one could be created from the provided BackendNodeId,
 * null otherwise.
 */
export async function getNodeRefFromBackendId(
  backendId: Protocol.DOM.BackendNodeId,
  client: CDPSession,
  page: Page
): Promise<NodeRef | null> {
  // Use Protocol.Runtime.RemoteObject (returned by DOM.resolveNode)
  // to reliably get Protocol.DOM.NodeId
  const resolveNodeResponse = (await client.send('DOM.resolveNode', {
    backendNodeId: backendId,
  })) as Protocol.DOM.ResolveNodeResponse;

  const requestNodeResponse = (await client.send('DOM.requestNode', {
    objectId: resolveNodeResponse.object.objectId,
  })) as Protocol.DOM.RequestNodeResponse;

  const markerAttribute = randomString();

  // Mark the node using a unique attribute
  await client.send('DOM.setAttributeValue', {
    nodeId: requestNodeResponse.nodeId,
    name: markerAttribute,
    value: 'true',
  });

  // Find the referenced node using that unique attribute, allowing us
  // to get an ElementHandle for that node.
  const nodeHandle = await page.$('[' + markerAttribute + ']');
  if (nodeHandle) {
    // Remove the marker attribute.
    await page.evaluate(
      (elem, markerAttribute) => elem.removeAttribute(markerAttribute),
      nodeHandle,
      markerAttribute
    );
    return {backendId: backendId, handle: nodeHandle};
  }

  return null;
}

const randomString = () => {
  return 'noderefMarker-' + Math.random().toString(36).substr(2, 5);
};
