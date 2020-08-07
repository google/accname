import {CDPSession, Page} from 'puppeteer';
import puppeteer from 'puppeteer';
import {Protocol} from 'devtools-protocol';
import fetch from 'node-fetch';
import {
  NodeRef,
  getNodeRefFromSelector,
  getNodeRefFromBackendId,
} from './node_ref';
import fs from 'fs';
import child from 'child_process';

// TODO: import node package when our lib is ready,
// export .source as is done in axe.
import {ourLibSource} from './our_lib_source';
import axe from 'axe-core';

// Hard coded initialisation function simulating calls from
// backend Express server. ./output and ./output/snippets directories
// must be present to store comparison results.
(async () => {
  // Compare on URL
  /*
  const USER_INPUT_URL =
    'https://keep.google.com/u/0/#home';
  await runURLComparison(USER_INPUT_URL);
  */
  // Compare on snippet
  /*
  const USER_INPUT_HTML_SNIPPET = `<div accnamecomparisontarget>Hello world</div>`;
  const result = await runHTMLSnippetComparison(USER_INPUT_HTML_SNIPPET);
  console.log(result);
  */
})();

/**
 * The return type for runHTMLSnippetComparison.
 *
 * Accnames property always present, caseId property
 * only present if accnames disagree and a testcase
 * has been saved.
 */
interface HTMLSnippetComparisonResult {
  accnames: {[key: string]: string};
  caseId?: string;
}

/**
 * Compares AccName implementations on a HTML snippet containing a target element
 * identified by the presence of an 'accnameComparisonTarget' attribute.
 * @param HTMLSnippet - The HTML snippet containing the target element.
 * @return An object containing the accessible names computed by 5 different implementations
 * and, in the case that there was some disagreement between implementations, an ID
 * for the test case file containing the details of that disagreement.
 */
export async function runHTMLSnippetComparison(
  HTMLSnippet: string
): Promise<HTMLSnippetComparisonResult> {
  // Load HTML snippet into Puppeteer browser
  const browser = await puppeteer.launch({
    args: ['--enable-blink-features=AccessibilityObjectModel'],
  });
  const page = await browser.newPage();
  await page.goto('data:text/html,' + HTMLSnippet);
  const client = await page.target().createCDPSession();

  await loadAccNameLibraries(page);

  const targetNodeRef = await getNodeRefFromSelector(
    '[accnameComparisonTarget]',
    client,
    page
  );

  const comparisonResults = await runComparison(targetNodeRef, page, client);
  await browser.close();
  if (comparisonResults.disagrees) {
    const caseId = saveTestcase(comparisonResults, 'output/snippet');
    return {caseId: caseId, accnames: comparisonResults.accnames};
  }

  return {accnames: comparisonResults.accnames};
}

/**
 * Compares AccName implementations on every Node in the DOM of the web page
 * at the URL provided.
 * @param url - The URL for the web page whose Nodes will be used to compare
 * AccName implementations.
 * @return The name of the directory containing the results of the URL comparison.
 */
export async function runURLComparison(url: string): Promise<string> {
  const browser = await puppeteer.launch({
    args: ['--enable-blink-features=AccessibilityObjectModel'],
  });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();

  const httpResponse = await page.goto(url);
  if (!httpResponse?.ok()) {
    throw new Error(`URL '${url}' could not be accessed.'`);
  }

  await loadAccNameLibraries(page);

  // Trim URL string to get a concise directory name for this comparison.
  const dirName = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
  child.exec(`mkdir output/${dirName}`);

  // Associates each category encountered with the number
  // of occurrences of that category
  const categoryCount: {[key: string]: number} = {};

  const allNodes = await page.$$('body *');
  let i = 0;
  for (const node of allNodes) {
    console.log(++i + '/' + allNodes.length);

    await page.evaluate(
      node => node.setAttribute('accnameComparisonTarget', 'true'),
      node
    );

    const targetNodeRef = await getNodeRefFromSelector(
      '[accnameComparisonTarget]',
      client,
      page
    );

    const comparisonResults = await runComparison(targetNodeRef, page, client);
    if (comparisonResults.disagrees && comparisonResults.category) {
      // Count category occurrences, save test case for any new categories.
      const categoryHash = JSON.stringify(comparisonResults.category);
      if (categoryCount[categoryHash]) {
        categoryCount[categoryHash] += 1;
      } else {
        await saveTestcase(comparisonResults, `output/${dirName}`);
        categoryCount[categoryHash] = 1;
      }
    }

    await page.evaluate(
      node => node.removeAttribute('accnameComparisonTarget'),
      node
    );
  }

  // All categories encountered duirng comparison and their associated counts.
  const categoryStats = Object.entries(categoryCount).map(entry => {
    return {
      category: JSON.parse(entry[0]),
      count: entry[1],
    };
  });

  const summary = {
    url: url,
    nodesOnPage: allNodes.length,
    stats: categoryStats,
  };

  // Output summary of URL comparison to file.
  fs.writeFile(
    `output/${dirName}/summary.json`,
    JSON.stringify(summary, null, 2),
    err => {
      if (err) {
        console.log('File output failed:', err);
      } else {
        console.log(`Summary for ${dirName} saved to file.`);
      }
    }
  );

  await browser.close();
  return dirName;
}

/**
 * Properties used to group similar comparison results.
 */
interface Category {
  agreement: string[][];
  rules?: string[];
  role?: string;
}

/**
 * Results from the comparison of AccName implementations.
 */
