export interface GrammarError {
  id: string;
  errorText: string;
  suggestion: string;
  context: string;
  type: "grammar" | "spelling" | "style" | "punctuation";
  fixed: boolean;
  ignored: boolean;
}
