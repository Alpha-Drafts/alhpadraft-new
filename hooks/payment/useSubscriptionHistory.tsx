export const BILLING_ITEMS_PER_PAGE = 5;
import { API_BASE_URL } from "@/constants";
import { useFetchHook } from "../misc";
import { SubscriptionHistoryProps } from "@/types";
import { useClaims } from "@/context";

export function useSubscriptionHistory({
  skip,
  take,
}: {
  skip: number;
  take: number;
}) {
  const { token } = useClaims();
  // Explicitly use the parameters in a way ESLint recognizes
  const endpoint = `${API_BASE_URL}/v1/users/subscription-history?skip=${skip}&take=${take}`;

  const {
    data: response,
    isLoading,
    error,
  } = useFetchHook<{
    data: SubscriptionHistoryProps[];
    totalCount: number;

    hasMore: boolean;
  }>({
    endpoint,
    enabled: !!token,
  });

  const subscriptionHistory = response?.data ?? [];

  return {
    data: subscriptionHistory,
    totalCount: response?.totalCount ?? 0,
    isLoading,
    error,
  };
}
