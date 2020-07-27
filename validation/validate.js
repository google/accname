const puppeteer = require('puppeteer');
const axe = require('axe-core');
const bgPrototype = require('./source_code/bg_prototype_source.js');
const ourLib = require('./source_code/our_lib_source.js');

const inputHTML = `
  <html>
    <head>
      <title>
        A Sample HTML Document
      </title>
    </head>
    <body>
      <div id="bar">world</div>
      <div id="baz">Hello</div>
      <div id="foo" aria-labelledby="baz bar"></div>
    </body>
  </html>
`;

(async () => {
  const browser = await puppeteer.launch(
      {args: ['--enable-blink-features=AccessibilityObjectModel']});
  const page = await browser.newPage();
  await page.goto('data:text/html,' + inputHTML);

  const client = await page.target().createCDPSession();

  await loadAccNameLibraries(client);

  const chromeAccName = await getChromeAccName(client, 'foo');
  console.log('Chrome AccName: ', chromeAccName);

  const axeAccName = await getAXEAccName(client, 'foo');
  console.log('aXe AccName: ', axeAccName);

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


async function loadAccNameLibraries(client) {
  // Load axe-core
  await client.send('Runtime.evaluate', {expression: axe.source});
  await client.send('Runtime.evaluate', {
    expression:
        'const _tree = axe.utils.getFlattenedTree(document.body); let axeTargetElem;'
  });
  // Load aom wrapper function
  await client.send('Runtime.evaluate', {
    expression:
        'const getAOMWrapper = async (idref) => { const aomObj = await getComputedAccessibleNode(document.getElementById(idref)); return aomObj.name;}'
  });
  // Load Bryan Garaventa's Prototype
  await client.send('Runtime.evaluate', {expression: bgPrototype});
  // Load our AccName
  const x = await client.send('Runtime.evaluate', {expression: ourLib});
}

/**
 * Gets the AccName for node with [id='idref'] according to Chrome DevTools'
 * implementation
 * @param {CDPSession} client
 * @param {string} idref
 */
async function getChromeAccName(client, idref) {
  const selectedBackendNodeId = await getBackendNodeIdFromIdref(client, idref);
  const axTree = await client.send(
      'Accessibility.getPartialAXTree', {backendNodeId: selectedBackendNodeId});
  return axTree.nodes
             .filter(
                 (node) => node.backendDOMNodeId === selectedBackendNodeId)[0]
             ?.name.value ??
      '';
}

/**
 * Gets the AccName for node with [id='idref'] according to axe-core
 * @param {CDPSession} client
 * @param {string} idref
 */
async function getAXEAccName(client, idref) {
  await client.send('Runtime.evaluate', {
    expression: 'axeTargetElem = axe.utils.querySelectorAll(_tree, \'#' +
        idref + '\')[0];'
  });
  const axeAccNameComputation = await client.send(
      'Runtime.evaluate',
      {expression: 'axe.commons.text.accessibleTextVirtual(axeTargetElem);'});
  return axeAccNameComputation.result.value;
}

/**
 * Gets the AccName for node with [id='idref'] according to AOM
 * @param {CDPSession} client
 * @param {string} idref
 */
async function getAOMAccName(client, idref) {
  const aomAccNameComputation = await client.send(
      'Runtime.evaluate',
      {expression: 'getAOMWrapper(\'' + idref + '\');', awaitPromise: true});
  return aomAccNameComputation.result.value;
}

/**
 * Gets the AccName for node with [id='idref'] according to Bryan Garaventa's
 * prototype
 * @param {CDPSession} client
 * @param {string} idref
 */
async function getBGAccName(client, idref) {
  const bgAccNameComputation = await client.send('Runtime.evaluate', {
    expression: 'getAccName(document.getElementById(\'' + idref + '\')).name;'
  });
  return bgAccNameComputation.result.value;
}

/**
 * Gets the AccName for node with [id='idref'] according to our implementation
 * @param {CDPSession} client
 * @param {string} idref
 */
async function getOurAccName(client, idref) {
  const ourAccNameComputation = await client.send('Runtime.evaluate', {
    expression:
        'OurLib.getAccessibleName(document.getElementById(\'' + idref + '\'));'
  });
  // console.log(ourAccNameComputation);
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
async function getMinimisedHTML(client, idref) {
  const nodeId = await getBackendNodeIdFromIdref(client, idref);
  const allNodesInComputation = await getAllNodesInComputation(client, nodeId);
  const allRelevantNodes =
      await removeRedundantNodes(client, allNodesInComputation);
  const minimisedHTML = await getHTMLfromNodeIds(client, allRelevantNodes);
  return minimisedHTML;
}

/**
 * Get all nodes that are connected to nodeId by label references.
 * The nodes returned by this function are the roots of any
 * DOM subtrees that are relevant to the computation of nodeId's
 * accName.
 * @param {CDPSession} client
 * @param {DOM.backendNodeId} nodeId
 */
async function getAllNodesInComputation(client, nodeId) {
  const stack = [];
  const relatedNodeIds = [];
  stack.push(nodeId);
  // Iterative DFS traverses nodes connected by label references
  while (stack && stack.length > 0) {
    const currentNodeId = stack.pop();
    relatedNodeIds.push(currentNodeId);
    const axTree = await client.send(
        'Accessibility.getPartialAXTree', {backendNodeId: currentNodeId});
    // Nodes in axTree.nodes are in order of decreasing depth in the DOM.
    // We traverse all nodes descendant of currentNodeId, checking whether
    // each one contains a label reference.
    for (let axNode of axTree.nodes) {
      let nextRelatedNodes = [];
      // Check if axNode is aria-labelledby any other nodes
      if (axNode.name && axNode.name.sources[0].attributeValue) {
        nextRelatedNodes = axNode.name.sources[0].attributeValue.relatedNodes;
      }
      // Check if axNode is native <label>led by any other nodes
      else if (
          axNode.name && axNode.name.sources[2] &&
          axNode.name.sources[2].nativeSourceValue) {
        nextRelatedNodes =
            axNode.name.sources[2].nativeSourceValue.relatedNodes;
      }

      for (relatedNode of nextRelatedNodes) {
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
async function removeRedundantNodes(client, relatedNodeIds) {
  let redundantNodeIds = [];
  for (let currentBackendNodeId of relatedNodeIds) {
    const axTree = await client.send(
        'Accessibility.getPartialAXTree',
        {backendNodeId: currentBackendNodeId});
    for (let node of axTree.nodes) {
      // If we reach the current node, we have checked all descendants.
      if (node.backendDOMNodeId === currentBackendNodeId) {
        break;
      }
      if (relatedNodeIds.includes(node.backendDOMNodeId)) {
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
async function getHTMLfromNodeIds(client, nodeIds) {
  let HTMLString = '';
  for (let nodeId of nodeIds) {
    const result =
        await client.send('DOM.getOuterHTML', {backendNodeId: nodeId});
    HTMLString += result.outerHTML + '\n';
  }
  return HTMLString;
}

/**
 * Gets the DOM.backedNodeId of the node with [id='idref']
 * @param {CDPSession} client
 * @param {string} idref
 */
async function getBackendNodeIdFromIdref(client, idref) {
  const doc = await client.send('DOM.getDocument');
  const selectedNodeId = await client.send(
      'DOM.querySelector',
      {nodeId: doc.root.nodeId, selector: '[id="' + idref + '"]'});
  const selectedNodeDescription =
      await client.send('DOM.describeNode', selectedNodeId);
  return selectedNodeDescription.node.backendNodeId;
}