import {CDPSession, Page} from 'puppeteer';
import puppeteer from 'puppeteer';
import {Protocol} from 'devtools-protocol';
import fetch from 'node-fetch';
import {NodeRef, getNodeRefFromSelector} from './node_ref';
import {getHTMLUsed} from './html_used';
import {
  createTestcase,
  addSnippetCase,
  CasePreview,
  addPageSummary,
} from './output';

// TODO: import node package when our lib is ready,
// export .source as is done in axe.
import {ourLibSource} from './our_lib_source';
import axe from 'axe-core';

// Hard coded initialisation function simulating calls from
// backend Express server.
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
 * Compares AccName implementations on a HTML snippet containing a target element
 * identified by the presence of an 'accnameComparisonTarget' attribute.
 * @param HTMLSnippet - The HTML snippet containing the target element.
 * @return An object containing the accessible names computed by 5 different implementations
 * and, in the case that there was some disagreement between implementations, an ID
 * for the test case file containing the details of that disagreement.
 */
export async function runHTMLSnippetComparison(
  HTMLSnippet: string
): Promise<[{[implementation: string]: string}, number?]> {
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
    const casePreview = createTestcase(comparisonResults);
    addSnippetCase(casePreview);
    return [comparisonResults.accnames, casePreview.caseId];
  }

  return [comparisonResults.accnames];
}

/**
 * A summary of the comparisons performed on a web-page
 */
export interface PageSummary {
  url: string;
  nodesOnPage: number;
  stats: {category: Category; count: number}[];
  cases: CasePreview[];
}

/**
 * Compares AccName implementations on every Node in the DOM of the web page
 * at the URL provided.
 * @param url - The URL for the web page whose Nodes will be used to compare
 * AccName implementations.
 * @return The name of the directory containing the results of the URL comparison.
 */
export async function runURLComparison(url: string): Promise<number> {
  const browser = await puppeteer.launch({
    args: ['--enable-blink-features=AccessibilityObjectModel'],
  });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();

  const httpResponse = await page.goto(url);
  if (!httpResponse?.ok()) {
    throw new Error(
      `URL '${url}' could not be accessed, HTTP status: (${httpResponse?.status}) : ${httpResponse?.statusText}'`
    );
  }

  await loadAccNameLibraries(page);

  // Associates each category encountered with the number
  // of occurrences of that category
  const categoryCount: {[categoryHash: string]: number} = {};
  const cases: CasePreview[] = [];

  const allNodes = await page.$$('body *');
  for (let i = 0; i < allNodes.length; i++) {
    console.log(i + 1 + '/' + allNodes.length);
    const node = allNodes[i];

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
    if (comparisonResults.disagrees) {
      // Count category occurrences, save test case for any new categories.
      const categoryHash = JSON.stringify(comparisonResults.category);
      if (categoryCount[categoryHash]) {
        categoryCount[categoryHash] += 1;
      } else {
        const casePreview = createTestcase(comparisonResults);
        cases.push(casePreview);
        categoryCount[categoryHash] = 1;
      }
    }

    await page.evaluate(
      node => node.removeAttribute('accnameComparisonTarget'),
      node
    );
  }

  // All categories encountered duirng comparison and their associated counts.
  const categoryStats = Object.entries(categoryCount).map(entry => ({
    category: JSON.parse(entry[0]) as Category,
    count: entry[1],
  }));

  const pageSummary = {
    url: url,
    nodesOnPage: allNodes.length,
    stats: categoryStats,
    cases: cases,
  };
  const pageSummaryId = addPageSummary(pageSummary);

  await browser.close();
  return pageSummaryId;
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
export interface ComparisonResult {
  disagrees: boolean;
  accnames: {[implementation: string]: string};
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
  const agreementGroups = Object.values(agreementMap);

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

  const htmlUsed = await getHTMLUsed(nodeRef, client, page);

  return {
    disagrees: true,
    accnames: accnames,
    htmlUsed: htmlUsed,
    category: category,
  };
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
