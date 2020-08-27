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

  urlContainer.innerText = summary.url;
  numNodesContainer.innerText = summary.nodesOnPage.toString();

  const stats = summary.stats.sort(compareStats);

  for (let i = 0; i < stats.length; ++i) {
    const stat = stats[i];
    const categoryString = getFormattedCategoryHTML(stat.category);

    // Add a row of generated HTML to the category table.
    categoryTable.innerHTML += `
      <tr>
        <td>${categoryString}</td>
        <td style="text-align:center;">${stat.count}</td>
        <td><a href="/case/${stat.caseId}" class="invisibleLink" aria-label="View case ${stat.caseId}"><div class="previewCard" style="margin:0;">Case ${stat.caseId} <span style="margin-left:auto;">🡆</span></div></a></td>
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

/**
 * Compare two category stats in terms of their count properties
 */
function compareStats(a: CategoryStat, b: CategoryStat): number {
  if (a.count < b.count) {
    return 1;
  }
  if (a.count > b.count) {
    return -1;
  }
  return 0;
}
