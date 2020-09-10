import {CDPSession, Page} from 'puppeteer';
import puppeteer from 'puppeteer';
import {Protocol} from 'devtools-protocol';
import fetch from 'node-fetch';
import {NodeRef, getNodeRefFromSelector} from './node_ref';
import {getHTMLUsed} from './html_used';
import {writeTestcase, writeSnippetCase, writeUrlSummary} from './output';

import axe from 'axe-core';

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

  const targetNodeRef = await getNodeRefFromSelector('[ac]', client, page);

  const comparisonResults = await runComparison(targetNodeRef, page, client);
  await browser.close();
  if (comparisonResults.disagrees) {
    const casePreview = writeTestcase(comparisonResults, {
      inputSnippet: HTMLSnippet,
    });
    writeSnippetCase(casePreview);
    return [comparisonResults.accnames, casePreview.caseId];
  }

  return [comparisonResults.accnames];
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
  const cases: number[] = [];

  const allNodes = await page.$$('body *');
  for (let i = 0; i < allNodes.length; i++) {
    console.log(i + 1 + '/' + allNodes.length);
    const node = allNodes[i];

    await page.evaluate(
      node => node.setAttribute('accnameComparisonTarget', 'true'),
      node
    );

    let successfullyCompared = false;
    let comparisonAttempts = 0;
    while (!successfullyCompared && comparisonAttempts < 3) {
      try {
        const targetNodeRef = await getNodeRefFromSelector(
          '[accnameComparisonTarget]',
          client,
          page
        );

        const comparisonResults = await runComparison(
          targetNodeRef,
          page,
          client
        );
        if (comparisonResults.disagrees) {
          // Count category occurrences, save test case for any new categories.
          const categoryHash = JSON.stringify(comparisonResults.category);
          if (categoryCount[categoryHash]) {
            categoryCount[categoryHash] += 1;
          } else {
            const casePreview = writeTestcase(comparisonResults, {url: url});
            cases.push(casePreview.caseId);
            categoryCount[categoryHash] = 1;
          }
        }
        successfullyCompared = true;
      } catch (error) {
        ++comparisonAttempts;
        console.log(
          `Error: ${error}, ${comparisonAttempts} attempts made, trying again.\n`
        );
      }
    }
    if (!successfullyCompared) {
      const skippedNodeOuterHTML = await page.evaluate(
        node => node.outerHTML,
        node
      );
      console.log(
        `Skipping node comparison for node with the following outerHTML after ${comparisonAttempts} attempts:\n\n${skippedNodeOuterHTML}\n`
      );
    }

    await page.evaluate(
      node => node.removeAttribute('accnameComparisonTarget'),
      node
    );
  }

  // All categories encountered duirng comparison and their associated counts.
  const categoryStats = Object.entries(categoryCount).map((entry, i) => ({
    category: JSON.parse(entry[0]) as Category,
    count: entry[1],
    caseId: cases[i],
  }));

  const pageSummary: UrlSummary = {
    url: url,
    nodesOnPage: allNodes.length,
    stats: categoryStats,
  };
  const pageSummaryId = writeUrlSummary(pageSummary);

  await browser.close();
  return pageSummaryId;
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
  const agreementMap: {[implementation: string]: string[]} = {};
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
    `Array.from(accname.getNameComputationDetails(document.querySelector('${nodeRef.selector}')).rulesApplied);`
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
): Promise<{[implementation: string]: string}> {
  // Maps an implementation to the accessible name output by
  // that implementation
  const implToName: {[implementation: string]: string} = {};

  // Chrome accname
  const getPartialAXTreeResponse = (await client.send(
    'Accessibility.getPartialAXTree',
    {
      backendNodeId: nodeRef.backendId,
      fetchRelatives: false,
    }
  )) as Protocol.Accessibility.GetPartialAXTreeResponse;
  const axNode = getPartialAXTreeResponse.nodes[0];
  implToName.chrome = axNode.name?.value ?? '';

  // Axe accname
  const axeName = (await page.evaluate(
    `axeTargetElem = axe.utils.querySelectorAll(_tree, '${nodeRef.selector}')[0];
    axe.commons.text.accessibleTextVirtual(axeTargetElem);`
  )) as string;
  implToName.axe = axeName ?? '';

  // AOM accname
  const aomName = (await page.evaluate(
    `getAOMName('${nodeRef.selector}');`
  )) as string;
  implToName.aom = aomName ?? '';

  // BG prototype accname
  const bgName = (await page.evaluate(
    `getAccName(document.querySelector('${nodeRef.selector}')).name`
  )) as string;
  implToName.bg = bgName ?? '';

  // Our accname
  const accnameName = (await page.evaluate(
    `accname.getAccessibleName(document.querySelector('${nodeRef.selector}'));`
  )) as string;
  implToName.accname = accnameName ?? '';

  return implToName;
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

  // Load AccName from github repo
  const accnameSource = await (async () => {
    const response = await fetch(
      'https://raw.githubusercontent.com/googleinterns/accessible-name/master/bundle.js'
    );
    const responseBody = await response.text();
    return responseBody;
  })();
  await page.evaluate(accnameSource);
}
