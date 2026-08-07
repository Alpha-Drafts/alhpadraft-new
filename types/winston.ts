/**
 * Winston.ai API v2 Types
 * Documentation: https://docs.gowinston.ai/
 */

export interface WinstonSentenceScore {
  text: string;
  /**
   * Human-likeness score between 0 and 100.
   * Higher values mean more likely written by a human.
   */
  score: number;
}

export interface WinstonAttackDetected {
  zero_width_space: boolean;
  homoglyph_attack: boolean;
}

export interface WinstonAIDetectionResponse {
  /**
   * HTTP status code (e.g. 200 for success)
   */
  status: number;

  /**
   * Human-likeness score between 0 and 100.
   * Higher values mean more likely written by a human.
   */
  score: number;

  /**
   * Optional sentence-level scores with text and per-sentence human score.
   */
  sentences?: WinstonSentenceScore[];

  /**
   * Type of input that was scanned.
   */
  input: "text" | "file" | "website";

  /**
   * Optional attack detection flags.
   */
  attack_detected?: WinstonAttackDetected;

  /**
   * Readability score between 0 and 100.
   * Higher values mean easier to read.
   */
  readability_score?: number;

  /**
   * Number of credits consumed for this request.
   */
  credits_used: number;

  /**
   * Remaining credits after this request.
   */
  credits_remaining: number;

  /**
   * Model version used by Winston.ai.
   */
  version: string;

  /**
   * Detected language (e.g. "en").
   */
  language: string;
}

export interface WinstonPlagiarismResult {
  /**
   * Overall plagiarism score (0-100).
   */
  score: number;

  /**
   * Number of sources with detected plagiarism.
   */
  sourceCounts: number;

  /**
   * Total number of words in the input text.
   */
  textWordCounts: number;

  /**
   * Total number of plagiarised words.
   */
  totalPlagiarismWords: number;

  /**
   * Number of identical words found across sources.
   */
  identicalWordCounts: number;

  /**
   * Number of similar words found across sources.
   */
  similarWordCounts: number;
}

export interface WinstonPlagiarismScanInformation {
  service: string;
  scanTime: string;
  inputType: "text" | "file" | "website";
  language: string;
}

export interface WinstonPlagiarismSequence {
  startIndex: number;
  endIndex: number;
  sequence: string;
}

export interface WinstonPlagiarismSource {
  score: number;
  canAccess: boolean;
  url: string;
  title: string;
  plagiarismWords: number;
  identicalWordCounts: number;
  similarWordCounts: number;
  totalNumberOfWords: number;
  author?: string;
  description?: string;
  publishedDate?: number;
  source: string;
  citation: boolean;
  plagiarismFound: WinstonPlagiarismSequence[];
  is_excluded?: boolean;
}

export interface WinstonSimilarWord {
  index: number;
  word: string;
}

export interface WinstonPlagiarismResponse {
  /**
   * HTTP status code for the scan request.
   */
  status: number;

  /**
   * High-level scan information (service, language, input type).
   */
  scanInformation: WinstonPlagiarismScanInformation;

  /**
   * Aggregated plagiarism metrics.
   */
  result: WinstonPlagiarismResult;

  /**
   * Detailed list of sources where overlapping content was found.
   */
  sources: WinstonPlagiarismSource[];

  /**
   * Optional attack detection flags.
   */
  attackDetected?: WinstonAttackDetected;

  /**
   * Original text that was scanned.
   */
  text: string;

  /**
   * Optional list of similar words found.
   */
  similarWords?: WinstonSimilarWord[];

  /**
   * Optional list of citations present in the text.
   */
  citations?: string[];

  /**
   * List of plagiarism sequences with character indexes.
   */
  indexes: WinstonPlagiarismSequence[];

  /**
   * Number of credits consumed for this request.
   */
  credits_used: number;

  /**
   * Remaining credits after this request.
   */
  credits_remaining: number;
}

/**
 * Winston.ai API v2 Types
 * Documentation: https://docs.gowinston.ai/
 */

export interface WinstonSentenceScore {
  text: string;
  score: number; // 0-100, where higher = more human
  length: number;
}

export interface WinstonAttackDetected {
  zero_width_space: boolean;
  homoglyph_attack: boolean;
}

export interface WinstonAIDetectionResponse {
  status: number;
  length: number;
  score: number; // 0-100, where higher = more human (lower = more AI)
  sentences?: WinstonSentenceScore[];
  input: "text" | "file" | "website";
  attack_detected?: WinstonAttackDetected;
  readability_score?: number;
  credits_used: number;
  credits_remaining: number;
  version: string;
  language: string;
}

export interface WinstonPlagiarismResult {
  score: number;
  sourceCounts: number;
  textWordCounts: number;
  totalPlagiarismWords: number;
  identicalWordCounts: number;
  similarWordCounts: number;
}

export interface WinstonPlagiarismScanInformation {
  service: string;
  scanTime: string;
  inputType: "text" | "file" | "website";
  language: string;
}

export interface WinstonPlagiarismSequence {
  startIndex: number;
  endIndex: number;
  sequence: string;
}

export interface WinstonPlagiarismSource {
  score: number;
  canAccess: boolean;
  url: string;
  title: string;
  plagiarismWords: number;
  identicalWordCounts: number;
  similarWordCounts: number;
  totalNumberOfWords: number;
  author?: string;
  description?: string;
  publishedDate?: number;
  source: string;
  citation: boolean;
  plagiarismFound: WinstonPlagiarismSequence[];
  is_excluded?: boolean;
}

export interface WinstonSimilarWord {
  index: number;
  word: string;
}

export interface WinstonPlagiarismResponse {
  status: number;
  scanInformation: WinstonPlagiarismScanInformation;
  result: WinstonPlagiarismResult;
  sources: WinstonPlagiarismSource[];
  attackDetected?: WinstonAttackDetected;
  text: string;
  similarWords?: WinstonSimilarWord[];
  citations?: string[];
  indexes: WinstonPlagiarismSequence[];
  credits_used: number;
  credits_remaining: number;
}
