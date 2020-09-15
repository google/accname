import puppeteer from 'puppeteer';
import {loadAccNameLibraries, runComparison} from './compare';
import {getNodeRefFromSelector} from './node_ref';
import {writeWPTResults} from './output';

/**
 * Runs each of the implementations on every Web Platform Test
 * at http://wpt.live/accname/.
 * Returns an ID number for the results to the tests.
 */
export async function runWPT(): Promise<number> {
  const browser = await puppeteer.launch({
    args: ['--enable-blink-features=AccessibilityObjectModel'],
  });
  const page = await browser.newPage();
  await page.goto('http://wpt.live/accname/');

  // Get a list of URLs for the accname tests
  const nameTestUrls = (await page.evaluate(
    `Array.from(document.querySelectorAll('a'))
    .map(node => node.href)
    .filter(href => href.includes('accname/name'));`
  )) as string[];

  // Metrics
  const implToNumTestsFailed: {[impl: string]: number} = {};
  let numTestsRun = 0;
  let totalIncorrect = 0;
  const testComparisons = new Array<WPTComparison>();

  for (const url of nameTestUrls) {
    try {
      await page.goto(url);
      const client = await page.target().createCDPSession();
      await loadAccNameLibraries(page);
      // Target node identified by #test for each WPT
      const targetNode = await getNodeRefFromSelector('#test', client, page);
      const comparison = await runComparison(targetNode, page, client);

      // Correct name for a given test is stored in a 'theTest' object
      // in a <script> tag in the <head> of each WPT page.
      const correctName = (await page.evaluate(
        'theTest.Tests[0].test.ATK[0][3];'
      )) as string;

      const incorrectImpls = new Array<string>();
      // Identify implementations that got the incorrect accessible name
      for (const [impl, name] of Object.entries(comparison.accnames)) {
        if (name !== correctName) {
          incorrectImpls.push(impl);
          implToNumTestsFailed[impl]
            ? (implToNumTestsFailed[impl] += 1)
            : (implToNumTestsFailed[impl] = 1);
        }
      }

      if (incorrectImpls.length > 0) {
        totalIncorrect += 1;
      }

      testComparisons.push({
        correctName: correctName,
        accnames: comparison.accnames,
        incorrectImpls: incorrectImpls,
        testURL: url,
      });

      numTestsRun += 1;
      console.log(`${numTestsRun}/${nameTestUrls.length}`);
    } catch (error) {
      console.log(
        `Skipped test at ${url} due to the following error:\n\n${error}`
      );
    }
  }

  // Results & performance for all WPTs at wpt.live/accname
  const results = {
    testsRun: numTestsRun,
    totalIncorrect: totalIncorrect,
    implPerformance: implToNumTestsFailed,
    testResults: testComparisons,
  };

  const resultId = writeWPTResults(results);
  return resultId;
}
