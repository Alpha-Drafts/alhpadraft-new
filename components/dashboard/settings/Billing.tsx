import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Crown,
  Coins,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Button, MessageModal } from "@/common";
import ViewPlanModal from "./ViewPlanModal";
import {
  usePaymentPlans,
  useCurrentSubscription,
  useSubscriptionHistory,
  BILLING_ITEMS_PER_PAGE,
  useCreditBalance,
  useCreditHistory,
  CREDIT_HISTORY_ITEMS_PER_PAGE,
  useCancelSubscription,
} from "@/hooks";
import {
  formatPrices,
  formatCredits,
  isFreePlan as checkIsFreePlan,
  normalizePlanName,
} from "@/utils";
import { CREDIT_RATES, FREE_PLAN_LIMITS, SUBSCRIPTION_PLAN } from "@/constants";
import { useCredits } from "@/context";
import BuyCreditsModal from "../modals/BuyCreditsModal";

/* ─── Shared design-token class constants ─── */
const CARD =
  "rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] p-6 transition-[box-shadow] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]";

const SKELETON_CARD =
  "animate-pulse rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] p-6";
const SECTION_LABEL = "text-body-medium-12 text-[var(--color-text-tertiary)]";

const ERROR_CARD =
  "rounded-[var(--radius-card)] border border-[var(--color-error)]/20 bg-[var(--color-surface-container)] p-6 text-center";

