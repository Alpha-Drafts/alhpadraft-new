import { useClaims } from "@/context";
import { useFetchHook } from "../misc/useFetchHook";
import { API_BASE_URL } from "@/constants";

export interface CurrentSubscriptionData {
  currentPlan?: "free" | "subscription" | "purchased";
  subscriptionRenewalDate?: string;
  lastFreeCheckResetDate?: string;
  freeChecksUsed?: number;
  subscription?: {
    planId?: string;
    name?: string;
    status?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Reads the user's subscription from the dedicated backend endpoint
 * `GET /v1/payments/subscription` (the decoupled /v1/users/me no longer
 * embeds subscription data). Returns {} gracefully while the backend
 * implements the endpoint.
 */
export function useCurrentSubscription() {
  const { token } = useClaims();

  const { data, isLoading, error, refetch } = useFetchHook<unknown>({
    endpoint: `${API_BASE_URL}/v1/payments/subscription`,
    enabled: !!token,
  });

  const mapped: CurrentSubscriptionData | null =
    data && typeof data === "object" ? (data as CurrentSubscriptionData) : null;

  return {
    data: mapped,
    isLoading,
    error,
    refetch,
  };
}
