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

export class NoTargetError extends Error {
  constructor() {
    super('No target element could be found in the document provided');
  }
}

/**
 * Create a NodeRef for the node uniquely identified by 'selector'
 * @param selector - Selector uniquely identifying the node to be referenced.
 * @param client - CDPSession for page.
 * @param page - Page containing the node for whom a NodeRef will be created.
 */
export async function getNodeRefFromSelector(
  selector: string,
  client: CDPSession,
  page: Page
): Promise<NodeRef> {
  const getDocumentResponse = (await client.send(
    'DOM.getDocument'
  )) as Protocol.DOM.GetDocumentResponse;

  const querySelectorResponse = (await client.send('DOM.querySelector', {
    nodeId: getDocumentResponse.root.nodeId,
    selector: selector,
  })) as Protocol.DOM.QuerySelectorResponse;

  if (querySelectorResponse.nodeId === 0) {
    throw new NoTargetError();
  }

  const describeNodeResponse = (await client.send('DOM.describeNode', {
    nodeId: querySelectorResponse.nodeId,
  })) as Protocol.DOM.DescribeNodeResponse;

  const backendNodeId = describeNodeResponse.node.backendNodeId;
  const nodeHandle = await page.$(selector);

  if (nodeHandle) {
    return {selector: selector, handle: nodeHandle, backendId: backendNodeId};
  }

  throw new Error(
    `NodeRef could not be created using the selector '${selector}'.`
  );
}

/**
 * Create a NodeRef using a DevTools Protocol BackendNodeId.
 * @param backendId - BackendNodeId for the node whose NodeRef is being created.
 * @param client - CDPSession for page.
 * @param page - Page in which the node whose NodeRef is being created exists.
 */
export async function getNodeRefFromBackendId(
  backendId: Protocol.DOM.BackendNodeId,
  client: CDPSession,
  page: Page
): Promise<NodeRef> {
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

  throw new Error(
    `NodeRef could not be created using DOM.BackendNodeId '${backendId}'.`
  );
}

const randomString = () => {
  return 'noderefMarker-' + Math.random().toString(36).substr(2, 5);
};
