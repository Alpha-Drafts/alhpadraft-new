import { PlanProps } from "@/types";
import { useFetchHook } from "../misc/useFetchHook";
import { API_BASE_URL } from "@/constants";
import { isFreePlan } from "@/utils";

const SORT_ORDER: Array<PlanProps["name"]> = [
  "Free",
  "Pay-Per-Check",
  "Subscription",
];

/**
 * Resolve a plan name to its sort-order position.
 * Maps "Starter" (Stripe name) → "Free" (UI name) so it sorts first.
 */
function sortPosition(name: string): number {
  const idx = SORT_ORDER.indexOf(name as PlanProps["name"]);
  if (idx >= 0) return idx;
  if (isFreePlan(name)) return 0; // "Starter" → same position as "Free"
  return SORT_ORDER.length; // unknown plans go last
}

export function usePaymentPlans() {
  const {
    data: plans,
    isLoading,
    error,
  } = useFetchHook<PlanProps[]>({
    endpoint: `${API_BASE_URL}/v1/payments/plans`,
  });

  const ordered = plans
    ? [...plans].sort((a, b) => sortPosition(a.name) - sortPosition(b.name))
    : undefined;

  return { data: ordered, isLoading, error };
}
