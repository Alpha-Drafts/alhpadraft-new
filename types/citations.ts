import { CITATION_STYLES } from "@/constants";

export type CitationStyleType = (typeof CITATION_STYLES)[number];

export interface CitationPositionProps {
  start: number;
  end: number;
  line: number;
  paragraph: number;
}

export interface CitationSuggestionProps {
  author: string;
  year: string;
  title: string;
  publisher: string;
  pages?: string;
  formatted: string;
}

/** Single plagiarism match from Winston (for sub-menu and highlighting). */
export interface PlagiarismIssueItem {
  startIndex: number;
  endIndex: number;
  sequence: string;
  score: number;
  sourceTitle?: string;
  sourceUrl?: string;
}

/** Single alignment issue (for sub-menu and highlighting). */
export interface AlignmentIssueItem {
  text: string;
  severity: "low" | "medium" | "high" | "very high";
  confidenceScore: string;
}

export interface CitationIssueProps {
  type:
    | "missing_citation"
    | "incorrect_format"
    | "orphaned_reference"
    | "incomplete_citation";
  position?: CitationPositionProps;
  text?: string;
  suggestion?: CitationSuggestionProps;
  suggestedFix?: string;
  severity: "low" | "medium" | "high" | "very high";
  context?: string;
  confidenceScore: string;
}

export interface CitationReferenceProps {
  author: string;
  year: string;
  title: string;
  publisher: string;
  pages?: string;
  formatted: string;
}

export interface CitationSummaryProps {
  missingCitations: number;
  incorrectFormats: number;
  orphanedReferences: number;
  incompleteCitations: number;
}

export interface CitationScoreProps {
  value: number;
  explanation: string;
}

export interface CitationAnalysisResponseProps {
  status: "success" | "error";
  message: string;
  data: {
    citationFormat: CitationStyleType;
    totalIssues: number;
    totalCitations: number;
    issues: CitationIssueProps[];
    references: CitationReferenceProps[];
    summary: CitationSummaryProps;
    score: CitationScoreProps;
  };
}

export interface CitationCheckRequestProps {
  text: string;
  citationFormat: CitationStyleType;
}

export interface CitationAnalyzeRequestProps {
  citationFormat: CitationStyleType;
}
