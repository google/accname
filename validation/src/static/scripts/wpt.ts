(async () => {
  const getElem = (id: string) => document.getElementById(id);

  // Get results from backend
  const urlString = window.location.href;
  const wptId = urlString.substr(urlString.lastIndexOf('/') + 1);
  const rawResponse = await fetch(`http://localhost:3000/api/wpt/${wptId}`);
  const wptResults: WPTResults = await rawResponse.json();

  const numTests = getElem('numTests');
  if (!numTests) return;

  numTests.innerHTML = `${wptResults.testsRun}`;

  const chromePerfElem = getElem('chromePerf');
  const axePerfElem = getElem('axePerf');
  const aomPerfElem = getElem('aomPerf');
  const bgPerfElem = getElem('bgPerf');
  const accnamePerfElem = getElem('accnamePerf');
  if (
    !chromePerfElem ||
    !axePerfElem ||
    !aomPerfElem ||
    !bgPerfElem ||
    !accnamePerfElem
  )
    throw new ElemNotFound();

  // Returns the % tests passed
  const getPerformance = (numIncorrect: number): number => {
    return Math.round((1 - numIncorrect / wptResults.testsRun) * 100);
  };

  // Lowest % tests passed amonst the implementation
  const minPerf = getPerformance(
    // (max tests failed --> fewest tests passed)
    Math.max(...Array.from(Object.values(wptResults.implPerformance)))
  );

  // Highest % tests passed amonst the implementation
  const maxPerf = getPerformance(
    // (min tests failed --> most tests passed)
    Math.min(...Array.from(Object.values(wptResults.implPerformance)))
  );

  // Returns a colour code between red and green for a given performance.
  const getColourCode = (perf: number): string => {
    const z = ((perf - minPerf) / (maxPerf - minPerf)) * 240;
    let a, b;
    if (z < 120) {
      a = 255;
      b = z;
    } else {
      a = 240 - z;
      b = 255;
    }
    return `rgb(${120 + a}, ${120 + b}, 120)`;
  };

  // Get performance measures
  const chromePerf = getPerformance(wptResults.implPerformance.chrome);
  const axePerf = getPerformance(wptResults.implPerformance.axe);
  const aomPerf = getPerformance(wptResults.implPerformance.aom);
  const bgPerf = getPerformance(wptResults.implPerformance.bg);
  const accnamePerf = getPerformance(wptResults.implPerformance.accname);

  // Display performance measures
  chromePerfElem.innerText = chromePerf.toString();
  axePerfElem.innerText = axePerf.toString();
  aomPerfElem.innerText = aomPerf.toString();
  bgPerfElem.innerText = bgPerf.toString();
  accnamePerfElem.innerText = accnamePerf.toString();

  // Colour-code performance
  chromePerfElem.style.setProperty('background', getColourCode(chromePerf));
  axePerfElem.style.setProperty('background', getColourCode(axePerf));
  aomPerfElem.style.setProperty('background', getColourCode(aomPerf));
  bgPerfElem.style.setProperty('background', getColourCode(bgPerf));
  accnamePerfElem.style.setProperty('background', getColourCode(accnamePerf));

  const resultsTable = getElem('resultsTable');
  if (!resultsTable) return;

  // Display results in table
  for (const result of wptResults.testResults) {
    const testName = result.testURL.substring(
      result.testURL.lastIndexOf('/') + 1,
      result.testURL.lastIndexOf('.html')
    );
    const compressedTestName =
      testName.slice(0, 25) + '\n' + testName.slice(25);

    resultsTable.innerHTML += `
      <tr class="${result.incorrectImpls.length === 0 ? 'passed' : 'failed'}">
        <td style="overflow-wrap: break-word;"><a href="${
          result.testURL
        }">${compressedTestName}</a></td>
        <td>"${result.correctName}"</td>
        <td>${getFormattedAccnamesHTML(
          result.accnames,
          result.incorrectImpls
        )}</td>
      </tr>
    `;
  }
})();

/**
 * Generates HTML to highlight in red any implmenetations that got the incorrect
 * accessible name for a given WPT.
 * @param accnames - Map from implementation name -> accname output.
 * @param incorrectImpls - A list of implementations that produced an incorrect accessible name.
 */
function getFormattedAccnamesHTML(
  accnames: {[impl: string]: string},
  incorrectImpls: string[]
) {
  let htmlString = '';
  for (const [impl, name] of Object.entries(accnames)) {
    if (incorrectImpls.includes(impl)) {
      htmlString += '<div class="incorrect" style="margin-bottom: 5px">';
    } else {
      htmlString += '<div style="margin-bottom: 5px">';
    }
    htmlString += `<strong style="margin-right: 5px;">${impl}</strong>"${name}"</div>`;
  }
  return htmlString;
}
