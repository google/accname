import {CDPSession} from 'puppeteer';
import * as puppeteer from 'puppeteer';
import {Protocol} from 'devtools-protocol';
import fetch from 'node-fetch';

// TODO: import node package when our lib is ready,
// export .source as is done in axe.
import {ourLibSource} from './our_lib_source';
import * as axe from 'axe-core';

// TODO: Take user input rather than hard coded
const INPUT_HTML = `
  <html>
    <head>
      <title>
        A Sample HTML Document
      </title>
    </head>
    <body>
      <button id="bar">Hello<div id="baz">world</div></button>
      <div id="foo" aria-labelledby="bar baz"></div>
    </body>
  </html>
`;

(async () => {
  const browser = await puppeteer.launch({
    args: ['--enable-blink-features=AccessibilityObjectModel'],
  });
  const page = await browser.newPage();
  await page.goto('data:text/html,' + INPUT_HTML);

  const client = await page.target().createCDPSession();

  await loadAccNameLibraries(client);

  const chromeAccName = await getChromeAccName(client, 'foo');
  console.log('Chrome AccName: ', chromeAccName);

  const axeAccName = await getAXEAccName(client, 'foo');
  console.log('Axe AccName: ', axeAccName);

  const aomAccName = await getAOMAccName(client, 'foo');
  console.log('AOM AccName: ', aomAccName);

  const bgAccName = await getBGAccName(client, 'foo');
  console.log('BG AccName: ', bgAccName);

  const ourAccName = await getOurAccName(client, 'foo');
  console.log('Our AccName: ', ourAccName);

  const minimisedHTML = await getMinimisedHTML(client, 'foo');
  console.log('\nHTML Snippet used by Chrome:\n', minimisedHTML);

  await browser.close();
})();

/*

  Functions for loading and running the various AccName implementations

*/

async function loadAccNameLibraries(client: CDPSession) {
  // Load axe-core
  await client.send('Runtime.evaluate', {expression: axe.source});
  await client.send('Runtime.evaluate', {
    expression:
      'const _tree = axe.utils.getFlattenedTree(document.body); let axeTargetElem;',
  });
  // Load aom wrapper function
  await client.send('Runtime.evaluate', {
    expression:
      'const getAOMWrapper = async (idref) => { const aomObj = await getComputedAccessibleNode(document.getElementById(idref)); return aomObj.name;}',
  });
  // Load Bryan Garaventa's Prototype
  const bgPrototypeSource = await (async () => {
    const response = await fetch('https://whatsock.github.io/w3c-alternative-text-computation/Sample%20JavaScript%20Recursion%20Algorithm/recursion.js');
    const responseBody = await response.text();
    return responseBody;
  })();
  await client.send('Runtime.evaluate', {expression: bgPrototypeSource});
  // Load our AccName
  await client.send('Runtime.evaluate', {expression: ourLibSource});
}

/**
 * Gets the AccName for node with [id='idref'] according to Chrome DevTools'
 * implementation
 * @param {CDPSession} client
 * @param {string} idref
 */
async function getChromeAccName(
  client: CDPSession,
  idref: string
): Promise<string> {
  const selectedBackendNodeId = await getBackendNodeIdFromIdref(client, idref);
  const axTree = (await client.send('Accessibility.getPartialAXTree', {
    backendNodeId: selectedBackendNodeId,
    fetchRelatives: false
  })) as Protocol.Accessibility.GetPartialAXTreeResponse;
  return (
    axTree.nodes[0]?.name?.value ?? ''
  );
}

/**
 * Gets the AccName for node with [id='idref'] according to axe-core
 * @param {CDPSession} client
 * @param {string} idref
 */
