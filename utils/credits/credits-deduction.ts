import { API_BASE_URL } from "@/constants";
import { apiClient } from "../api";

export interface CreditsDeductionResponse {
  creditsUsed: number;
  remainingSubscriptionCredits: number;
  remainingPurchasedCredits: number;
  project: string;
  creditId: string;
  creditHistoryId: string;
}

interface DeductCreditsParams {
  checks: {
    aiDetection: boolean;
    objectiveAlignment: boolean;
    plagiarismSearch: boolean;
  };
  wordCount: number;
}

export async function deductCredits(
  params: DeductCreditsParams,
): Promise<CreditsDeductionResponse> {
  const { checks, wordCount } = params;

  const features: string[] = [];
  if (checks.aiDetection) features.push("AI_ONLY");
  if (checks.objectiveAlignment) features.push("ALIGNMENT_ONLY");
  if (checks.plagiarismSearch) features.push("PLAGIARISM_ONLY");

  const res = await apiClient.post<{ data: CreditsDeductionResponse }>(
    `${API_BASE_URL}/v1/credits/deduct`,
    {
      project: `project-${new Date().getTime()}`,
      wordCount,
      features,
    },
  );

  return res.data.data;
}
