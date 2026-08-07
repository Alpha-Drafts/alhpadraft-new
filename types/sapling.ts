export interface SaplingAIResponse {
  score: number;
  sentence_scores?: Array<{ score: number; sentence: string }>;
  text: string;
  token_probs?: number[];
  tokens?: string[];
  score_string?: string;
}

export interface SaplingEdit {
  id: string;
  start: number;
  end: number;
  replacement: string;
  sentence: string;
  rule: {
    id: string;
    description: string;
    examples: string[];
  };
}

export interface SaplingEditSummary {
  count: number;
  edits: Array<{
    id: string;
    description: string;
    original: string;
    replacement: string;
  }>;
}

export interface SaplingConfig {
  key: string;
  endpointHostname?: string;
  editPathname?: string;
  statusBadge?: boolean;
  mode?: "dev" | "prod";
}
