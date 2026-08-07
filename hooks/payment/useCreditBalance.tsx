import { CreditBalanceProps } from "@/types";
import { useClaims } from "@/context";
import { useFetchHook } from "../misc/useFetchHook";
import { API_BASE_URL } from "@/constants";

export function useCreditBalance() {
  const { token } = useClaims();

  const { data, isLoading, error, refetch } = useFetchHook<CreditBalanceProps>({
    endpoint: `${API_BASE_URL}/v1/credits/balance`,
    enabled: !!token,
  });

  return {
    data: data ?? null,
    balance: data?.available ?? 0,
    isLoading,
    error,
    refetch,
  };
}
