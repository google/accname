(async () => {
  // Get Case ID from current URL
  const urlString = window.location.href;
  const caseId = urlString.substr(urlString.lastIndexOf('/') + 1);
  const rawResponse = await fetch(`http://localhost:3000/api/case/${caseId}`);
  const res = await rawResponse.json();

  const testcase = res.result;
  const accnames = testcase.accnames;

  const idContainer = getElem('caseId');
  const resultsTable = getElem('resultsTable');
  if (!idContainer || !resultsTable) throw new ElemNotFound();

  /* Display the contents of 'res': */

  idContainer.innerText = caseId;

  getElem('chromeAccName')!.innerText = '"' + accnames.chrome + '"';
  getElem('axeAccName')!.innerText = '"' + accnames.axe + '"';
  getElem('aomAccName')!.innerText = '"' + accnames.aom + '"';
  getElem('bgAccName')!.innerText = '"' + accnames.bg + '"';
  getElem('ourAccName')!.innerText = '"' + accnames.accname + '"';

  const categoryContainer = getElem('categoryTextContainer');
  const chromeCode = getElem('chromeHTML');
  const accnameCode = getElem('accnameHTML');
  const inputCode = getElem('inputHTML');
  if (!categoryContainer || !chromeCode || !accnameCode || !inputCode)
    throw new ElemNotFound();

  categoryContainer.innerText +=
    'Agreement: ' + JSON.stringify(testcase.category.agreement) + '\n';
  if (testcase.category.role) {
    categoryContainer.innerText +=
      'Role: ' + '"' + testcase.category.role + '"' + '\n';
  }
  if (testcase.category.rules) {
    categoryContainer.innerText +=
      'Rules: ' + JSON.stringify(testcase.category.rules) + '\n';
  }

  // Format for prism.js syntax highlighting
  chromeCode.innerHTML = testcase.htmlUsed.chrome.replace(/</g, '&lt;');

  accnameCode.innerHTML = testcase.htmlUsed.accname.replace(/</g, '&lt;');

  const contextHeading = getElem('contextHeading');
  if (!contextHeading) throw new ElemNotFound();

  const inputSnippet = res.context.inputSnippet ?? null;
  if (inputSnippet) {
    contextHeading.innerText = 'Input HTML Snippet';
    inputCode.innerHTML = inputSnippet.replace(/</g, '&lt;');
  }

  const targetUrl = res.context.url ?? null;
  if (targetUrl) {
    contextHeading.innerText = 'Target URL';
    inputCode.innerHTML = targetUrl;
  }

  Prism.highlightAll();
})();
