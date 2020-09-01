(async () => {
  const getElem = (id: string) => document.getElementById(id);

  const urlString = window.location.href;
  const summaryId = urlString.substr(urlString.lastIndexOf('/') + 1);
  const rawResponse = await fetch(
    `http://localhost:3000/api/summary/${summaryId}`
  );
  const summary: UrlSummary = await rawResponse.json();

  const urlContainer = getElem('urlContainer');
  const numNodesContainer = getElem('numNodes');
  const categoryTable = getElem('categoryTable');
  if (!urlContainer || !numNodesContainer || !categoryTable)
    throw new ElemNotFound();

  urlContainer.innerHTML = `<a href="${summary.url}" target="_blank">${summary.url}</a>`;
  numNodesContainer.innerText = summary.nodesOnPage.toString();

  const stats = summary.stats.sort((a, b) => b.count - a.count);

  for (const stat of stats) {
    const categoryString = getFormattedCategoryHTML(stat.category);

    // Add a row of generated HTML to the category table.
    categoryTable.innerHTML += `
      <tr>
        <td>${categoryString}</td>
        <td style="text-align:center;">${stat.count}</td>
        <td>
          <a href="/case/${stat.caseId}" target="_blank" rel="noopener noreferrer" class="invisibleLink" aria-label="View case ${stat.caseId}">
            <div class="previewCard" style="margin:0;">
              Case ${stat.caseId}
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" style="margin-left:auto;">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="white"/>
              </svg>
            </div>
          </a>
        </td>
      </tr>
    `;
  }
})();

/**
 * Generates a string of HTML containing a formatted
 * representation of the Category provided.
 * @param category - The Category to be formatted
 */
function getFormattedCategoryHTML(category: Category): string {
  let categoryString =
    '<strong>Agreement:</strong> ' +
    JSON.stringify(category.agreement) +
    '<br/>';
  if (category.role) {
    categoryString +=
      '<strong>Role:</strong> ' + '"' + category.role + '"' + '<br/>';
  }
  if (category.rules) {
    categoryString +=
      '<strong>Rules:</strong> ' + JSON.stringify(category.rules) + '<br/>';
  }
  return categoryString;
}
