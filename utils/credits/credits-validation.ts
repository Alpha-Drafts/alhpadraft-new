import { API_BASE_URL } from "@/constants";
import { apiClient } from "../api";

export interface CreditValidationRequest {
  checks: {
    aiDetection: boolean;
    objectiveAlignment: boolean;
    plagiarismSearch: boolean;
  };
  wordCount: number;
  projectId: string;
}

export interface CreditValidationResponse {
  allowed: boolean;
  remainingChecks?: number;
  reason?: string;
}

/**
 * Validate if user has sufficient credits to run the selected checks
 * @param params - The checks to validate and word count
 * @returns Validation response indicating if checks are allowed
 */
export async function validateCredits(
  params: CreditValidationRequest,
): Promise<CreditValidationResponse> {
  try {
    const { checks, wordCount, projectId } = params;
    console.info("checks", checks);

    // Build features array based on selected checks
    const features: string[] = [];
    if (checks.aiDetection) features.push("AI_ONLY");
    if (checks.objectiveAlignment) features.push("ALIGNMENT_ONLY");
    if (checks.plagiarismSearch) features.push("PLAGIARISM_ONLY");

    const response = await apiClient.post<{ data: CreditValidationResponse }>(
      `${API_BASE_URL}/v1/credits/validate`,
      {
        wordCount,
        project: projectId,
        features,
      },
    );

    return response.data.data;
  } catch (error: unknown) {
    // Handle API errors gracefully
    throw error;
  }
}
