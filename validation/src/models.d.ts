/**
 * A preview for some test-case
 */
declare interface CasePreview {
  caseId: number;
  numAgreementGroups: number;
  role?: string;
}

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
 * A summary of the comparisons performed on a web-page
 */
declare interface UrlSummary {
  url: string;
  nodesOnPage: number;
  stats: CategoryStat[];
}

/**
 * The number of times a Category has occured on a given web-page
 * and the caseId of a test-case representing this Category.
 */
declare interface CategoryStat {
  category: Category;
  count: number;
  caseId: number;
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
  htmlUsed?: {[key: string]: string};
  category?: Category;
}
