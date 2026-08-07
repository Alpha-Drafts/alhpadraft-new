import React from "react";
import { MessageModal, Modal } from "@/common";
import {
  formatCredits,
  isFreePlan as checkIsFreePlan,
  normalizePlanName,
} from "@/utils";
import { SUBSCRIPTION_PLAN } from "@/constants";
import { AlertTriangle, Crown, CreditCard, ArrowRight } from "lucide-react";

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onBuyCredits: () => void;
  onCancel: () => void;
  requiredCredits: number;
  availableCredits: number;
  planName?: string;
  onUpgradePlan?: () => void;
  textMessage?: string;
}

const InsufficientCreditsModal = ({
  isOpen,
  onBuyCredits,
  onCancel,
  requiredCredits,
  availableCredits,
  planName,
  onUpgradePlan,
  textMessage,
}: InsufficientCreditsModalProps) => {
  const deficit = requiredCredits - availableCredits;

  // Free plan: show upgrade options
  if (checkIsFreePlan(planName)) {
    return (
      <Modal
        isOpen={isOpen}
        onCancel={onCancel}
        closeOnOverlayClick={true}
        wrapperClassName="max-w-md"
      >
        <div className="rounded-xl bg-white px-8 py-10 text-center shadow-lg">
          <span
            className="mx-auto mb-6 flex items-center justify-center rounded-2xl"
            style={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            }}
          >
            <AlertTriangle className="h-8 w-8 text-white" />
          </span>

          <h3 className="text-xl font-semibold text-gray-900">
            Free Plan Limit Reached
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            You&apos;ve used all your free checks this month. Upgrade your plan
            to continue running verifications.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={onUpgradePlan}
              className="w-full rounded-xl border-2 border-gray-200 p-4 text-left transition-all hover:border-blue-500 hover:bg-blue-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Pay-Per-Check</p>
                  <p className="text-xs text-gray-500">
                    Buy credits and use them anytime. No monthly fee.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
              </div>
            </button>

            <button
              onClick={onUpgradePlan}
              className="w-full rounded-xl border-2 border-violet-200 bg-violet-50 p-4 text-left transition-all hover:border-violet-500 hover:bg-violet-100"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                  <Crown className="h-5 w-5 text-violet-600" />
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    Subscription
                    <span className="ml-2 text-xs font-medium text-violet-600">
                      Best Value
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {SUBSCRIPTION_PLAN.priceDisplay}/month &middot;{" "}
                    {SUBSCRIPTION_PLAN.monthlyCredits.toLocaleString()} credits
                    included
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
              </div>
            </button>
          </div>

          <button
            onClick={onCancel}
            className="mt-4 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </Modal>
    );
  }

  // Subscription plan: show buy extra credits with renewal note
  if (normalizePlanName(planName) === "subscription") {
    return (
      <MessageModal
        isOpen={isOpen}
        icon={<AlertTriangle className="icon" />}
        iconStyle="!bg-yellow-100"
        title="Monthly Credits Used"
        message={
          <>
            You&apos;ve used all your monthly credits. You need{" "}
            <strong>{formatCredits(deficit)}</strong> more credits to run this
            check.
            <br />
            <br />
            <span className="text-gray-500">
              Your {SUBSCRIPTION_PLAN.monthlyCredits.toLocaleString()} monthly
              credits will renew at the start of your next billing cycle. You
              can buy extra credits to continue now.
            </span>
          </>
        }
        submitText="Buy Extra Credits"
        onSubmit={onBuyCredits}
        cancelText="Cancel"
        onCancel={onCancel}
      />
    );
  }

  // Pay-Per-Check (default): show buy credits
  return (
    <MessageModal
      isOpen={isOpen}
      icon={<AlertTriangle className="icon" />}
      iconStyle="!bg-yellow-100"
      title="Insufficient Credits"
      message={
        textMessage ||
        `You need ${formatCredits(deficit)} more credits to proceed.`
      }
      submitText="Buy Credits"
      onSubmit={onBuyCredits}
      cancelText="Cancel"
      onCancel={onCancel}
    />
  );
};

export default InsufficientCreditsModal;
