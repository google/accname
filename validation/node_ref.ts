import {ElementHandle, CDPSession, Page} from 'puppeteer';
import {Protocol} from 'devtools-protocol';

export interface NodeRef {
  selector?: string;
  handle: ElementHandle;
  backendId: Protocol.DOM.BackendNodeId;
}

export async function getNodeRefFromSelector(selector: string, client: CDPSession, page: Page): Promise<NodeRef | null> {

  const getDocumentResponse = await client.send('DOM.getDocument') as Protocol.DOM.GetDocumentResponse ;

  const querySelectorResponse = await client.send('DOM.querySelector', {
    nodeId: getDocumentResponse.root.nodeId,
    selector: selector
  }) as Protocol.DOM.QuerySelectorResponse;

  const describeNodeResponse = await client.send('DOM.describeNode', {
    nodeId: querySelectorResponse.nodeId
  }) as Protocol.DOM.DescribeNodeResponse;

  const backendNodeId = describeNodeResponse.node.backendNodeId;
  const nodeHandle = await page.$(selector);

  if (nodeHandle) {
    return {selector: selector, handle: nodeHandle, backendId: backendNodeId};
  }

  return null;
}

export async function getNodeRefFromBackendId(backendId: Protocol.DOM.BackendNodeId, client: CDPSession, page: Page): Promise<NodeRef | null> {

  const resolveNodeResponse = await client.send('DOM.resolveNode', {
    backendNodeId: backendId
  }) as Protocol.DOM.ResolveNodeResponse;

  const requestNodeResponse = await client.send('DOM.requestNode', {
    objectId: resolveNodeResponse.object.objectId
  }) as Protocol.DOM.RequestNodeResponse;

  await client.send('DOM.setAttributeValue', {
    nodeId: requestNodeResponse.nodeId,
    name: 'nodeRefMarker',
    value: 'true'
  });

  const nodeHandle = await page.$('[nodeRefMarker]');
  if (nodeHandle) {
    await page.evaluate(elem => elem.removeAttribute('nodeRefMarker'), nodeHandle);
    return {backendId: backendId, handle: nodeHandle};
  }

  return null;
}