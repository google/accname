import fs from 'fs';
import path from 'path';

/**
 * Creates a new test-case from a ComparisonResult and returns
 * a CasePreview for that test-case.
 * @param comparisonResult - The ComparisonResult that will become a test-case.
 * @param context - Information relevant to the origin of this testcase (input snippet / target url).
 */
export function writeTestcase(
  comparisonResult: ComparisonResult,
  context: {[format: string]: string}
): CasePreview {
  const caseId = fs.readdirSync(path.join(__dirname, '../../output/case/'))
    .length;

  fs.writeFileSync(
    path.join(__dirname, `../../output/case/case_${caseId}.json`),
    JSON.stringify({result: comparisonResult, context}, null, 2)
  );

  const numAgreementGroups = comparisonResult.category!.agreement.length;

  if (comparisonResult.category!.role) {
    const role = comparisonResult.category!.role;
    return {caseId: caseId, numAgreementGroups: numAgreementGroups, role: role};
  }

  return {caseId: caseId, numAgreementGroups: numAgreementGroups};
}

/**
 * Add a snippet CasePreview to preview.json.
 * @param casePreview - The CasePreview to be added to preview.json
 */
export function writeSnippetCase(casePreview: CasePreview): void {
  const preview = getPreviewJson();
  preview.snippets.push(casePreview);
  fs.writeFileSync(
    path.join(__dirname, '../../output/preview.json'),
    JSON.stringify(preview, null, 2)
  );
}

/**
 * Save a given UrlSummary to file, create a preview for that
 * UrlSummary, add that preview to preview.json.
 * @param urlSummary - the UrlSummary to be saved to file and
 * added to preview.json.
 */
export function writeUrlSummary(urlSummary: UrlSummary): number {
  const urlSummaryId = fs.readdirSync(
    path.join(__dirname, '../../output/url_summary/')
  ).length;

  fs.writeFileSync(
    path.join(
      __dirname,
      `../../output/url_summary/summary_${urlSummaryId}.json`
    ),
    JSON.stringify(urlSummary, null, 2)
  );

  // Cut down on url text for easier display (as in Chrome URL bar)
  const urlPreview = urlSummary.url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');

  // The total disagreements is the sum of occurrences of each category of disagreement
  const totalDisagreements = urlSummary.stats.reduce(
    (sum, stat) => sum + stat.count,
    0
  );

  const urlSummaryPreview = {
    urlSummaryId: urlSummaryId,
    url: urlPreview,
    percentDisagreement: (totalDisagreements / urlSummary.nodesOnPage) * 100,
  };

  const preview = getPreviewJson();
  preview.pageSummaries.push(urlSummaryPreview);
  fs.writeFileSync(
    path.join(__dirname, '../../output/preview.json'),
    JSON.stringify(preview, null, 2)
  );

  return urlSummaryId;
}

export function writeWPTResults(wptResults: WPTResults) {
  const wptResultId = fs.readdirSync(
    path.join(__dirname, '../../output/wpt_result/')
  ).length;

  fs.writeFileSync(
    path.join(__dirname, `../../output/wpt_result/wpt_${wptResultId}.json`),
    JSON.stringify(wptResults, null, 2)
  );

  const wptResultPreview = {
    wptResultId: wptResultId,
    percentIncorrect: (wptResults.totalIncorrect / wptResults.testsRun) * 100,
  };

  const preview = getPreviewJson();
  preview.wptResults.push(wptResultPreview);
  fs.writeFileSync(
    path.join(__dirname, '../../output/preview.json'),
    JSON.stringify(preview, null, 2)
  );

  return wptResultId;
}

/**
 * If preview.json exists:
 * > returns the contents of preview.json
 *
 * Otherwise:
 * > returns an empty Preview to be saved to file.
 */
function getPreviewJson(): Preview {
  try {
    const previewRaw = fs.readFileSync(
      path.join(__dirname, '../../output/preview.json')
    );
    return JSON.parse(previewRaw.toString());
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {snippets: [], pageSummaries: [], wptResults: []};
    } else {
      throw err;
    }
  }
}
