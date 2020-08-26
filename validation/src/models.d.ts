declare interface CasePreview {
  caseId: number;
  numAgreementGroups: number;
  role?: string;
}

declare interface UrlSummaryPreview {
  urlSummaryId: number;
  url: string;
  percentDisagreement: number;
}

declare interface Preview {
  snippets: CasePreview[];
  pageSummaries: UrlSummaryPreview[];
}

declare interface UrlSummary {
  url: string;
  nodesOnPage: number;
  stats: {
    category: Category;
    count: number;
  }[];
  cases: CasePreview[];
}

declare interface Category {
  agreement: string[][];
  rules?: string[];
  role?: string;
}

declare interface ComparisonResult {
  disagrees: boolean;
  accnames: {[implementation: string]: string};
  htmlUsed?: {[key: string]: string};
  category?: Category;
}