interface ComparisonResult {
  disagrees: boolean;
  accnames: {[key: string]: string};
  htmlUsed?: {[key: string]: string};
  category?: Category;
}

/**
 * Compare AccName implementations for a given DOM Node and categorise
 * that comparison.
 * @param nodeRef - A reference to the target DOM Node.
 * @param page - The page containing the target DOM Node.
 * @param client - A CDPSession for page.
 */
async function runComparison(
  nodeRef: NodeRef,
  page: Page,
  client: CDPSession
): Promise<ComparisonResult> {
  const accnames = await getAccNames(nodeRef, page, client);

  // Map each accessible name to the set of implementations that
  // produced that accessible name.
  const agreementMap: {[key: string]: string[]} = {};
  for (const [impl, name] of Object.entries(accnames)) {
    if (!agreementMap[name]) {
      agreementMap[name] = [];
    }
    agreementMap[name].push(impl);
  }
  // An agreement group is a set of implementations that agree
  // on the accessible name for the target DOM Node.
  const agreementGroups = Object.values(agreementMap).map(group => group);

  // 1 agreement group --> all implementations agree.
  if (agreementGroups.length === 1) {
    return {disagrees: false, accnames: accnames};
  }

  const category: Category = {agreement: agreementGroups};

  const rulesApplied = (await page.evaluate(
    "ourLib.getAccessibleName(document.querySelector('" +
      nodeRef.selector +
      "')).rulesApplied;"
  )) as string[];
  if (rulesApplied.length > 0) {
    category.rules = rulesApplied;
  }

  const axNode = await page.accessibility.snapshot({root: nodeRef.handle});
  if (axNode?.role) {
    category.role = axNode.role;
  }

  // Get HTML used to compute AccNames
  const htmlUsedByChrome = await getHTMLUsedByChrome(nodeRef, client, page);
  const htmlUsedByOurAccName = (await page.evaluate(
    "ourLib.getAccessibleName(document.querySelector('" +
      nodeRef.selector +
      "')).visitedHTMLSnippet;"
  )) as string;
  const htmlUsed = {
    chrome: htmlUsedByChrome,
    ourAccName: htmlUsedByOurAccName,
  };

  return {
    disagrees: true,
    accnames: accnames,
    htmlUsed: htmlUsed,
    category: category,
  };
}

/**
 * Saves a ComparisonResult to file with a unique identifying case ID.
 * @param comparisonResult - The ComparisonResult to be saved to file.
 * @param outputPath - The path to the directory in which to save the file.
 * @return The caseId for the saved testcase
 */
function saveTestcase(
  comparisonResult: ComparisonResult,
  outputPath: string
): string {
  // Random 5 character ID generated
  const caseId = Math.random().toString(36).substr(2, 5);
  const outputObj = {
    caseId: caseId,
    comparison: comparisonResult,
  };
  fs.writeFile(
    outputPath + '/case_' + caseId + '.json',
    JSON.stringify(outputObj, null, 2),
    err => {
      if (err) {
        console.log('File output failed:', err);
        throw new Error(`Error outputting file: ${err}`);
      } else {
        console.log('Case saved to file with id ' + caseId);
      }
    }
  );
  return caseId;
}

/**
 * Run a series of AccName implementations on the same node.
 * @param nodeRef - NodeRef representing the target node for comparison.
 * @param page - Page in which to run the implementations.
 * @return - A mapping from implementation name to the accessible name produced
 * by that implementation.
 */
async function getAccNames(
  nodeRef: NodeRef,
  page: Page,
  client: CDPSession
): Promise<{[key: string]: string}> {
  const accnames: {[key: string]: string} = {};

  // Chrome accname
  const getPartialAXTreeResponse = (await client.send(
    'Accessibility.getPartialAXTree',
    {
      backendNodeId: nodeRef.backendId,
      fetchRelatives: false,
    }
  )) as Protocol.Accessibility.GetPartialAXTreeResponse;
  const axNode = getPartialAXTreeResponse.nodes[0];
  accnames.chrome = axNode.name?.value ?? '';

  // Axe accname
  const axeName = (await page.evaluate(
    `axeTargetElem = axe.utils.querySelectorAll(_tree, '${nodeRef.selector}')[0];
    axe.commons.text.accessibleTextVirtual(axeTargetElem);`
  )) as string;
  accnames.axe = axeName ?? '';

  // AOM accname
  const aomName = (await page.evaluate(
    `getAOMName('${nodeRef.selector}');`
  )) as string;
  accnames.aom = aomName ?? '';

  // BG prototype accname
  const bgName = (await page.evaluate(
    `getAccName(document.querySelector('${nodeRef.selector}')).name`
  )) as string;
  accnames.bg = bgName ?? '';

  // Our accname
  const ourName = (await page.evaluate(
    `ourLib.getAccessibleName(document.querySelector('${nodeRef.selector}')).name;`
  )) as string;
  accnames.ourLib = ourName ?? '';

  return accnames;
}

/**
 * Prepare AccName implementation libraries to be run on the current page.
 * @param page - The page in which the libraries
 */
async function loadAccNameLibraries(page: Page) {
  // Load axe-core
  await page.evaluate(axe.source);
  await page.evaluate(
    'const _tree = axe.utils.getFlattenedTree(document.body);'
  );
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
    const response = await fetch(
      'https://whatsock.github.io/w3c-alternative-text-computation/Sample%20JavaScript%20Recursion%20Algorithm/recursion.js'
    );
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
