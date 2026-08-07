// Check type identifiers (matching CheckSelectionModal's CheckType ids)
export const CHECK_TYPES = {
  AI: "ai",
  PLAGIARISM: "plagiarism",
  ALIGNMENT: "alignment",
} as const;

// Credit rates: credits per word for each check type combination
// Keys are sorted check type IDs joined by "+"
export const CREDIT_RATES: Record<string, number> = {
  ai: 0.2, // AI Detection only
  plagiarism: 0.35, // Plagiarism only
  alignment: 0.3, // Instruction Alignment only
  "ai+plagiarism": 0.5, // AI + Plagiarism
  "ai+alignment": 0.5, // AI + Alignment
  "alignment+plagiarism": 0.65, // Plagiarism + Alignment
  "ai+alignment+plagiarism": 0.75, // Full Check (all 3)
};

// Dollar-to-credit conversion
export const CREDIT_PRICE_PER_UNIT = 0.0007; // 1 credit = $0.0007

// Minimum word count for any check
export const MIN_WORD_COUNT = 1000;

// Free plan limits
export const FREE_PLAN_LIMITS = {
  checksPerMonth: 3,
  maxWordsPerCheck: 1000,
  allowedCheckTypes: ["ai"] as readonly string[],
};

// Subscription plan configuration
export const SUBSCRIPTION_PLAN = {
  monthlyPrice: 950, // in cents for Stripe
  monthlyCredits: 40_000,
  priceDisplay: "$9.50",
};

// Suggested credit purchase packages (amounts in cents)
export const CREDIT_PACKAGES = [
  {
    amount: 500,
    label: "$5",
    credits: Math.floor(5 / CREDIT_PRICE_PER_UNIT),
  },
  {
    amount: 1000,
    label: "$10",
    credits: Math.floor(10 / CREDIT_PRICE_PER_UNIT),
  },
  {
    amount: 2500,
    label: "$25",
    credits: Math.floor(25 / CREDIT_PRICE_PER_UNIT),
  },
  {
    amount: 5000,
    label: "$50",
    credits: Math.floor(50 / CREDIT_PRICE_PER_UNIT),
  },
] as const;
