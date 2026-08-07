/**
 * Winston.ai API Constants
 */

export const WINSTON_API_BASE_URL = "https://api.gowinston.ai";

export const WINSTON_API_ENDPOINTS = {
  AI_DETECTION: "/v2/ai-content-detection",
  PLAGIARISM: "/v2/plagiarism",
} as const;

/**
 * Minimum text length for Winston.ai AI detection (300 characters)
 * Texts under 600 characters may produce unreliable results
 */
export const WINSTON_MIN_TEXT_LENGTH = 300;

/**
 * Maximum text length for Winston.ai AI detection (150,000 characters)
 */
export const WINSTON_MAX_TEXT_LENGTH = 150000;

/**
 * Minimum text length for Winston.ai plagiarism detection (100 characters)
 */
export const WINSTON_MIN_PLAGIARISM_TEXT_LENGTH = 100;

/**
 * Maximum text length for Winston.ai plagiarism detection (120,000 characters)
 */
export const WINSTON_MAX_PLAGIARISM_TEXT_LENGTH = 120000;
