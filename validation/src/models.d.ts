/**
 * Properties used to group similar comparison results.
 */
declare interface Category {
  agreement: string[][];
  rules?: string[];
  role?: string;
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
 * A summary of the comparisons performed on a web-page
 */
declare interface UrlSummary {
  url: string;
  nodesOnPage: number;
  stats: CategoryStat[];
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

declare interface WPTComparison {
  correctName: string;
  accnames: {[impl: string]: string};
  incorrectImpls: string[];
  testURL: string;
}

declare interface WPTResults {
  testsRun: number;
  totalIncorrect: number;
  implPerformance: {[impl: string]: number};
  testResults: WPTComparison[];
}

declare interface WPTResultPreview {
  wptResultId: number;
  percentIncorrect: number;
}

/**
 * An interface to represent preview.json
 */
declare interface Preview {
  snippets: CasePreview[];
  pageSummaries: UrlSummaryPreview[];
  wptResults: WPTResultPreview[];
}
