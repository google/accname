import puppeteer from 'puppeteer';
import {writeTestcase, writeSnippetCase} from './output';
import {getNodeRefFromSelector} from './node_ref';
import {loadAccNameLibraries, runComparison} from './compare';

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
