/**
 * A preview for some UrlSummary
 */
export interface UrlSummaryPreview {
  urlSummaryId: number;
  url: string;
  percentDisagreement: number;
}

/**
 * An interface to represent preview.json
 */
export interface Preview {
  snippets: CasePreview[];
  pageSummaries: UrlSummaryPreview[];
}

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
 * A summary of the comparisons performed on a web-page
 */
export interface UrlSummary {
  url: string;
  nodesOnPage: number;
  stats: {category: Category; count: number}[];
  cases: CasePreview[];
}

/**
 * Properties used to group similar comparison results.
 */
export interface Category {
  agreement: string[][];
  rules?: string[];
  role?: string;
}

/**
 * Results from the comparison of AccName implementations.
 */
export interface ComparisonResult {
  disagrees: boolean;
  accnames: {[implementation: string]: string};
  htmlUsed?: {[implementation: string]: string};
  category?: Category;
}
