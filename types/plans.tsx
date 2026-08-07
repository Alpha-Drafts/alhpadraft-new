import { PLANS } from "@/constants";

export type PlanType = (typeof PLANS)[number]; // "Free" | "Pay-Per-Check" | "Subscription"

export type CheckTypeId = "ai" | "plagiarism" | "alignment";

export interface Benefit {
  name: string;
}

export interface PlanProps {
  productId: string;
  name: PlanType;
  amount: number;
  description: string;
  benefits: Benefit[];
  priceId: string;
  currency: string;
  interval: string;
  monthlyCredits?: number;
  allowedCheckTypes?: CheckTypeId[];
  maxWordsPerCheck?: number;
  checksPerMonth?: number;
}

export interface PlanCheckoutProps {
  url: string;
  transactionId: string;
}

export interface CreditPurchaseCheckoutProps {
  url: string;
  transactionId: string;
}
