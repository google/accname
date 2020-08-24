/**
 * A preview for some UrlSummary
 */
declare interface UrlSummaryPreview {
  urlSummaryId: number;
  url: string;
  percentDisagreement: number;
}

/**
 * An interface to represent preview.json
 */
declare interface Preview {
  snippets: CasePreview[];
  pageSummaries: UrlSummaryPreview[];
}

/**
 * A preview for some test-case
 */
declare interface CasePreview {
  caseId: number;
  // Less agreement groups --> more agreement amongst implementations.
  // This property can be used to colour-code cases.
  numAgreementGroups: number;
  role?: string;
}

/**
 * A summary of the comparisons performed on a web-page
 */
declare interface UrlSummary {
  url: string;
  nodesOnPage: number;
  stats: {category: Category; count: number}[];
  cases: CasePreview[];
}

/**
 * Properties used to group similar comparison results.
 */
declare interface Category {
  agreement: string[][];
  rules?: string[];
  role?: string;
}

/**
 * Results from the comparison of AccName implementations.
 */
declare interface ComparisonResult {
  disagrees: boolean;
  accnames: {[implementation: string]: string};
  htmlUsed?: {[implementation: string]: string};
  category?: Category;
}
