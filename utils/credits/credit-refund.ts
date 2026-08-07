import { API_BASE_URL } from "@/constants";
import { apiClient } from "../api";

export interface CreditsRefundResponse {
  message: string;
}

interface refundCreditParams {
  creditId: string;
  creditHistoryId: string;
}

export async function refundCredits(
  params: refundCreditParams,
): Promise<CreditsRefundResponse> {
  const { creditHistoryId, creditId } = params;

  const res = await apiClient.post<{ data: CreditsRefundResponse }>(
    `${API_BASE_URL}/v1/credits/refund/${creditId}/${creditHistoryId}`,
  );

  return res.data.data;
}
