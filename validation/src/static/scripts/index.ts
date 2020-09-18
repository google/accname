let editor: CodeMirror.EditorFromTextArea;

window.onload = async () => {
  // input textarea must be visible to set CodeMirror text editor up.
  const snippetComparison = getElem('snippetComparison');
  if (!snippetComparison) throw new ElemNotFound();
  snippetComparison.classList.add('visible');

  const snippetInput = getElem('snippetInput') as HTMLTextAreaElement;
  if (!snippetInput) throw new ElemNotFound();
  editor = CodeMirror.fromTextArea(snippetInput, {
    lineNumbers: true,
    lineWrapping: true,
    mode: 'text/html',
  });
  snippetComparison.classList.remove('visible');

  try {
    await displayPreview();
  } catch (error) {
    console.log('No Comparisons have been made yet');
  }
};

/**
 * Sends call to run a snippet comparison on provided input.
 * Displays results of that comparison.
 */
const getSnippetComparison = async () => {
  const resultsTable = getElem('resultsTable');
  const resultsContainer = getElem('snippetResults');
  if (!resultsTable || !resultsContainer || !editor) throw new ElemNotFound();

  resultsTable.classList.add('hidden');
  resultsContainer.innerHTML = '';

  // Adds an animated CSS Loading Spinner
  const spinner = document.createElement('div');
  spinner.classList.add('loader');
  resultsContainer.append(spinner);

  const rawResponse = await fetch(
    'http://localhost:3000/api/runSnippetComparison',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({snippet: editor.getValue()}),
    }
  );

  // Remove spinner once we get a response
  spinner.remove();
  // Display results in table if response is OK
  if (rawResponse.status === 200) {
    const comparisonResults = await rawResponse.json();
    const accnames = comparisonResults[0];

    getElem('chromeAccName')!.innerText = '"' + accnames.chrome + '"';
    getElem('axeAccName')!.innerText = '"' + accnames.axe + '"';
    getElem('aomAccName')!.innerText = '"' + accnames.aom + '"';
    getElem('bgAccName')!.innerText = '"' + accnames.bg + '"';
    getElem('ourAccName')!.innerText = '"' + accnames.accname + '"';

    resultsTable.classList.remove('hidden');

    if (comparisonResults[1]) {
      const caseId = comparisonResults[1];

      resultsContainer.innerHTML += `
        <div class="bluetext comparisonResultText">A test-case was generated as a result of this comparison - <a class="linkBtn" href="/case/${caseId}">View Test-case ${caseId}</a></div>
      `;
    }
    await displayPreview();
  } else if (rawResponse.status === 400) {
    resultsContainer.innerHTML =
      "<div class=\"redtext comparisonResultText\">No target element found. Make sure to mark your target element with an 'ac' attribute if you haven't!<br/>e.g. &lt;div ac&gt;Hello world&lt;/div&gt;</div>";
  } else {
    resultsContainer.innerHTML =
      '<div class="redtext comparisonResultText">An error occurred on the server. Check terminal for details.</div>';
  }
};

/**
 * Sends call to run a URL comparison on provided input URL.
 * Displays results of that comparison.
 */
const getURLComparison = async () => {
  const urlInput = getElem('urlInput') as HTMLInputElement;
  const urlResults = getElem('urlResults');
  if (!urlInput || !urlResults) throw new ElemNotFound();
  urlResults.innerHTML = '';

  // Adds an animated CSS Loading Spinner
  const spinner = document.createElement('div');
  spinner.classList.add('loader');
  urlResults.append(spinner);

  const url = urlInput.value;
  const rawResponse = await fetch(
    'http://localhost:3000/api/runURLComparison',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({url: url}),
    }
  );

  // Remove spinner once we get a response
  spinner.remove();
  if (rawResponse.status === 200) {
    const summaryId = await rawResponse.json();
    urlResults.innerHTML = `<div class="bluetext comparisonResultText">View the comparison results for ${url} - <a class="linkBtn" href="/summary/${summaryId}">Summary ${summaryId}</a></div>`;
    await displayPreview();
  } else {
    const error = await rawResponse.json();
    urlResults.innerHTML = `<div class="redtext comparisonResultText">Error: ${error.message}</div>`;
  }
};

