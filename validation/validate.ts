import {CDPSession, Page} from 'puppeteer';
import * as puppeteer from 'puppeteer';
import {Protocol} from 'devtools-protocol';
import fetch from 'node-fetch';
import {NodeRef, getNodeRefFromSelector, getNodeRefFromBackendId} from './node_ref';

// TODO: import node package when our lib is ready,
// export .source as is done in axe.
import {ourLibSource} from './our_lib_source';
import * as axe from 'axe-core';

// TODO: Take user input from UI rather than hard coded
const INPUT_HTML = `
  <html>
    <head>
      <title>
        A Sample HTML Document
      </title>
    </head>
    <body>
      <button id="bar">Hello<div id="baz">world</div></button>
      <div aria-labelledby="bar baz"></div>
      <label for="woop">world</label>
      <label>
        Hello
        <input accnameComparisonTarget id="woop"/>
      </label>
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

  await loadAccNameLibraries(page);
  const targetNodeRef = await getNodeRefFromSelector('[accnameComparisonTarget]', client, page);
  if (targetNodeRef) {
    const accnames = await runComparison(targetNodeRef, page);
    console.log('AccName comparison:\n', accnames);

    const htmlUsedByChrome = await getHTMLUsedByChrome(targetNodeRef, client, page);
    console.log('\nHTML used by Chrome:\n', htmlUsedByChrome);
  }

  await browser.close();
})();

/**
 * Run a series of AccName implementations on the same node.
 * @param nodeRef - NodeRef representing the target node for comparison.
 * @param page - Page in which to run the implementations.
 * @return - A mapping from implementation name to the accessible name produced
 * by that implementation.
 */
async function runComparison(nodeRef: NodeRef, page: Page): Promise<{[key: string]: string}> {
  const accnames: {[key: string]: string} = {};

  // Chrome accname
  const axNode = await page.accessibility.snapshot({root: nodeRef.handle});
  accnames.chrome = axNode.name;

  // Axe accname
  await page.evaluate('axeTargetElem = axe.utils.querySelectorAll(_tree, \'' + nodeRef.selector + '\')[0];');
  const axeName = await page.evaluate('axe.commons.text.accessibleTextVirtual(axeTargetElem);') as string;
  accnames.axe = axeName;

  // AOM accname
  const aomName = await page.evaluate('getAOMName(\'' + nodeRef.selector + '\');') as string;
  accnames.aom = aomName;

  // BG prototype accname
  const bgName = await page.evaluate('getAccName(document.querySelector(\'' + nodeRef.selector + '\')).name') as string;
  accnames.bg = bgName;

  // Our accname
  const ourName = await page.evaluate('OurLib.getAccessibleName(document.querySelector(\'' + nodeRef.selector + '\'));') as string;
  accnames.ourLib = ourName;

  return accnames;
}

/**
 * Prepare AccName implementation libraries to be run on the current page.
 * @param page - The page in which the libraries
 */
async function loadAccNameLibraries(page: Page) {
  // Load axe-core
  await page.evaluate(axe.source);
  await page.evaluate('const _tree = axe.utils.getFlattenedTree(document.body);');
  await page.evaluate('let axeTargetElem');

  // Load aom wrapper function
  page.evaluate(`
    const getAOMName = async (selector) => {
      const aomObj = await getComputedAccessibleNode(document.querySelector(selector));
      return aomObj.name;
    }
  `);

  // Load Bryan Garaventa's Prototype from github repo
  const bgPrototypeSource = await (async () => {
    const response = await fetch('https://whatsock.github.io/w3c-alternative-text-computation/Sample%20JavaScript%20Recursion%20Algorithm/recursion.js');
    const responseBody = await response.text();
    return responseBody;
  })();
  await page.evaluate(bgPrototypeSource);

  // Load our AccName
  await page.evaluate(ourLibSource);
}

/**
 * Get a string containing the HTML used by Chrome DevTools to compute the accessible name
 * for nodeRef.
 * @param nodeRef - The node whose accessible name is being computed.
 * @param client - The CDPSession for page.
 * @param page - The page in which to run the accessible name computation.
 */
async function getHTMLUsedByChrome(nodeRef: NodeRef, client: CDPSession, page: Page): Promise<string> {
  const nodesUsedByChrome = await getNodesUsedByChrome(nodeRef, client, page);
  const relevantNodes = await removeRedundantNodes(nodesUsedByChrome, page);
  let htmlString = '';
  for (const nodeRef of relevantNodes) {
    htmlString += await page.evaluate(node => node.outerHTML, nodeRef.handle) + '\n';
  }
  return htmlString;
}

/**
 * Remove any nodes in nodeRefs that have an ancestor in nodeRefs.
 * @param nodeRefs - Array of nodes from which redundant nodes are being removed
 * @param page - Page containing the nodes in nodeRefs
 */
async function removeRedundantNodes(nodeRefs: NodeRef[], page: Page): Promise<NodeRef[]> {
  const redundantNodes: NodeRef[] = [];
  for (const nodeRefA of nodeRefs) {
    for (const nodeRefB of nodeRefs) {
      // Any node that has an ancestor in nodeRefs is considered redundant because
      // outerHTML includes all descendants.
      const isRedundant = await page.evaluate((nodeA, nodeB) => nodeA.contains(nodeB), nodeRefA.handle, nodeRefB.handle);
      // nodeA contains nodeA, so we must ensure that nodeRefA !== nodeRefB or all
      // nodes will be considered redundant.
      if (isRedundant && nodeRefA !== nodeRefB) {
        redundantNodes.push(nodeRefB);
      }
    }
  }
  return nodeRefs.filter(nodeRef => !redundantNodes.includes(nodeRef));
}

/**
 * Gets all nodes used by Chrome to compute the accessible name for nodeRef.
 * @param nodeRef - Node whose accessible name is being computed.
 * @param client - CDPSession for page.
 * @param page - Page containing nodeRef.
 */
async function getNodesUsedByChrome(nodeRef: NodeRef, client: CDPSession, page: Page): Promise<NodeRef[]> {
  const stack: NodeRef[] = [];
  const nodesUsed: NodeRef[] = [];
  // Track backendIds of visited nodes to avoid infinite cycle.
  const visitedNodes: Protocol.DOM.BackendNodeId[] = [];
  stack.push(nodeRef);
  // Iterative DFS traverses nodes connected by label references
  while (stack.length > 0) {
    const currentNodeRef = stack.pop();
    nodesUsed.push(currentNodeRef!);

    const axTree = (await client.send('Accessibility.getPartialAXTree', {
      backendNodeId: currentNodeRef!.backendId,
    })) as Protocol.Accessibility.GetPartialAXTreeResponse;

    // Check if any AXNodes descandant of currentNodeRef are labelled
    for (const axNode of axTree.nodes) {
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
        const labelNodeRef = await getNodeRefFromBackendId(labelNode.backendDOMNodeId, client, page);
        if (labelNodeRef && !visitedNodes.includes(labelNodeRef.backendId)) {
          stack.push(labelNodeRef);
          visitedNodes.push(labelNodeRef.backendId);
        }
      }
      // Stop iterating when we reach the current node :
      // we have checked all descendants.
      if (axNode.backendDOMNodeId === currentNodeRef!.backendId) {
        break;
      }
    }
  }

  return nodesUsed;
}