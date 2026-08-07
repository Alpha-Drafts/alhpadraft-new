import { Benefit } from "./plans";

export interface UsageStatsValueType {
  current: number;
  limit: number;
  subscriptionType: string;
  resetDate: string | object;

  subscriptionCreditsBalance?: number;
  purchasedCreditsBalance?: number;
  freeChecksUsed?: number;
  currentPlan?: string;
  subscriptionRenewalDate?: string;
  lastFreeCheckResetDate?: string;
}

export interface MonthlyUsageProps {
  [key: string]: UsageStatsValueType;
}

export interface SubscriptionHistoryProps {
  amountUnit: number;
  benefits: Benefit[];
  currency: string;
  dateCreated: {
    _seconds: number;
    _nanoseconds: number;
  };
  details: {
    id: string;
    object: string;
    application: string | null;
    application_fee_percent: number | null;
    automatic_tax: {
      enabled: boolean;
    };
  };
  id: string;
  name: string;
  periodEnd: {
    _seconds: number;
    _nanoseconds: number;
  };
  periodStart: {
    _seconds: number;
    _nanoseconds: number;
  };
  planId: string;
  status: string;
  subscriptionId: string;
  transactionId: string;
  type: string;
}

export interface CreditBalanceProps {
  available: number;
  used: number;
  monthlyAllocation: number;
  lastUpdated: string;
}

export interface CreditTransactionProps {
  id: string;
  userId: string;
  transactionId: string;
  type: "purchase" | "usage" | "allocation" | "refund";
  totalCredit: number;
  balance: number;
  status: string;
  amount: number;
  description: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  checkId?: string;
}

export interface CreditValidationRequest {
  checks: {
    aiDetection: boolean;
    objectiveAlignment: boolean;
    plagiarismSearch: boolean;
  };
  wordCount: number;
  projectId: string;
}

export interface CreditValidationResponse {
  allowed: boolean;
  remainingChecks?: number;
  reason?: string;
}