async function getAXEAccName(
  client: CDPSession,
  idref: string
): Promise<string> {
  await client.send('Runtime.evaluate', {
    expression:
      "axeTargetElem = axe.utils.querySelectorAll(_tree, '#" + idref + "')[0];",
  });
  const axeAccNameEvaluation = (await client.send('Runtime.evaluate', {
    expression: 'axe.commons.text.accessibleTextVirtual(axeTargetElem);',
  })) as Protocol.Runtime.EvaluateResponse;
  return axeAccNameEvaluation.result.value;
}

/**
 * Gets the AccName for node with [id='idref'] according to AOM
 * @param {CDPSession} client
 * @param {string} idref
 */
async function getAOMAccName(
  client: CDPSession,
  idref: string
): Promise<string> {
  const aomAccNameComputation = (await client.send('Runtime.evaluate', {
    expression: "getAOMWrapper('" + idref + "');",
    awaitPromise: true,
  })) as Protocol.Runtime.EvaluateResponse;
  return aomAccNameComputation.result.value;
}

/**
 * Gets the AccName for node with [id='idref'] according to Bryan Garaventa's
 * prototype
 * @param {CDPSession} client
 * @param {string} idref
 */
async function getBGAccName(
  client: CDPSession,
  idref: string
): Promise<string> {
  const bgAccNameComputation = (await client.send('Runtime.evaluate', {
    expression: "getAccName(document.getElementById('" + idref + "')).name;",
  })) as Protocol.Runtime.EvaluateResponse;
  return bgAccNameComputation.result.value;
}

/**
 * Gets the AccName for node with [id='idref'] according to our implementation
 * @param {CDPSession} client
 * @param {string} idref
 */
async function getOurAccName(
  client: CDPSession,
  idref: string
): Promise<string> {
  const ourAccNameComputation = (await client.send('Runtime.evaluate', {
    expression:
      "OurLib.getAccessibleName(document.getElementById('" + idref + "'));",
  })) as Protocol.Runtime.EvaluateResponse;
  return ourAccNameComputation.result.value;
}

/*

  Functions / helper functions for minimising the HTML output.

*/

/**
 * Gets a string of HTML containing only the DOM nodes relevant to the
 * computation of an accessible name for the node with backendNodeId of
 * 'nodeId'.
 * @param {CDPSession} client
 * @param {DOM.backendNodeId} nodeId
 */
async function getMinimisedHTML(
  client: CDPSession,
  idref: string
): Promise<string> {
  const nodeId = await getBackendNodeIdFromIdref(client, idref);
  const allNodesInComputation = await getAllNodesUsedByChromeAccName(client, nodeId);
  const allRelevantNodes = await removeRedundantNodes(
    client,
    allNodesInComputation
  );
  return await getHTMLfromNodeIds(client, allRelevantNodes);
}

/**
 * Get all nodes that are connected to nodeId by label references.
 * The nodes returned by this function are the roots of any
 * DOM subtrees that are relevant to the computation of nodeId's
 * accName.
 * @param {CDPSession} client
 * @param {DOM.backendNodeId} nodeId
 */
async function getAllNodesUsedByChromeAccName(
  client: CDPSession,
  nodeId: Protocol.DOM.BackendNodeId
): Promise<Protocol.DOM.BackendNodeId[]> {
  const stack: Protocol.DOM.BackendNodeId[] = [];
  const relatedNodeIds: Protocol.DOM.BackendNodeId[] = [];
  stack.push(nodeId);
  // Iterative DFS traverses nodes connected by label references
  while (stack.length > 0) {
    const currentNodeId = stack.pop();
    relatedNodeIds.push(currentNodeId!);
    const axTree = (await client.send('Accessibility.getPartialAXTree', {
      backendNodeId: currentNodeId,
    })) as Protocol.Accessibility.GetPartialAXTreeResponse;
    // Nodes in axTree.nodes are in order of decreasing depth in the DOM.
    // We traverse all nodes descendant of currentNodeId, checking whether
    // each one contains a label reference.
    for (const axNode of axTree.nodes) {
      let nextRelatedNodes: Protocol.Accessibility.AXRelatedNode[] = [];
      const sources: Protocol.Accessibility.AXValueSource[] =
        axNode.name?.sources ?? [];

      for (const source of sources) {
        if (source.type === 'relatedElement') {
          // Handles nodes connected by attribute value (aria-labelleby)
          if (source.attributeValue?.relatedNodes) {
            nextRelatedNodes = source.attributeValue.relatedNodes;
          // Handles nodes connected natively (<label>)
          } else if (source.nativeSourceValue?.relatedNodes) {
            nextRelatedNodes = source.nativeSourceValue.relatedNodes;
          }
        }
      }

      for (const relatedNode of nextRelatedNodes) {
        if (!relatedNodeIds.includes(relatedNode.backendDOMNodeId)) {
          stack.push(relatedNode.backendDOMNodeId);
        }
      }
      // Stop iterating when we reach the current node :
      // we have checked all descendants.
      if (axNode.backendDOMNodeId === currentNodeId) {
        break;
      }
    }
  }
  return relatedNodeIds;
}

