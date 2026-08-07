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
            <div className="mx-auto mb-3 h-4 w-16 animate-pulse rounded bg-slate-200" />
            <div className="mx-auto mb-3 h-9 w-80 animate-pulse rounded bg-slate-200" />
            <div className="mx-auto h-5 w-96 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
                <div className="mt-6 h-10 w-28 animate-pulse rounded bg-slate-200" />
                <div className="mt-6 flex-1 space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-4 flex-1 animate-pulse rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
                <div className="mt-8 h-12 animate-pulse rounded-xl bg-slate-200" />
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
            <p className="text-xs font-semibold tracking-[0.2em] text-violet-600 uppercase">
              Choose Your Plan
            </p>
            <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold text-slate-900 md:text-4xl">
              Select a plan to get started
            </h2>
            <p className="mx-auto mt-3 max-w-2xl font-['DM_Sans'] text-sm text-slate-600 md:text-base">
              Start with three free checks. Buy credits when you need more, or
              subscribe for the best per-check value. No contracts, no
              surprises.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {/* Free Plan */}
            <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Zap className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-slate-900">
                    Free
                  </h3>
                  <p className="text-xs text-slate-500">
                    Try AlphaDrafts at zero cost
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <span className="font-['Space_Grotesk'] text-4xl font-semibold text-slate-900">
                  $0
                </span>
                <span className="text-sm text-slate-500">/month</span>
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
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isProcessing || PLAN_KEY_MAP["Free"] === currentPlan}
                onClick={() => handleSelectPlan("Free")}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 disabled:opacity-50"
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
            <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-slate-900">
                    Pay-Per-Check
                  </h3>
                  <p className="text-xs text-slate-500">
                    Buy credits, use them whenever you need
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-['Space_Grotesk'] text-xl font-semibold text-slate-900">
                  No monthly fee
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  From $5
                </span>
              </div>

              {/* Credit rates table */}
              <div className="mt-6 flex-1 space-y-2">
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
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
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                    >
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-medium text-slate-900">
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
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 disabled:opacity-50"
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
            <div className="relative flex flex-col rounded-3xl border-2 border-violet-500 bg-gradient-to-b from-violet-50 to-white p-6 shadow-lg ring-1 ring-violet-500/20">
              {/* Best Value badge */}
              <div className="absolute -top-3 right-4 sm:right-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  <Crown className="h-3 w-3" />
                  Best Value
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                  <Crown className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-slate-900">
                    Subscription
                  </h3>
                  <p className="text-xs text-slate-500">
                    {SUBSCRIPTION_PLAN.monthlyCredits.toLocaleString()} credits
                    every month
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <span className="font-['Space_Grotesk'] text-4xl font-semibold text-slate-900">
                  {SUBSCRIPTION_PLAN.priceDisplay}
                </span>
                <span className="text-sm text-slate-500">/month</span>
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
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
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
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50"
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
          <p className="mt-8 text-center text-xs text-slate-400">
            1 credit = ${CREDIT_PRICE_PER_UNIT} &middot; Credits never expire
            &middot; Cancel anytime
          </p>
        </div>
      </section>
    </>
  );
};

export default GatePricing;
