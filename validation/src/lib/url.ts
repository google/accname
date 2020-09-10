import puppeteer from 'puppeteer';
import {writeTestcase, writeUrlSummary} from './output';
import {getNodeRefFromSelector} from './node_ref';
import {loadAccNameLibraries, runComparison} from './compare';

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
        const casePreview = writeTestcase(comparisonResults, {url: url});
        cases.push(casePreview.caseId);
        categoryCount[categoryHash] = 1;
      }
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
