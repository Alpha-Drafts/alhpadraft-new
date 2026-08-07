import { CreditTransactionProps } from "@/types";
import { useClaims } from "@/context";
import { useFetchHook } from "../misc/useFetchHook";
import { API_BASE_URL } from "@/constants";

export const CREDIT_HISTORY_ITEMS_PER_PAGE = 5;

export function useCreditHistory({
  skip,
  take,
}: {
  skip: number;
  take: number;
}) {
  const { token } = useClaims();
  const endpoint = `${API_BASE_URL}/v1/credits/history?skip=${skip}&take=${take}`;

  const {
    data: response,
    isLoading,
    error,
  } = useFetchHook<{
    data: CreditTransactionProps[];
    totalCount: number;
    skip: number;
    take: number;
    hasMore: boolean;
  }>({
    endpoint,
    enabled: !!token,
  });

  return {
    data: response?.data ?? [],
    totalCount: response?.totalCount ?? 0,
    hasMore: response?.hasMore ?? false,
    isLoading,
    error,
  };
}
