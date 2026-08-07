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
  // useFetchHook,
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
// import { MonthlyUsageProps } from "@/types";
import BuyCreditsModal from "../modals/BuyCreditsModal";

const Billing = () => {
  // const { token } = useClaims();
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

  // Usage Card — plan-aware
  const UsageCard = () => {
    // // Free plan: fetch monthly usage for check limits
    // const { data: monthlyUsage, isLoading: usageLoading } =
    //   useFetchHook<MonthlyUsageProps>({
    //     endpoint: `${API_BASE_URL}/v1/credits/status`,
    //     enabled: !!token,
    //   });

    // Paid plans: fetch detailed credit balance
    const { data: creditData, isLoading: creditDataLoading } =
      useCreditBalance();

    const isLoading = subLoading || (!isFreePlan && creditDataLoading);

    if (plansLoading || subLoading || isLoading) {
      return (
        <div className="mx-auto max-w-2xl flex-1 animate-pulse rounded-[12.75px] border border-gray-200 p-6 shadow-sm">
          <div className="mb-4 h-6 w-1/3 rounded bg-gray-200" />
          <div className="mb-6 h-4 w-2/3 rounded bg-gray-200" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-[21px]">
              <div className="mb-2 h-4 w-full rounded bg-gray-200" />
              <div className="h-2 w-full rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      );
    }

    // Free Plan Usage
    if (isFreePlan) {
      const addOneMonth = (date: Date): Date => {
        const result = new Date(date);
        const day = result.getDate();

        result.setMonth(result.getMonth() + 1);

        // Handle cases where the next month has fewer days
        if (result.getDate() < day) {
          result.setDate(0); // go to last day of previous month
        }

        return result;
      };
      const checksUsage = subscription;
      const checksUsed = checksUsage?.freeChecksUsed ?? 0;
      const checksLimit = FREE_PLAN_LIMITS.checksPerMonth;
      const checksPercent = (checksUsed / checksLimit) * 100;

      const resetDate = checksUsage?.lastFreeCheckResetDate
        ? new Date(checksUsage.lastFreeCheckResetDate!)
        : new Date();
      const resetDateString = (() => {
        return addOneMonth(resetDate).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      })();

      return (
        <div className="mx-auto max-w-2xl flex-1 rounded-[12.75px] border border-gray-200 p-6 shadow-sm">
          <h4 className="text-body-medium-14 mb-1 text-black">
            Free Plan Usage
          </h4>
          <p className="text-body-regular-12 mb-5 text-gray-500">
            Track your monthly free plan limits
          </p>

          {/* Checks used */}
          <div className="mb-5">
            <div className="text-body-medium-12 mb-1 flex justify-between text-black">
              <span>Checks Used</span>
              <span
                className={
                  checksUsed >= checksLimit ? "text-red-600" : "text-green-600"
                }
              >
                {checksUsed} / {checksLimit}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full ${checksUsed >= checksLimit ? "bg-red-500" : "bg-blue-500"}`}
                style={{ width: `${Math.min(checksPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Plan limits */}
          <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="text-body-regular-12 flex justify-between text-gray-600">
              <span>Max words per check</span>
              <span className="font-medium text-gray-900">
                {FREE_PLAN_LIMITS.maxWordsPerCheck.toLocaleString()}
              </span>
            </div>
            <div className="text-body-regular-12 flex justify-between text-gray-600">
              <span>Available checks</span>
              <span className="font-medium text-gray-900">
                AI Detection only
              </span>
            </div>
          </div>

          <div className="text-body-regular-12 mt-4 text-center text-gray-500">
            Resets on {resetDateString}
          </div>
        </div>
      );
    }

    // Pay-Per-Check / Subscription usage
    const creditsUsed = creditData?.used ?? 0;
    const monthlyAllocation =
      creditData?.monthlyAllocation ??
      (isSubscription ? SUBSCRIPTION_PLAN.monthlyCredits : 0);
    const creditsPercent =
      isSubscription && monthlyAllocation > 0
        ? (creditsUsed / monthlyAllocation) * 100
        : 0;

    return (
      <div className="mx-auto max-w-2xl flex-1 rounded-[12.75px] border border-gray-200 p-6 shadow-sm">
        <h4 className="text-body-medium-14 mb-1 text-black">
          {isSubscription ? "Monthly Credits" : "Credit Balance"}
        </h4>
        <p className="text-body-regular-12 mb-5 text-gray-500">
          {isSubscription
            ? "Track your monthly credit allocation"
            : "Your available credits for running checks"}
        </p>

        {/* Credit balance — prominent display */}
        <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Coins className="h-5 w-5 text-blue-500" />
            <span className="text-2xl font-bold text-blue-600">
              {creditsLoading ? "..." : formatCredits(balance)}
            </span>
          </div>
          <p className="text-body-regular-12 mt-1 text-blue-600/70">
            credits available
          </p>
        </div>

        {/* Subscription: show allocation progress */}
        {isSubscription && monthlyAllocation > 0 && (
          <div className="mb-5">
            <div className="text-body-medium-12 mb-1 flex justify-between text-black">
              <span>Monthly Usage</span>
              <span
                className={
                  creditsUsed >= monthlyAllocation
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                {formatCredits(creditsUsed)} /{" "}
                {formatCredits(monthlyAllocation)}
              </span>
            </div>

            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full ${creditsUsed >= monthlyAllocation ? "bg-red-500" : "bg-blue-500"}`}
                style={{ width: `${Math.min(creditsPercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Credits used this period for Pay-Per-Check */}
        {isPayPerCheck && creditsUsed > 0 && (
          <div className="mb-5">
            <div className="text-body-regular-12 flex justify-between text-gray-600">
              <span>Credits used this month</span>
              <span className="font-medium text-gray-900">
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

  // Current Plan Card
  const CurrentPlanCard = () => {
    if (plansLoading || subLoading) {
      return (
        <div className="animate-pulse rounded-[12.75px] border border-gray-200 p-[21px] shadow-sm lg:mx-0">
          <div className="mb-4 h-6 w-1/3 rounded bg-gray-200" />
          <div className="mb-6 h-4 w-2/3 rounded bg-gray-200" />
          <div className="mb-2 h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      );
    }
    if (plansError || subError) {
      return (
        <div className="rounded-[12.75px] border border-red-200 p-[21px] text-center shadow-sm lg:mx-0">
          <h4 className="text-body-semibold-14 mb-[26.25px] flex items-center justify-center text-red-600">
            Current Plan
          </h4>
          <p className="text-body-regular-12 text-red-500">
            {plansError?.message ||
              subError?.message ||
              "Failed to load plan data."}
          </p>
        </div>
      );
    }
    if (!isSubscription && !isPayPerCheck) {
      return (
        <div className="rounded-[12.75px] border border-gray-200 p-[21px] text-center shadow-sm lg:mx-0">
          <h4 className="text-body-semibold-14 mb-[26.25px] flex items-center justify-center text-black">
            Current Plan
          </h4>
          <p className="text-body-regular-12 text-gray-500">
            You currently do not have an active plan. Please select a plan to
            access premium features.
          </p>
          <div className="mt-[21px] flex justify-center">
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
      <ShieldCheck className="mr-1 h-[17.7px] w-[17.5px] text-gray-400" />
    ) : isSubscription ? (
      <Crown className="mr-1 h-[17.7px] w-[17.5px] text-yellow-500" />
    ) : (
      <Zap className="mr-1 h-[17.7px] w-[17.5px] text-blue-500" />
    );

    const priceDisplay = isFreePlan
      ? "Free"
      : isPayPerCheck
        ? "Pay as you go"
        : `${formatPrices(currentPlan?.amount ?? 0, "USD")}/${currentPlan?.interval}`;

    if (isSubscription && currentPlan) {
      return (
        <div className="rounded-[12.75px] border border-gray-200 p-[21px] shadow-sm lg:mx-0">
          <div className="flex justify-between">
            <h4 className="text-body-semibold-14 mb-[26.25px] flex items-center text-black">
              {planIcon}
              Current Plan
            </h4>
          </div>
          <div className="mb-[14px] flex justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-body-bold-20 text-black">
                  {currentPlan.name}
                </h3>
                {isSubscription ? (
                  <>
                    {subscription?.subscription?.status === "active" ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        Cancelled
                      </span>
                    )}
                  </>
                ) : null}
              </div>
              <p className="text-body-regular-12 text-gray-500">
                {currentPlan.description}
              </p>
            </div>
            <div className="shrink-0">
              <span className="text-body-regular-12 from-primary-500 via-primary-600 to-primary-700 rounded-[6px] bg-gradient-to-r px-2 py-1 text-white">
                {priceDisplay}
              </span>
            </div>
          </div>
          <ul className="text-body-regular-12 mb-[14px] space-y-2 text-gray-600">
            {currentPlan.benefits.map(item => (
              <li key={item.name} className="flex items-center">
                <CheckCircle className="mr-1 h-[14px] w-[14px] text-green-500" />{" "}
                {item.name}
              </li>
            ))}
          </ul>

          {/* Credit Balance for paid plans */}
          {!isFreePlan && (
            <div className="mb-[14px] rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-blue-500" />
                  <span className="text-body-medium-12 text-gray-700">
                    Credit Balance
                  </span>
                </div>
                <span className="text-body-bold-14 text-blue-600">
                  {creditsLoading ? "..." : formatCredits(balance)}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
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

    return (
      <div className="rounded-[12.75px] border border-gray-200 p-[21px] shadow-sm lg:mx-0">
        <h4 className="text-body-semibold-14 mb-[26.25px] flex items-center text-black">
          {planIcon}
          Current Plan
        </h4>
        <div className="mb-[14px] flex justify-between gap-6">
          <div>
            <h3 className="text-body-bold-20 text-black">{"Pay-Per-Check"}</h3>
            <p className="text-body-regular-12 text-gray-500">
              Buy credits and use them anytime
            </p>
          </div>
          <div className="shrink-0">
            <span className="text-body-regular-12 from-primary-500 via-primary-600 to-primary-700 rounded-[6px] bg-gradient-to-r px-2 py-1 text-white">
              {priceDisplay}
            </span>
          </div>
        </div>
        <ul className="text-body-regular-12 mb-[14px] space-y-2 text-gray-600">
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
              <CheckCircle className="mr-1 h-[14px] w-[14px] text-green-500" />{" "}
              {item.name}
            </li>
          ))}
        </ul>

        {/* Credit Balance for paid plans */}
        {!isFreePlan && (
          <div className="mb-[14px] rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-blue-500" />
                <span className="text-body-medium-12 text-gray-700">
                  Credit Balance
                </span>
              </div>
              <span className="text-body-bold-14 text-blue-600">
                {creditsLoading ? "..." : formatCredits(balance)}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
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

  // Billing History Card — plan-aware
  const BillingHistoryCard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [usagePage, setUsagePage] = useState(1);

    // Subscription history (for Subscription plan billing)
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

    // Credit transaction history (for Pay-Per-Check and Subscription)
    const creditHistorySkip = (currentPage - 1) * CREDIT_HISTORY_ITEMS_PER_PAGE;
    const {
      data: creditHistory,
      totalCount: creditTotalCount,
      isLoading: creditHistoryLoading,
    } = useCreditHistory({
      skip: creditHistorySkip,
      take: CREDIT_HISTORY_ITEMS_PER_PAGE,
    });

    const usageHistorySkip = (usagePage - 1) * CREDIT_HISTORY_ITEMS_PER_PAGE;
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

    // Decide which data to show based on plan
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

    if (isLoading) {
      return (
        <div className="animate-pulse rounded-[12.75px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-6 w-1/3 rounded bg-gray-200" />
          <div className="mb-6 h-4 w-2/3 rounded bg-gray-200" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-2 h-4 w-full rounded bg-gray-200" />
          ))}
        </div>
      );
    }

    // Free plan — no billing history
    if (isFreePlan) {
      return (
        <div className="rounded-[12.75px] border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h4 className="text-body-medium-14 mb-3 text-black">
            Billing History
          </h4>
          <p className="text-body-regular-12 text-gray-500">
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
        <div className="rounded-[12.75px] border border-red-200 bg-white p-6 text-center shadow-sm">
          <h4 className="text-body-medium-14 mb-[21px] text-red-600">
            Billing History
          </h4>
          <p className="text-body-regular-12 text-red-500">
            {subHistoryError?.message || "Failed to load billing history."}
          </p>
        </div>
      );
    }

    // Pay-Per-Check: show credit transactions
    if (isPayPerCheck) {
      if (creditTotalCount === 0) {
        return (
          <div className="rounded-[12.75px] border border-gray-200 bg-white p-6 text-center shadow-sm">
            <h4 className="text-body-medium-14 mb-3 text-black">
              Transaction History
            </h4>
            <p className="text-body-regular-12 text-gray-500">
              No credit transactions yet.
            </p>
          </div>
        );
      }
      return (
        <div className="rounded-[12.75px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-[21px] flex items-center justify-between">
            <h4 className="text-body-medium-14 text-black">
              Transaction History
            </h4>
          </div>
          {transactionHistory.length === 0 ? (
            <p className="text-body-regular-12 text-gray-500">
              No credit transactions yet.
            </p>
          ) : (
            <ul className="text-body-regular-12 space-y-3">
              {transactionHistory.map(item => (
                <li
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0"
                >
                  <div>
                    <p className="text-body-medium-12 text-black">
                      {item.description}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-body-medium-12 text-green-600">
                    +{formatCredits(Math.abs(item.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                text="Previous"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                variant="secondary"
                className="px-3 py-1 text-sm"
              />
              <span className="text-body-regular-12 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                text="Next"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                variant="secondary"
                className="px-3 py-1 text-sm"
              />
            </div>
          )}
          {usageHistory.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-body-medium-12 mb-2 text-gray-500">
                Usage History
              </p>
              <ul className="text-body-regular-12 space-y-2">
                {usageHistory.map(item => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between border-b border-b-[#eceaea] py-2"
                  >
                    <span className="text-black">{item.description}</span>
                    <span className="text-body-medium-12 text-red-600">
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
                  className="px-3 py-1 text-sm"
                />
                <span className="text-body-regular-12 text-gray-700">
                  Page {usagePage}
                </span>
                <Button
                  text="Next"
                  onClick={goToNextUsagePage}
                  disabled={!usageHasMore}
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Subscription: show subscription billing + credit transactions
    const hasSubHistory = subTotalCount > 0;
    const hasCreditHistory = creditTotalCount > 0;

    if (!hasSubHistory && !hasCreditHistory) {
      return (
        <div className="rounded-[12.75px] border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h4 className="text-body-medium-14 mb-3 text-black">
            Billing History
          </h4>
          <p className="text-body-regular-12 text-gray-500">
            No billing data to display yet.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-[12.75px] border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-[21px] flex items-center justify-between">
          <h4 className="text-body-medium-14 text-black">Billing History</h4>
        </div>

        {/* Subscription payments */}
        {hasSubHistory && (
          <div className="mb-4">
            <p className="text-body-medium-12 mb-2 text-gray-500">
              Subscription
            </p>
            <ul className="text-body-regular-14 space-y-2 text-black">
              {subscriptionHistory.map(item => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b border-b-[#eceaea] py-2"
                >
                  <span className="min-w-0 truncate">{item.name}</span>
                  <div className="flex shrink-0 items-center gap-3">
                    <span>{formatPrices(item.amountUnit, "USD")}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Credit purchases */}
        {hasCreditHistory && (
          <div>
            {hasSubHistory && (
              <p className="text-body-medium-12 mb-2 text-gray-500">
                Credit Transactions
              </p>
            )}
            {transactionHistory.length === 0 ? (
              <p className="text-body-regular-12 text-gray-500">
                No credit transactions yet.
              </p>
            ) : (
              <ul className="text-body-regular-12 space-y-2">
                {transactionHistory.map(item => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-b border-b-[#eceaea] py-4"
                  >
                    <span className="min-w-0 truncate text-black">
                      {item.description}
                    </span>
                    <span className="text-body-medium-12 shrink-0 text-green-600">
                      +{formatCredits(Math.abs(item.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-body-regular-12 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {usageHistory.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="text-body-medium-12 mb-2 text-gray-500">
              Usage History
            </p>
            <ul className="text-body-regular-12 space-y-2">
              {usageHistory.map(item => (
                <li
                  key={item.id}
                  className="flex items-center justify-between border-b border-b-[#eceaea] py-2"
                >
                  <span className="text-black">{item.description}</span>
                  <span className="text-body-medium-12 text-red-600">
                    -{formatCredits(Math.abs(item.amount))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={goToPreviousUsagePage}
                disabled={usagePage === 1}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-body-regular-12 text-gray-700">
                Page {usagePage}
              </span>
              <button
                onClick={goToNextUsagePage}
                disabled={!usageHasMore}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start">
        {/* Responsive grid for stacking and side-by-side layouts */}
        <div className="flex w-full flex-col gap-6 md:flex-row md:items-start lg:flex-1">
          {/* Current Plan */}
          <div className="w-full space-y-6 md:w-1/2 lg:w-full">
            <CurrentPlanCard />
          </div>

          {/* Usage — mobile/tablet */}
          <div className="w-full space-y-6 md:w-1/2 lg:hidden">
            <UsageCard />
          </div>
        </div>

        <div className="w-full space-y-6 lg:max-w-[300px]">
          {/* Usage — desktop */}
          <div className="hidden w-full space-y-6 lg:block">
            <UsageCard />
          </div>
          {/* Billing History */}
          <div className="w-full space-y-6 md:w-full md:max-w-full lg:w-auto lg:max-w-[300px]">
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
        iconStyle="bg-red-100 border-red-50"
        isProcessing={isLoadingCancelSubscription}
      />
    </>
  );
};

export default Billing;
