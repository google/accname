import {ComparisonResult, UrlSummary} from './compare';
import fs from 'fs';

/**
 * A preview for some test-case
 */
export interface CasePreview {
  caseId: number;
  // Less agreement groups --> more agreement amongst implementations.
  // This property can be used to colour-code cases.
  numAgreementGroups: number;
  role?: string;
}

/**
 * Creates a new test-case from a ComparisonResult and returns
 * a CasePreview for that test-case.
 * @param comparisonResult - The ComparisonResult that will become a test-case
 */
export function writeTestcase(comparisonResult: ComparisonResult): CasePreview {
  const caseId = fs.readdirSync('./output/case/').length;

  fs.writeFileSync(
    `./output/case/case_${caseId}.json`,
    JSON.stringify(comparisonResult, null, 2)
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
  fs.writeFileSync('./output/preview.json', JSON.stringify(preview));
}

/**
 * Save a given UrlSummary to file, create a preview for that
 * UrlSummary, add that preview to preview.json.
 * @param urlSummary - the UrlSummary to be saved to file and
 * added to preview.json.
 */
export function writeUrlSummary(urlSummary: UrlSummary): number {
  const urlSummaryId = fs.readdirSync('./output/url_summary/').length;

  fs.writeFileSync(
    `./output/url_summary/summary_${urlSummaryId}.json`,
    JSON.stringify(urlSummary, null, 2)
  );

  // Cut down on url text for easier display (as in Chrome URL bar)
  const urlPreview = urlSummary.url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');

  const urlSummaryPreview = {
    urlSummaryId: urlSummaryId,
    url: urlPreview,
    percentDisagreement:
      (urlSummary.cases.length / urlSummary.nodesOnPage) * 100,
  };

  const preview = getPreviewJson();
  preview.pageSummaries.push(urlSummaryPreview);
  fs.writeFileSync('./output/preview.json', JSON.stringify(preview, null, 2));

  return urlSummaryId;
}

/**
 * A preview for some UrlSummary
 */
interface UrlSummaryPreview {
  urlSummaryId: number;
  url: string;
  percentDisagreement: number;
}

/**
 * An interface to represent preview.json
 */
interface Preview {
  snippets: CasePreview[];
  pageSummaries: UrlSummaryPreview[];
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
    const previewRaw = fs.readFileSync('./output/preview.json');
    return JSON.parse(previewRaw.toString());
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {snippets: [], pageSummaries: []};
    } else {
      throw err;
    }
  }
}
