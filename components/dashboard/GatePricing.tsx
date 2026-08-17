import React, { useState, useCallback } from "react";
import {
  CheckCircle2,
  Zap,
  CreditCard,
  Crown,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { MessageModal } from "@/common";
import { useClaims } from "@/context";
import { usePaymentPlans } from "@/hooks";
import {
  API_BASE_URL,
  CREDIT_RATES,
  FREE_PLAN_LIMITS,
  SUBSCRIPTION_PLAN,
  CREDIT_PRICE_PER_UNIT,
} from "@/constants";
import { apiClient, formatError } from "@/utils";
import { toast } from "react-toastify";
import BuyCreditsModal from "./modals/BuyCreditsModal";

interface GatePricingProps {
  onPlanAssigned: () => void;
  currentPlan?: "free" | "subscription" | "purchased";
}

const PLAN_KEY_MAP: Record<string, GatePricingProps["currentPlan"]> = {
  Free: "free",
  "Pay-Per-Check": "purchased",
  Subscription: "subscription",
};

const GatePricing = ({ onPlanAssigned, currentPlan }: GatePricingProps) => {
  const { token, refreshClaims } = useClaims();
  const { data: plans, isLoading: isLoadingPlans } = usePaymentPlans();

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);

  const handleSelectPlan = useCallback(
    async (planName: string) => {
      // switch case based on the plan name if free
      // format your payload and if monthly format your payload
      // if pay per check open a small input where they will enter amount and know hom much credit they will get but from 5 dollars up

      if (!token) {
        toast.error("You must be logged in to select a plan.");
        return;
      }

      if (planName?.toLowerCase() === "free" || planName === "Subscription") {
        const lookupName =
          planName?.toLowerCase() === "starter" ? "starter" : planName;
        const plan =
          plans?.find(
            p => p.name?.toLowerCase() === lookupName?.toLowerCase(),
          ) ?? null;

        if (!plan?.priceId) {
          toast.error("Plan data is not available yet. Please try again.");
          setIsProcessing(false);
          setProcessingPlan(null);
          return;
        }

        const payload = {
          planType: planName?.toLowerCase(),
          priceId: plan?.priceId,
        };
        setIsProcessing(true);
        setProcessingPlan(planName);

        try {
          const response = await apiClient.post(
            `${API_BASE_URL}/v1/payments/checkout`,
            payload,
          );

          if (response?.data?.status !== "success") {
            toast.error(
              formatError(
                response?.data?.message || "Failed to create checkout session.",
              ),
            );
            return;
          }

          if (response?.data?.data?.url) {
            if (refreshClaims) await refreshClaims();
            window.location.href = response.data.data.url;
          } else {
            setShowSuccessModal(true);
          }
        } catch (error) {
          toast.error(
            formatError(
              error,
              "Failed to create checkout session. Please try again.",
            ),
          );
        } finally {
          setIsProcessing(false);
          setProcessingPlan(null);
        }

        return;
      } else {
        setShowBuyCreditsModal(true);

        return;

        // open the input to input amount
      }

      // Free & Pay-Per-Check — no Stripe checkout, assign plan directly
      // Backend endpoint: POST /v1/payments/assign-free-plan
      // Body: { priceId?: string, planName: string }
      // Free plan is called "Starter" on Stripe
      if (planName === "Free" || planName === "Pay-Per-Check") {
        const stripeName = planName === "Free" ? "Starter" : planName;
        const plan = plans?.find(p => p.name === stripeName) ?? null;

        try {
          const response = await apiClient.post(
            `${API_BASE_URL}/v1/payments/assign-free-plan`,
            { priceId: plan?.priceId, planName: stripeName },
          );
          if (response?.data?.status === "success") {
            if (planName === "Free") {
              setShowSuccessModal(true);
            } else {
              setShowBuyCreditsModal(true);
            }
          } else {
            toast.error(
              formatError(response?.data?.message || "Failed to assign plan."),
            );
          }
        } catch (error) {
          toast.error(
            formatError(error, "Failed to assign plan. Please try again."),
          );
        } finally {
          setIsProcessing(false);
          setProcessingPlan(null);
        }
        return;
      }

      // Subscription — Stripe checkout
      // Backend endpoint: POST /v1/payments/create-checkout-session
      // Body: { priceId: string }
      const plan = plans?.find(p => p.name === planName) ?? null;

      if (!plan?.priceId) {
        toast.error("Plan data is not available yet. Please try again.");
        setIsProcessing(false);
        setProcessingPlan(null);
        return;
      }
    },
    [plans, token, refreshClaims],
  );

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onPlanAssigned();
  };

  const handleBuyCreditsClose = () => {
    setShowBuyCreditsModal(false);
    onPlanAssigned();
  };

  if (isLoadingPlans) {
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="mx-auto mb-3 h-4 w-16 animate-pulse rounded bg-[var(--color-surface-background)]" />
            <div className="mx-auto mb-3 h-9 w-80 animate-pulse rounded bg-[var(--color-surface-background)]" />
            <div className="mx-auto h-5 w-96 animate-pulse rounded bg-[var(--color-surface-background)]" />
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] p-6"
                style={{ borderRadius: "var(--radius-card-elevated)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded bg-[var(--color-surface-background)]" style={{ borderRadius: "var(--radius-card)" }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-24 animate-pulse rounded bg-[var(--color-surface-background)]" />
                    <div className="h-3 w-40 animate-pulse rounded bg-[var(--color-surface-background)]" />
                  </div>
                </div>
                <div className="mt-6 h-10 w-28 animate-pulse rounded bg-[var(--color-surface-background)]" />
                <div className="mt-6 flex-1 space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-pulse rounded-full bg-[var(--color-surface-background)]" />
                      <div className="h-4 flex-1 animate-pulse rounded bg-[var(--color-surface-background)]" />
                    </div>
                  ))}
                </div>
                <div className="mt-8 h-12 animate-pulse rounded bg-[var(--color-surface-background)]" style={{ borderRadius: "var(--radius-button)" }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <MessageModal
        isOpen={showSuccessModal}
        icon={<Zap className="icon" />}
        title="Plan Activated!"
        message="Your plan has been activated. Let's get started!"
        submitText="Go to Dashboard"
        onSubmit={handleSuccessModalClose}
        onCancel={handleSuccessModalClose}
      />

      <BuyCreditsModal
        isOpen={showBuyCreditsModal}
        onClose={handleBuyCreditsClose}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl lg:max-h-[80vh] lg:overflow-auto">
          {/* Header */}
          <div className="text-center">
            <p
              className="font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]"
              style={{ fontSize: "0.75rem", lineHeight: "16px" }}
            >
              Choose Your Plan
            </p>
            <h2
              className="mt-3 font-semibold text-[var(--color-text-primary)]"
              style={{ fontSize: "2.25rem", lineHeight: "36px", letterSpacing: "-0.01em" }}
            >
              Select a plan to get started
            </h2>
            <p
              className="mx-auto mt-3 max-w-2xl text-[var(--color-text-secondary)]"
              style={{ fontSize: "1rem", lineHeight: "24px" }}
            >
              Start with three free checks. Buy credits when you need more, or
              subscribe for the best per-check value. No contracts, no
              surprises.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {/* Free Plan */}
            <div
              className="flex flex-col border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] p-6 shadow-[var(--elevation-0)]"
              style={{ borderRadius: "var(--radius-card-elevated)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center bg-[var(--color-surface-background)]"
                  style={{ borderRadius: "var(--radius-card)" }}
                >
                  <Zap className="h-5 w-5 text-[var(--color-text-secondary)]" />
                </div>
                <div>
                  <h3
                    className="font-semibold text-[var(--color-text-primary)]"
                    style={{ fontSize: "1.125rem", lineHeight: "24px" }}
                  >
                    Free
                  </h3>
                  <p className="text-[var(--color-text-tertiary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
                    Try AlphaDrafts at zero cost
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <span
                  className="font-semibold text-[var(--color-text-primary)]"
                  style={{ fontSize: "2.25rem", lineHeight: "36px" }}
                >
                  $0
                </span>
                <span className="text-[var(--color-text-tertiary)]" style={{ fontSize: "0.875rem", lineHeight: "20px" }}>/month</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {[
                  `${FREE_PLAN_LIMITS.checksPerMonth} checks per month`,
                  "AI Originality Check included",
                  `Up to ${FREE_PLAN_LIMITS.maxWordsPerCheck.toLocaleString()} words per check`,
                  "Sentence-level highlights",
                ].map(feature => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isProcessing || PLAN_KEY_MAP["Free"] === currentPlan}
                onClick={() => handleSelectPlan("Free")}
                className="mt-8 flex w-full items-center justify-center gap-2 border border-[var(--color-border-medium)] bg-[var(--color-surface-container)] py-3 text-sm font-semibold text-[var(--color-text-primary)] shadow-[var(--elevation-0)] transition-[var(--transition-standard)] hover:bg-[var(--color-surface-background)] disabled:opacity-50"
                style={{ borderRadius: "var(--radius-button)" }}
              >
                {processingPlan === "Free" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : PLAN_KEY_MAP["Free"] === currentPlan ? (
                  "Current Plan"
                ) : (
                  "Start Free"
                )}
              </button>
            </div>

            {/* Pay-Per-Check */}
            <div
              className="flex flex-col border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] p-6 shadow-[var(--elevation-0)]"
              style={{ borderRadius: "var(--radius-card-elevated)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center bg-[var(--color-primary-container)]"
                  style={{ borderRadius: "var(--radius-card)" }}
                >
                  <CreditCard className="h-5 w-5 text-[var(--color-on-primary-container)]" />
                </div>
                <div>
                  <h3
                    className="font-semibold text-[var(--color-text-primary)]"
                    style={{ fontSize: "1.125rem", lineHeight: "24px" }}
                  >
                    Pay-Per-Check
                  </h3>
                  <p className="text-[var(--color-text-tertiary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
                    Buy credits, use them whenever you need
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span
                  className="font-semibold text-[var(--color-text-primary)]"
                  style={{ fontSize: "1.25rem", lineHeight: "24px" }}
                >
                  No monthly fee
                </span>
                <span
                  className="bg-[var(--color-primary-container)] px-2 py-0.5 font-semibold text-[var(--color-on-primary-container)]"
                  style={{ fontSize: "0.75rem", lineHeight: "16px", borderRadius: "var(--radius-pill)" }}
                >
                  From $5
                </span>
              </div>

              {/* Credit rates table */}
              <div className="mt-6 flex-1 space-y-2">
                <p
                  className="font-semibold uppercase tracking-[0.05em] text-[var(--color-text-tertiary)]"
                  style={{ fontSize: "0.75rem", lineHeight: "16px" }}
                >
                  Credit rates (per word)
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: "AI Originality", rate: CREDIT_RATES["ai"] },
                    { label: "Source Check", rate: CREDIT_RATES["plagiarism"] },
                    { label: "Brief Check", rate: CREDIT_RATES["alignment"] },
                    {
                      label: "All Three",
                      rate: CREDIT_RATES["ai+alignment+plagiarism"],
                    },
                  ].map(item => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between bg-[var(--color-surface-background)] px-3 py-2 text-sm"
                      style={{ borderRadius: "var(--radius-card)" }}
                    >
                      <span className="text-[var(--color-text-secondary)]">{item.label}</span>
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {item.rate} credits
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={
                  isProcessing || PLAN_KEY_MAP["Pay-Per-Check"] === currentPlan
                }
                onClick={() => handleSelectPlan("Pay-Per-Check")}
                className="mt-8 flex w-full items-center justify-center gap-2 border border-[var(--color-border-medium)] bg-[var(--color-surface-container)] py-3 text-sm font-semibold text-[var(--color-text-primary)] shadow-[var(--elevation-0)] transition-[var(--transition-standard)] hover:bg-[var(--color-surface-background)] disabled:opacity-50"
                style={{ borderRadius: "var(--radius-button)" }}
              >
                {processingPlan === "Pay-Per-Check" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : PLAN_KEY_MAP["Pay-Per-Check"] === currentPlan ? (
                  "Current Plan"
                ) : (
                  "Select Pay-Per-Check"
                )}
              </button>
            </div>

            {/* Subscription (Highlighted) */}
            <div
              className="relative flex flex-col border-2 border-[var(--color-primary)] bg-[var(--color-surface-container)] p-6 shadow-[var(--elevation-1)] ring-1 ring-[var(--color-primary)]/20"
              style={{ borderRadius: "var(--radius-card-elevated)" }}
            >
              {/* Best Value badge */}
              <div className="absolute -top-3 right-4 sm:right-6">
                <span
                  className="inline-flex items-center gap-1.5 bg-[var(--color-primary)] px-3 py-1 font-semibold text-[var(--color-on-primary)] shadow-sm"
                  style={{ fontSize: "0.75rem", lineHeight: "16px", borderRadius: "var(--radius-pill)" }}
                >
                  <Crown className="h-3 w-3" />
                  Best Value
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center bg-[var(--color-primary-container)]"
                  style={{ borderRadius: "var(--radius-card)" }}
                >
                  <Crown className="h-5 w-5 text-[var(--color-on-primary-container)]" />
                </div>
                <div>
                  <h3
                    className="font-semibold text-[var(--color-text-primary)]"
                    style={{ fontSize: "1.125rem", lineHeight: "24px" }}
                  >
                    Subscription
                  </h3>
                  <p className="text-[var(--color-text-tertiary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
                    {SUBSCRIPTION_PLAN.monthlyCredits.toLocaleString()} credits
                    every month
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <span
                  className="font-semibold text-[var(--color-text-primary)]"
                  style={{ fontSize: "2.25rem", lineHeight: "36px" }}
                >
                  {SUBSCRIPTION_PLAN.priceDisplay}
                </span>
                <span className="text-[var(--color-text-tertiary)]" style={{ fontSize: "0.875rem", lineHeight: "20px" }}>/month</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {[
                  `${SUBSCRIPTION_PLAN.monthlyCredits.toLocaleString()} credits every month`,
                  "All three checks included",
                  "No word count limit per check",
                  "Priority processing",
                  "Buy extra credits anytime",
                ].map(feature => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={
                  isProcessing || PLAN_KEY_MAP["Subscription"] === currentPlan
                }
                onClick={() => handleSelectPlan("Subscription")}
                className="mt-8 flex w-full items-center justify-center gap-2 bg-[var(--color-primary)] py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-[var(--elevation-1)] transition-[var(--transition-standard)] hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--elevation-2)] disabled:opacity-50"
                style={{ borderRadius: "var(--radius-button)" }}
              >
                {processingPlan === "Subscription" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : PLAN_KEY_MAP["Subscription"] === currentPlan ? (
                  "Current Plan"
                ) : (
                  <>
                    Subscribe Now
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-[var(--color-text-tertiary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
            1 credit = ${CREDIT_PRICE_PER_UNIT} &middot; Credits never expire
            &middot; Cancel anytime
          </p>
        </div>
      </section>
    </>
  );
};

export default GatePricing;