/**
 * Removes any node in relatedNodeIds that is descendant
 * of another node in relatedNodeIds. Such a node would be included
 * twice in the minimised HTML because outerHTML includes
 * all descendants.
 * @param {CDPSession} client
 * @param {DOM.backendNodeId} relatedNodeIds
 */
async function removeRedundantNodes(
  client: CDPSession,
  relatedNodeIds: Protocol.DOM.BackendNodeId[]
): Promise<Protocol.DOM.BackendNodeId[]> {
  const redundantNodeIds: Protocol.DOM.BackendNodeId[] = [];
  for (const currentBackendNodeId of relatedNodeIds) {
    const axTree = (await client.send('Accessibility.getPartialAXTree', {
      backendNodeId: currentBackendNodeId,
      fetchRelatives: false
    })) as Protocol.Accessibility.GetPartialAXTreeResponse;
    console.log(axTree.nodes[0].name?.sources);
    for (const node of axTree.nodes) {
      console.log(node);
      console.log(node.name?.sources);
      // If we reach the current node, we have checked all descendants.
      if (node.backendDOMNodeId === currentBackendNodeId) {
        break;
      }
      if (
        node.backendDOMNodeId &&
        relatedNodeIds.includes(node.backendDOMNodeId)
      ) {
        redundantNodeIds.push(node.backendDOMNodeId);
      }
    }
  }
  return relatedNodeIds.filter(nodeId => !redundantNodeIds.includes(nodeId));
}

/**
 * Gets a string of HTML containing the outerHTML of all nodeIds.
 * @param {CDPSession} client
 * @param {DOM.backendNodeId} nodeId
 */
async function getHTMLfromNodeIds(
  client: CDPSession,
  nodeIds: Protocol.DOM.BackendNodeId[]
): Promise<string> {
  let HTMLString = '';
  for (const nodeId of nodeIds) {
    const result = (await client.send('DOM.getOuterHTML', {
      backendNodeId: nodeId,
    })) as Protocol.DOM.GetOuterHTMLResponse;
    HTMLString += result.outerHTML + '\n';
  }
  return HTMLString;
}

/**
 * Gets the DOM.backedNodeId of the node with [id='idref']
 * @param {CDPSession} client
 * @param {string} idref
 */
async function getBackendNodeIdFromIdref(
  client: CDPSession,
  idref: string
): Promise<Protocol.DOM.BackendNodeId> {
  const doc = (await client.send(
    'DOM.getDocument'
  )) as Protocol.DOM.GetDocumentResponse;
  const selectedNodeId = (await client.send('DOM.querySelector', {
    nodeId: doc.root.nodeId,
    selector: '[id="' + idref + '"]',
  })) as Protocol.DOM.QuerySelectorResponse;
  const selectedNodeDescription = (await client.send(
    'DOM.describeNode',
    selectedNodeId
  )) as Protocol.DOM.DescribeNodeResponse;
  return selectedNodeDescription.node.backendNodeId;
}