const getWPTComparison = async () => {
  const wptResults = getElem('wptResults');
  if (!wptResults) return;

  // Adds an animated CSS Loading Spinner
  const spinner = document.createElement('div');
  spinner.classList.add('loader');
  wptResults.append(spinner);

  const rawResponse = await fetch(
    'http://localhost:3000/api/runWPTComparison',
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );

  // Remove spinner once we get a response
  spinner.remove();

  if (rawResponse.status === 200) {
    const wptResultId = await rawResponse.json();
    wptResults.innerHTML = `<div class="bluetext comparisonResultText">View the results for the Web Platform Tests comparison - <a href="/wpt/${wptResultId}" class="linkBtn">Run ${wptResultId}</a></div>`;
  } else if (rawResponse.status === 400) {
    const error = await rawResponse.json();
    wptResults.innerHTML = `<div class="redtext comparisonResultText">Error: ${error.message}</div>`;
  }
};

/**
 * Displays the contents of preview.json in the 'Comparison History' section.
 * @param preview - the Preview to be displayed under 'Comparison History'
 */
async function displayPreview() {
  // Get 'Preview' to display under 'Comparison History'
  const rawResponse = await fetch('http://localhost:3000/api/preview');
  const preview = (await rawResponse.json()) as Preview;

  const snippetContainer = getElem('snippetPreviews');
  const summaryContainer = getElem('summaryPreviews');
  const wptContainer = getElem('wptPreviews');
  if (!snippetContainer || !summaryContainer || !wptContainer)
    throw new ElemNotFound();

  // Empty preview containers to prevent duplicate cards
  snippetContainer.innerHTML = '';
  summaryContainer.innerHTML = '';
  wptContainer.innerHTML = '';

  for (const snippet of preview.snippets) {
    // Sort the snippet cases from recent -> old
    snippetContainer.innerHTML =
      `<a href="/case/${
        snippet.caseId
      }" class="invisibleLink"><div class="previewCard">Case ${
        snippet.caseId
      } <span>${snippet.role ? `(${snippet.role})` : ''}</span></div></a>` +
      snippetContainer.innerHTML;
  }

  for (const summary of preview.pageSummaries) {
    const disagreement = Math.round(summary.percentDisagreement);
    // Sort the summaries from recent -> old
    summaryContainer.innerHTML =
      `<a href="/summary/${summary.urlSummaryId}" class="invisibleLink"><div class="previewCard">${summary.url} <span>${disagreement}%</span></div></a>` +
      summaryContainer.innerHTML;
  }

  for (const wptResult of preview.wptResults) {
    wptContainer.innerHTML += `<a href="/wpt/${
      wptResult.wptResultId
    }" class="invisibleLink"><div class="previewCard">Run ${
      wptResult.wptResultId
    } <span>${100 - Math.round(wptResult.percentIncorrect)}%</span></div></a>`;
  }
}

/**
 * Toggles the visibility of a given comparison section.
 * @param idref - An idref for the comparison section whose visibility should change.
 * @param targetButton - The button that toggles the visibility of the section with id of idref.
 */
function toggleComparisonSectionVisibility(
  idref: string,
  targetButton: HTMLButtonElement
) {
  const targetSection = getElem(idref);
  if (!targetSection) throw new ElemNotFound();
  const targetWasVisible = targetSection.classList.contains('visible');
  // Make all other comparison sections invisible.
  document.querySelectorAll('.comparisonSection').forEach(section => {
    section.classList.remove('visible');
    section.classList.add('hidden');
  });
  if (!targetWasVisible) {
    targetSection.classList.remove('hidden');
    targetSection.classList.add('visible');
  }

  // Indicate visually that targetButton has been pressed, and that the
  // associated comparison section is selected, by darkening the background for
  // targetButton and lightening the background for all other buttons matching '.chooseComparisonBtn'.
  document.querySelectorAll('.chooseComparisonBtn').forEach(button => {
    if (button instanceof HTMLButtonElement) {
      button.style.background = '#C9805C';
    }
  });

  if (!targetWasVisible) {
    targetButton.style.background = '#8d593f';
  } else {
    targetButton.style.background = '#C9805C';
  }
}
