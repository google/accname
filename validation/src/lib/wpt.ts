import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import {JSDOM} from 'jsdom';
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
  const client = await page.target().createCDPSession();

  const response = await fetch('http://wpt.live/accname/');
  const responseBody = await response.text();
  const testListDom = new JSDOM(responseBody);
  // Generate the URLs to each test listed on wpt.live/accname
  const nameTestUrls = Array.from(
    testListDom.window.document.querySelectorAll('a')
  )
    .filter(node => node.href.slice(0, 4) === 'name')
    .map(node => `http://wpt.live/accname/${node.href}`);

  const performance: {[impl: string]: number} = {};
  let totalTests = 0;
  let totalIncorrect = 0;
  const testComparisons = new Array<WPTComparison>();

  let i = 0;
  for (const url of nameTestUrls) {
    console.log(++i, '/', nameTestUrls.length);
    const testRes = await fetch(url);
    const testResText = await testRes.text();
    // Parse test page using JSDOM
    const testDom = new JSDOM(testResText);
    const scripts = testDom.window.document.scripts;
    const scriptText = scripts.item(scripts.length - 1)?.text;
    if (scriptText) {
      // Get correct name from JSON data in <script> tag of test page.
      const jsonBegins = scriptText.indexOf('ATTAcomm(') + 9;
      const jsonEnds = scriptText.lastIndexOf(')');
      const testObj = JSON.parse(scriptText.substring(jsonBegins, jsonEnds));
      const correctName = testObj.steps[0].test.ATK[0][3];
      try {
        // Load test input data into puppeteer browser, using #test as target element.
        await page.goto(
          'data:text/html,' + testDom.window.document.body.innerHTML
        );
        await loadAccNameLibraries(page);
        const targetNode = await getNodeRefFromSelector('#test', client, page);
        const res = await runComparison(targetNode, page, client);

        const incorrectImpls = new Array<string>();

        // Identify implementations that got the incorrect accessible name
        for (const [impl, name] of Object.entries(res.accnames)) {
          if (name !== correctName) {
            incorrectImpls.push(impl);
            performance[impl]
              ? (performance[impl] += 1)
              : (performance[impl] = 1);
          }
        }

        if (incorrectImpls.length > 0) {
          totalIncorrect += 1;
        }

        const testComparison = {
          correctName: correctName,
          accnames: res.accnames,
          incorrectImpls: incorrectImpls,
          testURL: url,
        };
        testComparisons.push(testComparison);

        totalTests += 1;
      } catch (error) {
        console.log(
          `Skipped test at ${url} due to the following error:\n\n${error}`
        );
      }
    }
  }

  const results = {
    testsRun: totalTests,
    totalIncorrect: totalIncorrect,
    implPerformance: performance,
    testResults: testComparisons,
  };

  const resultId = writeWPTResults(results);
  return resultId;
}
