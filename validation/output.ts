import {ComparisonResult, PageSummary} from './compare';
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
export function createTestcase(
  comparisonResult: ComparisonResult
): CasePreview {
  const caseId = fs.readdirSync('./output/case/').length;

  fs.writeFile(
    `./output/case/case_${caseId}.json`,
    JSON.stringify(comparisonResult, null, 2),
    err => {
      if (err) {
        console.log('File output failed:', err);
        throw new Error(`Error outputting file: ${err}`);
      } else {
        console.log('Case saved to file with id ' + caseId);
      }
    }
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
export function addSnippetCase(casePreview: CasePreview): void {
  const preview = getPreviewJson();
  preview.snippets.push(casePreview);
  fs.writeFileSync('./output/preview.json', JSON.stringify(preview));
}

/**
 * Save a given PageSummary to file, create a preview for that
 * PageSummary, add that preview to preview.json.
 * @param pageSummary - the PageSummary to be saved to file and
 * added to preview.json.
 */
export function addPageSummary(pageSummary: PageSummary): number {
  const pageSummaryId = fs.readdirSync('./output/summary/').length;

  fs.writeFile(
    `./output/summary/summary_${pageSummaryId}.json`,
    JSON.stringify(pageSummary, null, 2),
    err => {
      if (err) {
        console.log('File output failed:', err);
        throw new Error(`Error outputting file: ${err}`);
      } else {
        console.log('Summary saved to file with id ' + pageSummaryId);
      }
    }
  );

  // Cut down on url text for easier display (as in Chrome URL bar)
  const urlPreview = pageSummary.url.replace(
    /^(?:https?:\/\/)?(?:www\.)?/i,
    ''
  );

  const pageSummaryPreview = {
    pageSummaryId: pageSummaryId,
    url: urlPreview,
    percentDisagreement:
      (pageSummary.cases.length / pageSummary.nodesOnPage) * 100,
  };

  const preview = getPreviewJson();
  preview.pageSummaries.push(pageSummaryPreview);
  fs.writeFileSync('./output/preview.json', JSON.stringify(preview, null, 2));

  return pageSummaryId;
}

/**
 * A preview for some PageSummary
 */
interface PageSummaryPreview {
  pageSummaryId: number;
  url: string;
  percentDisagreement: number;
}

/**
 * An interface to represent preview.json
 */
interface Preview {
  snippets: CasePreview[];
  pageSummaries: PageSummaryPreview[];
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