const Billing = () => {
  const { balance, isLoading: creditsLoading } = useCredits();
  const { cancelSubscription, isLoading: isLoadingCancelSubscription } =
    useCancelSubscription();

  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError,
  } = usePaymentPlans();

  const {
    data: subscription,
    isLoading: subLoading,
    error: subError,
  } = useCurrentSubscription();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const currentPlan = plans?.find(
    plan => plan.priceId === subscription?.subscription?.planId,
  );

  const planName = subscription?.currentPlan;
  const normalizedPlan = normalizePlanName(planName);
  const isFreePlan = checkIsFreePlan(planName);
  const isPayPerCheck = normalizedPlan === "purchased";
  const isSubscription = normalizedPlan === "subscription";

  /* ═══════════════════════════════════════════
     Usage Card — plan-aware
     ═══════════════════════════════════════════ */
  const UsageCard = () => {
    const { data: creditData, isLoading: creditDataLoading } =
      useCreditBalance();

    const isLoading = subLoading || (!isFreePlan && creditDataLoading);

    if (plansLoading || subLoading || isLoading) {
      return (
        <div className={SKELETON_CARD}>
          <div className="mb-4 h-5 w-1/3 rounded bg-[var(--color-surface-background)]" />
          <div className="mb-6 h-4 w-2/3 rounded bg-[var(--color-surface-background)]" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-3.5">
              <div className="mb-2 h-4 w-full rounded bg-[var(--color-surface-background)]" />
              <div className="h-2 w-full rounded-full bg-[var(--color-surface-background)]" />
            </div>
          ))}
        </div>
      );
    }

    /* ── Free Plan Usage ── */
    if (isFreePlan) {
      const addOneMonth = (date: Date): Date => {
        const result = new Date(date);
        const day = result.getDate();
        result.setMonth(result.getMonth() + 1);
        if (result.getDate() < day) result.setDate(0);
        return result;
      };
      const checksUsage = subscription;
      const checksUsed = checksUsage?.freeChecksUsed ?? 0;
      const checksLimit = FREE_PLAN_LIMITS.checksPerMonth;
      const checksPercent = (checksUsed / checksLimit) * 100;

      const resetDate = checksUsage?.lastFreeCheckResetDate
        ? new Date(checksUsage.lastFreeCheckResetDate!)
        : new Date();
      const resetDateString = addOneMonth(resetDate).toLocaleDateString(
        undefined,
        { year: "numeric", month: "long", day: "numeric" },
      );

      return (
        <div className={CARD}>
          <h4 className="text-body-medium-14 mb-1 text-[var(--color-text-primary)]">
            Free Plan Usage
          </h4>
          <p className="text-body-regular-12 mb-5 text-[var(--color-text-tertiary)]">
            Track your monthly free plan limits
          </p>

          <div className="mb-5">
            <div className="text-body-medium-12 mb-1.5 flex justify-between text-[var(--color-text-primary)]">
              <span>Checks Used</span>
              <span
                className={
                  checksUsed >= checksLimit
                    ? "text-[var(--color-error)]"
                    : "text-[var(--color-success)]"
                }
              >
                {checksUsed} / {checksLimit}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-background)]">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  checksUsed >= checksLimit
                    ? "bg-[var(--color-error)]"
                    : "bg-[var(--color-primary)]"
                }`}
                style={{ width: `${Math.min(checksPercent, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-background)] p-3.5">
            <div className="text-body-regular-12 flex justify-between text-[var(--color-text-secondary)]">
              <span>Max words per check</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {FREE_PLAN_LIMITS.maxWordsPerCheck.toLocaleString()}
              </span>
            </div>
            <div className="text-body-regular-12 flex justify-between text-[var(--color-text-secondary)]">
              <span>Available checks</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                AI Detection only
              </span>
            </div>
          </div>

          <div className="text-body-regular-12 mt-4 text-center text-[var(--color-text-tertiary)]">
            Resets on {resetDateString}
          </div>
        </div>
      );
    }

    /* ── Paid Plan Usage ── */
    const creditsUsed = creditData?.used ?? 0;
    const monthlyAllocation =
      creditData?.monthlyAllocation ??
      (isSubscription ? SUBSCRIPTION_PLAN.monthlyCredits : 0);
    const creditsPercent =
      isSubscription && monthlyAllocation > 0
        ? (creditsUsed / monthlyAllocation) * 100
        : 0;

    return (
      <div className={CARD}>
        <h4 className="text-body-medium-14 mb-1 text-[var(--color-text-primary)]">
          {isSubscription ? "Monthly Credits" : "Credit Balance"}
        </h4>
        <p className="text-body-regular-12 mb-5 text-[var(--color-text-tertiary)]">
          {isSubscription
            ? "Track your monthly credit allocation"
            : "Your available credits for running checks"}
        </p>

        {/* Credit balance — prominent tonal display */}
        <div className="mb-5 rounded-[var(--radius-card)] border border-[var(--color-primary)]/10 bg-[var(--color-primary-container)] p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Coins className="h-5 w-5 text-[var(--color-primary)]" />
            <span className="text-body-bold-20 text-[var(--color-on-primary-container)]">
              {creditsLoading ? "..." : formatCredits(balance)}
            </span>
          </div>
          <p className="text-body-regular-12 mt-1 text-[var(--color-on-primary-container)]/70">
            credits available
          </p>
        </div>

        {/* Subscription allocation progress */}
        {isSubscription && monthlyAllocation > 0 && (
          <div className="mb-5">
            <div className="text-body-medium-12 mb-1.5 flex justify-between text-[var(--color-text-primary)]">
              <span>Monthly Usage</span>
              <span
                className={
                  creditsUsed >= monthlyAllocation
                    ? "text-[var(--color-error)]"
                    : "text-[var(--color-success)]"
                }
              >
                {formatCredits(creditsUsed)} /{" "}
                {formatCredits(monthlyAllocation)}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-background)]">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  creditsUsed >= monthlyAllocation
                    ? "bg-[var(--color-error)]"
                    : "bg-[var(--color-primary)]"
                }`}
                style={{ width: `${Math.min(creditsPercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {isPayPerCheck && creditsUsed > 0 && (
          <div className="mb-5">
            <div className="text-body-regular-12 flex justify-between text-[var(--color-text-secondary)]">
              <span>Credits used this month</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {formatCredits(creditsUsed)}
              </span>
            </div>
          </div>
        )}

        <Button
          text={isSubscription ? "Buy Extra Credits" : "Buy Credits"}
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => setShowBuyCredits(true)}
        />
      </div>
    );
  };

  /* ═══════════════════════════════════════════
     Current Plan Card
     ═══════════════════════════════════════════ */
  const CurrentPlanCard = () => {
    if (plansLoading || subLoading) {
      return (
        <div className={`${SKELETON_CARD}`}>
          <div className="mb-4 h-5 w-1/3 rounded bg-[var(--color-surface-background)]" />
          <div className="mb-6 h-4 w-2/3 rounded bg-[var(--color-surface-background)]" />
          <div className="mb-2 h-4 w-full rounded bg-[var(--color-surface-background)]" />
          <div className="h-4 w-1/2 rounded bg-[var(--color-surface-background)]" />
        </div>
      );
    }

    if (plansError || subError) {
      return (
        <div className={ERROR_CARD}>
          <h4 className="text-body-semibold-14 mb-6 flex items-center justify-center text-[var(--color-error)]">
            Current Plan
          </h4>
          <p className="text-body-regular-12 text-[var(--color-error)]">
            {plansError?.message ||
              subError?.message ||
              "Failed to load plan data."}
          </p>
        </div>
      );
    }

    if (!isSubscription && !isPayPerCheck) {
      return (
        <div className={`${CARD} text-center`}>
          <h4 className="text-body-semibold-14 mb-6 flex items-center justify-center text-[var(--color-text-primary)]">
            Current Plan
          </h4>
          <p className="text-body-regular-12 text-[var(--color-text-tertiary)]">
            You currently do not have an active plan. Please select a plan to
            access premium features.
          </p>
          <div className="mt-5 flex justify-center">
            <Button
              text="View Plans"
              size="sm"
              onClick={() => setIsOpenModal(true)}
            />
          </div>
        </div>
      );
    }

    const planIcon = isFreePlan ? (
      <ShieldCheck className="mr-1 h-[17.5px] w-[17.5px] text-[var(--color-text-tertiary)]" />
    ) : isSubscription ? (
      <Crown className="mr-1 h-[17.5px] w-[17.5px] text-yellow-500" />
    ) : (
      <Zap className="mr-1 h-[17.5px] w-[17.5px] text-[var(--color-primary)]" />
    );

    const priceDisplay = isFreePlan
      ? "Free"
      : isPayPerCheck
        ? "Pay as you go"
        : `${formatPrices(currentPlan?.amount ?? 0, "USD")}/${currentPlan?.interval}`;

    const StatusBadge = ({ active }: { active: boolean }) =>
      active ? (
        <span className="rounded-[var(--radius-pill)] bg-[var(--color-success-container)] px-3 py-0.5 text-body-semibold-10 uppercase tracking-wider text-[var(--color-on-success-container)]">
          Active
        </span>
      ) : (
        <span className="rounded-[var(--radius-pill)] bg-[var(--color-error-container)] px-3 py-0.5 text-body-semibold-10 uppercase tracking-wider text-[var(--color-on-error-container)]">
          Cancelled
        </span>
      );

    if (isSubscription && currentPlan) {
      return (
        <div className={CARD}>
          <div className="flex items-center justify-between">
            <h4 className="text-body-semibold-14 mb-6 flex items-center text-[var(--color-text-primary)]">
              {planIcon}
              Current Plan
            </h4>
          </div>

          <div className="mb-3.5 flex justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-body-bold-20 text-[var(--color-text-primary)]">
                  {currentPlan.name}
                </h3>
                <StatusBadge
                  active={
                    subscription?.subscription?.status === "active"
                  }
                />
              </div>
              <p className="text-body-regular-12 mt-1 text-[var(--color-text-tertiary)]">
                {currentPlan.description}
              </p>
            </div>
            <div className="shrink-0">
              <span className="text-body-semibold-10 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-2.5 py-1 uppercase tracking-wider text-[var(--color-on-primary)]">
                {priceDisplay}
              </span>
            </div>
          </div>

          <ul className="text-body-regular-12 mb-3.5 space-y-2 text-[var(--color-text-secondary)]">
            {currentPlan.benefits.map(item => (
              <li key={item.name} className="flex items-center">
                <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-[var(--color-success)]" />{" "}
                {item.name}
              </li>
            ))}
          </ul>

          {/* Credit balance */}
          {!isFreePlan && (
            <div className="mb-3.5 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-background)] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-body-medium-12 text-[var(--color-text-secondary)]">
                    Credit Balance
                  </span>
                </div>
                <span className="text-body-bold-14 text-[var(--color-primary)]">
                  {creditsLoading ? "..." : formatCredits(balance)}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                text={isFreePlan ? "Upgrade Plan" : "View Plans"}
                size="sm"
                onClick={() => setIsOpenModal(true)}
              />
              {!isFreePlan && (
                <Button
                  text="Buy Credits"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowBuyCredits(true)}
                />
              )}
            </div>

            {isSubscription &&
              subscription?.subscription?.status?.toLowerCase() ===
                "active" && (
                <Button
                  text={
                    isLoadingCancelSubscription
                      ? "Unsubscribing..."
                      : "Unsubscribe"
                  }
                  size="sm"
                  disabled={isLoadingCancelSubscription}
                  variant="danger"
                  onClick={() => setShowCancelConfirm(true)}
                />
              )}
          </div>
        </div>
      );
    }

    /* Pay-Per-Check plan card */
    return (
      <div className={CARD}>
        <h4 className="text-body-semibold-14 mb-6 flex items-center text-[var(--color-text-primary)]">
          {planIcon}
          Current Plan
        </h4>

        <div className="mb-3.5 flex justify-between gap-6">
          <div>
            <h3 className="text-body-bold-20 text-[var(--color-text-primary)]">
              Pay-Per-Check
            </h3>
            <p className="text-body-regular-12 mt-1 text-[var(--color-text-tertiary)]">
              Buy credits and use them anytime
            </p>
          </div>
          <div className="shrink-0">
            <span className="text-body-semibold-10 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-2.5 py-1 uppercase tracking-wider text-[var(--color-on-primary)]">
              {priceDisplay}
            </span>
          </div>
        </div>

        <ul className="text-body-regular-12 mb-3.5 space-y-2 text-[var(--color-text-secondary)]">
          {[
            { name: "AI Detection", rate: CREDIT_RATES["ai"] },
            { name: "Plagiarism", rate: CREDIT_RATES["plagiarism"] },
            { name: "Alignment", rate: CREDIT_RATES["alignment"] },
            {
              name: "Full Check",
              rate: CREDIT_RATES["ai+alignment+plagiarism"],
            },
          ].map(item => (
            <li key={item.name} className="flex items-center">
              <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-[var(--color-success)]" />{" "}
              {item.name}
            </li>
          ))}
        </ul>

        {!isFreePlan && (
          <div className="mb-3.5 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-background)] p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-[var(--color-primary)]" />
                <span className="text-body-medium-12 text-[var(--color-text-secondary)]">
                  Credit Balance
                </span>
              </div>
              <span className="text-body-bold-14 text-[var(--color-primary)]">
                {creditsLoading ? "..." : formatCredits(balance)}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            text={isFreePlan ? "Upgrade Plan" : "View Plans"}
            size="sm"
            onClick={() => setIsOpenModal(true)}
          />
          {!isFreePlan && (
            <Button
              text="Buy Credits"
              size="sm"
              variant="outline"
              onClick={() => setShowBuyCredits(true)}
            />
          )}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════
     Billing History Card — plan-aware
     ═══════════════════════════════════════════ */
  const BillingHistoryCard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [usagePage, setUsagePage] = useState(1);

    const subHistorySkip = (currentPage - 1) * BILLING_ITEMS_PER_PAGE;
    const {
      data: subscriptionHistory,
      totalCount: subTotalCount,
      isLoading: subHistoryLoading,
      error: subHistoryError,
    } = useSubscriptionHistory({
      skip: subHistorySkip,
      take: BILLING_ITEMS_PER_PAGE,
    });

    const creditHistorySkip =
      (currentPage - 1) * CREDIT_HISTORY_ITEMS_PER_PAGE;
    const {
      data: creditHistory,
      totalCount: creditTotalCount,
      isLoading: creditHistoryLoading,
    } = useCreditHistory({
      skip: creditHistorySkip,
      take: CREDIT_HISTORY_ITEMS_PER_PAGE,
    });

    const usageHistorySkip =
      (usagePage - 1) * CREDIT_HISTORY_ITEMS_PER_PAGE;
    const {
      data: usageHistoryRaw,
      hasMore: usageHasMore,
      isLoading: usageHistoryLoading,
    } = useCreditHistory({
      skip: usageHistorySkip,
      take: CREDIT_HISTORY_ITEMS_PER_PAGE,
    });

    const usageHistory = usageHistoryRaw.filter(item => item.type === "usage");
    const transactionHistory = creditHistory.filter(
      item => item.type !== "usage",
    );

    const showCreditHistory = isPayPerCheck || isSubscription;

    const isLoading =
      subHistoryLoading ||
      (showCreditHistory && (creditHistoryLoading || usageHistoryLoading));

    const totalCount = showCreditHistory ? creditTotalCount : subTotalCount;
    const itemsPerPage = showCreditHistory
      ? CREDIT_HISTORY_ITEMS_PER_PAGE
      : BILLING_ITEMS_PER_PAGE;
    const totalPages =
      totalCount > 0 ? Math.ceil(totalCount / itemsPerPage) : 0;

    useEffect(() => {
      if (totalCount > 0 && currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    }, [totalCount, currentPage, totalPages]);

    const goToNextPage = () => setCurrentPage(prev => prev + 1);
    const goToPreviousPage = () => {
      if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const goToNextUsagePage = () => {
      if (usageHasMore) setUsagePage(prev => prev + 1);
    };
    const goToPreviousUsagePage = () => {
      if (usagePage > 1) setUsagePage(prev => prev - 1);
    };

    const PaginationControls = ({
      page,
      total,
      onPrev,
      onNext,
    }: {
      page: number;
      total: number;
      onPrev: () => void;
      onNext: () => void;
    }) => (
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={page === 1}
          className="flex items-center gap-1.5 rounded-[var(--radius-button)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] px-3 py-1.5 text-body-regular-12 text-[var(--color-text-secondary)] transition-[background,border-color] duration-150 hover:border-[var(--color-border-medium)] hover:bg-[var(--color-surface-background)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-body-regular-12 text-[var(--color-text-tertiary)]">
          Page {page} of {total}
        </span>
        <button
          onClick={onNext}
          disabled={page === total}
          className="flex items-center gap-1.5 rounded-[var(--radius-button)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] px-3 py-1.5 text-body-regular-12 text-[var(--color-text-secondary)] transition-[background,border-color] duration-150 hover:border-[var(--color-border-medium)] hover:bg-[var(--color-surface-background)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );

    if (isLoading) {
      return (
        <div className={`${SKELETON_CARD}`}>
          <div className="mb-4 h-5 w-1/3 rounded bg-[var(--color-surface-background)]" />
          <div className="mb-6 h-4 w-2/3 rounded bg-[var(--color-surface-background)]" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-2 h-4 w-full rounded bg-[var(--color-surface-background)]" />
          ))}
        </div>
      );
    }

    if (isFreePlan) {
      return (
        <div className={`${CARD} text-center`}>
          <h4 className="text-body-medium-14 mb-3 text-[var(--color-text-primary)]">
            Billing History
          </h4>
          <p className="text-body-regular-12 text-[var(--color-text-tertiary)]">
            No billing history on the Free plan.
          </p>
          <Button
            text="Upgrade Plan"
            size="sm"
            className="mt-4"
            onClick={() => setIsOpenModal(true)}
          />
        </div>
      );
    }

    if (subHistoryError && !showCreditHistory) {
      return (
        <div className={ERROR_CARD}>
          <h4 className="text-body-medium-14 mb-5 text-[var(--color-error)]">
            Billing History
          </h4>
          <p className="text-body-regular-12 text-[var(--color-error)]">
            {subHistoryError?.message || "Failed to load billing history."}
          </p>
        </div>
      );
    }

    /* ── Pay-Per-Check credit transactions ── */
    if (isPayPerCheck) {
      if (creditTotalCount === 0) {
        return (
          <div className={`${CARD} text-center`}>
            <h4 className="text-body-medium-14 mb-3 text-[var(--color-text-primary)]">
              Transaction History
            </h4>
            <p className="text-body-regular-12 text-[var(--color-text-tertiary)]">
              No credit transactions yet.
            </p>
          </div>
        );
      }

      return (
        <div className={CARD}>
          <div className="mb-5 flex items-center justify-between">
            <h4 className="text-body-medium-14 text-[var(--color-text-primary)]">
              Transaction History
            </h4>
          </div>
          {transactionHistory.length === 0 ? (
            <p className="text-body-regular-12 text-[var(--color-text-tertiary)]">
              No credit transactions yet.
            </p>
          ) : (
            <ul className="text-body-regular-12 space-y-2.5">
              {transactionHistory.map(item => (
                <li
                  key={item.id}
                  className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5 last:border-0"
                >
                  <div>
                    <p className="text-body-medium-12 text-[var(--color-text-primary)]">
                      {item.description}
                    </p>
                    <p className="text-body-regular-10 text-[var(--color-text-tertiary)]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-body-medium-12 text-[var(--color-success)]">
                    +{formatCredits(Math.abs(item.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {totalPages > 1 && (
            <PaginationControls
              page={currentPage}
              total={totalPages}
              onPrev={goToPreviousPage}
              onNext={goToNextPage}
            />
          )}
          {usageHistory.length > 0 && (
            <div className="mt-5 border-t border-[var(--color-border-subtle)] pt-4">
              <p className="text-body-medium-12 mb-2.5 text-[var(--color-text-tertiary)]">
                Usage History
              </p>
              <ul className="text-body-regular-12 space-y-2">
                {usageHistory.map(item => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between border-b border-[var(--color-border-subtle)] py-2"
                  >
                    <span className="text-[var(--color-text-primary)]">
                      {item.description}
                    </span>
                    <span className="text-body-medium-12 text-[var(--color-error)]">
                      -{formatCredits(Math.abs(item.amount))}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between">
                <Button
                  text="Previous"
                  onClick={goToPreviousUsagePage}
                  disabled={usagePage === 1}
                  variant="secondary"
                  size="sm"
                />
                <span className="text-body-regular-12 text-[var(--color-text-tertiary)]">
                  Page {usagePage}
                </span>
                <Button
                  text="Next"
                  onClick={goToNextUsagePage}
                  disabled={!usageHasMore}
                  variant="secondary"
                  size="sm"
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    /* ── Subscription billing + credit transactions ── */
    const hasSubHistory = subTotalCount > 0;
    const hasCreditHistory = creditTotalCount > 0;

    if (!hasSubHistory && !hasCreditHistory) {
      return (
        <div className={`${CARD} text-center`}>
          <h4 className="text-body-medium-14 mb-3 text-[var(--color-text-primary)]">
            Billing History
          </h4>
          <p className="text-body-regular-12 text-[var(--color-text-tertiary)]">
            No billing data to display yet.
          </p>
        </div>
      );
    }

    return (
      <div className={CARD}>
        <div className="mb-5 flex items-center justify-between">
          <h4 className="text-body-medium-14 text-[var(--color-text-primary)]">
            Billing History
          </h4>
        </div>

        {hasSubHistory && (
          <div className="mb-4">
            <p className={SECTION_LABEL}>Subscription</p>
            <ul className="text-body-regular-14 mt-2 space-y-2 text-[var(--color-text-primary)]">
              {subscriptionHistory.map(item => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] py-2.5"
                >
                  <span className="min-w-0 truncate">{item.name}</span>
                  <span className="shrink-0">
                    {formatPrices(item.amountUnit, "USD")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasCreditHistory && (
          <div>
            {hasSubHistory && (
              <p className={SECTION_LABEL}>Credit Transactions</p>
            )}
            {transactionHistory.length === 0 ? (
              <p className="text-body-regular-12 mt-2 text-[var(--color-text-tertiary)]">
                No credit transactions yet.
              </p>
            ) : (
              <ul className="text-body-regular-12 mt-2 space-y-2">
                {transactionHistory.map(item => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] py-3"
                  >
                    <span className="min-w-0 truncate text-[var(--color-text-primary)]">
                      {item.description}
                    </span>
                    <span className="text-body-medium-12 shrink-0 text-[var(--color-success)]">
                      +{formatCredits(Math.abs(item.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <PaginationControls
                page={currentPage}
                total={totalPages}
                onPrev={goToPreviousPage}
                onNext={goToNextPage}
              />
            )}
          </div>
        )}

        {usageHistory.length > 0 && (
          <div className="mt-5 border-t border-[var(--color-border-subtle)] pt-4">
            <p className="text-body-medium-12 mb-2.5 text-[var(--color-text-tertiary)]">
              Usage History
            </p>
            <ul className="text-body-regular-12 space-y-2">
              {usageHistory.map(item => (
                <li
                  key={item.id}
                  className="flex items-center justify-between border-b border-[var(--color-border-subtle)] py-2"
                >
                  <span className="text-[var(--color-text-primary)]">
                    {item.description}
                  </span>
                  <span className="text-body-medium-12 text-[var(--color-error)]">
                    -{formatCredits(Math.abs(item.amount))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between">
              <Button
                text="Previous"
                onClick={goToPreviousUsagePage}
                disabled={usagePage === 1}
                variant="secondary"
                size="sm"
              />
              <span className="text-body-regular-12 text-[var(--color-text-tertiary)]">
                Page {usagePage}
              </span>
              <Button
                text="Next"
                onClick={goToNextUsagePage}
                disabled={!usageHasMore}
                variant="secondary"
                size="sm"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════
     Render
     ═══════════════════════════════════════════ */
  return (
    <>
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex w-full flex-col gap-6 md:flex-row md:items-start lg:flex-1">
          <div className="w-full space-y-6 md:w-1/2 lg:w-full">
            <CurrentPlanCard />
          </div>
          <div className="w-full space-y-6 md:w-1/2 lg:hidden">
            <UsageCard />
          </div>
        </div>

        <div className="w-full space-y-6 lg:max-w-[300px]">
          <div className="hidden w-full lg:block">
            <UsageCard />
          </div>
          <div className="w-full">
            <BillingHistoryCard />
          </div>
        </div>
      </div>

      <ViewPlanModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
      />

      <BuyCreditsModal
        isOpen={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
      />

      <MessageModal
        isOpen={showCancelConfirm}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription?"
        submitText="Yes, Cancel"
        cancelText="No, Keep"
        onSubmit={async () => {
          const success = await cancelSubscription();
          if (success) {
            setShowCancelConfirm(false);
          }
        }}
        onCancel={() => setShowCancelConfirm(false)}
        icon={<AlertTriangle className="h-8 w-8" />}
        iconStyle="bg-[var(--color-error-container)] border-[var(--color-error)]/10"
        isProcessing={isLoadingCancelSubscription}
      />
    </>
  );
};

export default Billing;
