import {
  CREDIT_RATES,
  CREDIT_PRICE_PER_UNIT,
  MIN_WORD_COUNT,
} from "@/constants";
import { CheckTypeId } from "@/types";

/**
 * Round word count up to the nearest 1000.
 * Minimum is always MIN_WORD_COUNT (1000).
 */
export function roundUpWordCount(wordCount: number): number {
  if (wordCount <= 0) return MIN_WORD_COUNT;
  return Math.ceil(wordCount / 1000) * 1000;
}

/**
 * Build the rate key from selected check types.
 * Sorts alphabetically to match CREDIT_RATES keys.
 * e.g., ["plagiarism", "ai"] -> "ai+plagiarism"
 */
function buildRateKey(checkTypes: CheckTypeId[]): string {
  return [...checkTypes].sort().join("+");
}

/**
 * Get the credit rate per word for a combination of check types.
 * Returns 0 if no matching rate found.
 */
export function getCreditRate(checkTypes: CheckTypeId[]): number {
  if (checkTypes.length === 0) return 0;
  const key = buildRateKey(checkTypes);
  return CREDIT_RATES[key] ?? 0;
}

/**
 * Calculate total credits needed for a given word count and check type combination.
 * Formula: ceil(wordCount / 1000) * 1000 * rate_per_word
 */
export function calculateCredits(
  wordCount: number,
  checkTypes: CheckTypeId[],
): number {
  const roundedWords = roundUpWordCount(wordCount);
  const rate = getCreditRate(checkTypes);
  return Math.ceil(roundedWords * rate);
}

/**
 * Convert credits to dollar amount (not cents).
 */
export function creditsToDollars(credits: number): number {
  return credits * CREDIT_PRICE_PER_UNIT;
}

/**
 * Convert dollar amount (not cents) to credits.
 */
export function dollarsToCredits(dollars: number): number {
  return Math.floor(dollars / CREDIT_PRICE_PER_UNIT);
}

/**
 * Convert cent amount to credits.
 */
export function centsToCredits(cents: number): number {
  return Math.floor(cents / 100 / CREDIT_PRICE_PER_UNIT);
}

/**
 * Format a credit count for display, e.g., 14286 -> "14,286"
 */
export function formatCredits(credits: number): string {
  return new Intl.NumberFormat("en-US").format(credits);
}

/**
 * Check if a plan name represents the free tier.
 * The free plan is called "Starter" on Stripe but "Free" in the UI.
 */
export type NormalizedPlanName = "free" | "subscription" | "purchased";

export function normalizePlanName(
  name?: string | null,
): NormalizedPlanName | undefined {
  if (!name) return undefined;
  const normalized = name.toLowerCase();

  if (normalized === "free" || normalized === "starter") return "free";
  if (normalized === "subscription") return "subscription";
  if (
    normalized === "purchased" ||
    normalized === "pay_per_check" ||
    normalized === "pay-per-check"
  ) {
    return "purchased";
  }

  return undefined;
}

export function isFreePlan(name?: string | null): boolean {
  return normalizePlanName(name) === "free";
}

/**
 * Format credits as a dollar string, e.g., 14286 credits -> "$10.00"
 */
export function formatCreditsAsDollars(credits: number): string {
  const dollars = creditsToDollars(credits);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}
