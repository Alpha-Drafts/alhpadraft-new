import { AccountStatistics } from "@/types";
import { useClaims } from "@/context";
import { useFetchHook } from "../misc/useFetchHook";
import { API_BASE_URL } from "@/constants";

export function useAccountStatistics() {
  const { token } = useClaims();

  // Fetch user's statitics
  const {
    data: statistics,
    isLoading,
    error,
    refetch,
  } = useFetchHook<AccountStatistics>({
    endpoint: `${API_BASE_URL}/v1/users/statistics`,
    enabled: !!token,
  });

  return {
    data: statistics,
    isLoading,
    error,
    refetch,
  };
}
