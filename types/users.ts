import { Benefit, PlanType } from "./plans";
import { ApiTimestamp } from "./dates";
import { USER_ROLES, USER_STATUSES } from "@/constants";
import { AcceptedCurrenciesType } from "./transactions";

export type UserRoleType = (typeof USER_ROLES)[number];

export type UserStatusType = (typeof USER_STATUSES)[number];

export interface UserCreateProps {
  name: string;
  email: string;
  phone_number: string;
  photo_url: string;
  roles: Array<UserRoleType>;
}
export interface UserProps extends UserCreateProps {
  id: string;
  user_id: string;
  accepted_conditions: boolean;
  created_at: ApiTimestamp;
  updated_at: ApiTimestamp;
  subscription?: {
    cancelAtPeriodEnd: boolean;
    currency: AcceptedCurrenciesType;
    status: "active";
    benefits: Benefit[];
    lastUpdated: ApiTimestamp;
    currentPeriodEnd: ApiTimestamp;
    name: PlanType;
    planId: string;
    stripeCustomerId: string;
    subscriptionId: string;
    amountUnit: number;
    transactionId: string;
  };
  credits?: {
    balance: number;
    monthlyAllocation: number;
    lastUpdated: ApiTimestamp;
  };
  bio?: string;
  avatar?: string;

  subscriptionCreditsBalance?: number;
  purchasedCreditsBalance?: number;
  freeChecksUsed?: number;

  // Plan info
  currentPlan?: "free" | "subscription" | "purchased";

  // Subscription & reset tracking
  subscriptionRenewalDate?: string;
  lastFreeCheckResetDate?: string;
  lastSubscriptionResetDate?: string;
}

export interface SetCustomClaimsProps {
  roles: Array<UserRoleType>;
  created_at: ApiTimestamp;
  updated_at: ApiTimestamp;
}

export interface CustomClaimsProps extends UserCreateProps {
  id: string;
  iss: string;
  aud: string;
  auth_time: number;
  sub: string;
  iat: number;
  exp: number;
  email_verified: boolean;
  firebase: {
    identities: { email: string[] };
    sign_in_provider: string;
  };
  created_at: ApiTimestamp;
  updated_at: ApiTimestamp;
}

export interface UserUsageData {
  currentUsage: {
    aiReviews: number;
    citationAnalysis: number;
    grammarAndAiChecks: number;
    instructionAnalysis: number;
    postEvaluations: number;
    projects: number;
  };
  limits: {
    aiReviews: number;
    grammarAndAiChecks: number;
    projects: number;
  };
  subscriptionType: string;
}
