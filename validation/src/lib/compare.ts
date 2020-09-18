import {CDPSession, Page} from 'puppeteer';
import {Protocol} from 'devtools-protocol';
import fetch from 'node-fetch';
import {NodeRef} from './node_ref';
import {getHTMLUsed} from './html_used';
import axe from 'axe-core';

/**
 * Compare AccName implementations for a given DOM Node and categorise
 * that comparison.
 * @param nodeRef - A reference to the target DOM Node.
 * @param page - The page containing the target DOM Node.
 * @param client - A CDPSession for page.
 */
export async function runComparison(
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
export async function loadAccNameLibraries(page: Page) {
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
