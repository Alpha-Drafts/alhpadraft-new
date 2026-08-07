import React, { useEffect, useState } from "react";
import { Modal } from "@/common/ui/modals/Modal";
import { Button } from "@/common";
import { CheckCircle2, RefreshCcw, Lock } from "lucide-react";
import { CheckTypeId } from "@/types";
import { useCredits } from "@/context";
import { useCurrentSubscription } from "@/hooks";
import { calculateCredits, isFreePlan as checkIsFreePlan } from "@/utils";
import { FREE_PLAN_LIMITS, userRoutes } from "@/constants";
import InsufficientCreditsModal from "@/components/dashboard/modals/InsufficientCreditsModal";
import BuyCreditsModal from "@/components/dashboard/modals/BuyCreditsModal";
import ViewPlanModal from "@/components/dashboard/settings/ViewPlanModal";
import { useRouter } from "next/router";

export interface CheckType {
  id: "ai" | "plagiarism" | "alignment";
  label: string;
  description: string;
}

export const AVAILABLE_CHECKS: CheckType[] = [
  {
    id: "ai",
    label: "AI Detection",
    description: "Check for AI-generated content probability",
  },
  {
    id: "plagiarism",
    label: "Plagiarism",
    description: "Detect missing citations and matches",
  },
  {
    id: "alignment",
    label: "Alignment",
    description: "Compare against assignment instructions",
  },
];

interface CheckSelectionModalProps {
  isOpen: boolean;
  onConfirm: (selectedChecks: string[]) => void;
  onCancel: () => void;
  wordCount?: number;
  initialChecks?: string[];
}

const STORAGE_KEY = "integrity-checks-selection";

export const CheckSelectionModal: React.FC<CheckSelectionModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  wordCount = 0,
  initialChecks,
}) => {
  const router = useRouter();
  const { balance } = useCredits();
  const { data: subscription } = useCurrentSubscription();
  const isFreePlan = checkIsFreePlan(subscription?.currentPlan);

  const getDefaultChecks = (): string[] => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fall through
        }
      }
    }
    return isFreePlan ? ["ai"] : ["ai", "plagiarism", "alignment"];
  };

  const [selectedChecks, setSelectedChecks] =
    useState<string[]>(getDefaultChecks);

  // Reset selection each time modal opens: use initialChecks (last-run) if available, else defaults
  useEffect(() => {
    if (isOpen) {
      setSelectedChecks(
        initialChecks && initialChecks.length > 0
          ? initialChecks
          : getDefaultChecks(),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isCheckLocked = (checkId: string) => {
    if (!isFreePlan) return false;
    return !FREE_PLAN_LIMITS.allowedCheckTypes.includes(checkId);
  };

  const toggleCheck = (checkId: string) => {
    if (isCheckLocked(checkId)) return;
    setSelectedChecks(prev =>
      prev.includes(checkId)
        ? prev.filter(id => id !== checkId)
        : [...prev, checkId],
    );
  };

  const handleConfirm = () => {
    // Credit check for paid plans
    if (!isFreePlan && estimatedCredits > 0 && estimatedCredits > balance) {
      setShowInsufficientCredits(true);
      return;
    }

    // Save selection to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedChecks));
    }
    onConfirm(selectedChecks);
  };

  const availableChecks = isFreePlan
    ? AVAILABLE_CHECKS.filter(c =>
        FREE_PLAN_LIMITS.allowedCheckTypes.includes(c.id),
      )
    : AVAILABLE_CHECKS;
  const isAllSelected = selectedChecks.length === availableChecks.length;
  const isNoneSelected = selectedChecks.length === 0;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedChecks([]);
    } else {
      setSelectedChecks(availableChecks.map(c => c.id));
    }
  };

  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Reset child-modal state when the outer modal closes so stale overlays
  // never survive into the next open cycle.
  useEffect(() => {
    if (!isOpen) {
      setShowInsufficientCredits(false);
      setShowBuyCredits(false);
      setShowPlanModal(false);
    }
  }, [isOpen]);

  // Calculate total credits for selected checks
  const estimatedCredits =
    wordCount > 0 && selectedChecks.length > 0
      ? calculateCredits(wordCount, selectedChecks as CheckTypeId[])
      : 0;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onCancel={onCancel}
        closeOnOverlayClick={true}
        wrapperClassName="max-w-lg"
      >
        <div className="modal-content_container px-8 py-10">
          <div className="mx-auto max-w-[480px]">
            {/* Icon section */}
            <span
              className="mx-auto mb-6 flex items-center justify-center rounded-2xl"
              style={{
                width: 56,
                height: 56,
                background:
                  "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)",
              }}
            >
              <RefreshCcw className="h-8 w-8 text-white" />
            </span>

            {/* Title */}
            <h3 className="modal-content_title">Select Integrity Checks</h3>
            <p className="modal-content_sub-title mb-6">
              Choose which checks to run on your document
            </p>

            {/* Select All / Deselect All */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={toggleAll}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                {isAllSelected ? "Deselect All" : "Select All"}
              </button>
            </div>

            {/* Check options */}
            <div className="space-y-3">
              {AVAILABLE_CHECKS.map(check => {
                const isSelected = selectedChecks.includes(check.id);
                const isLocked = isCheckLocked(check.id);

                return (
                  <div
                    key={check.id}
                    className={`flex items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                      isLocked
                        ? "cursor-pointer border-gray-100 bg-gray-50 opacity-60 hover:opacity-80"
                        : isSelected
                          ? "cursor-pointer border-blue-500 bg-blue-50"
                          : "cursor-pointer border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={
                      isLocked
                        ? () => setShowPlanModal(true)
                        : () => toggleCheck(check.id)
                    }
                  >
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        aria-label={check.label}
                        checked={isSelected}
                        onChange={() => toggleCheck(check.id)}
                        disabled={isLocked}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {check.label}
                        </span>
                        {isLocked ? (
                          <Lock className="h-4 w-4 text-gray-400" />
                        ) : isSelected ? (
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {isLocked
                          ? "Upgrade to unlock this check"
                          : check.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer buttons */}
            <div className="mt-8 flex gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isNoneSelected}
                className="flex-1"
              >
                Run {selectedChecks.length > 0 ? selectedChecks.length : ""}{" "}
                Check{selectedChecks.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Rendered outside <Modal> so they manage their own overlay independently
          and are not unmounted when the outer modal closes. */}
      <InsufficientCreditsModal
        isOpen={showInsufficientCredits}
        requiredCredits={estimatedCredits}
        availableCredits={balance}
        planName={subscription?.currentPlan}
        onBuyCredits={() => {
          setShowInsufficientCredits(false);
          setShowBuyCredits(true);
        }}
        onUpgradePlan={() => {
          setShowInsufficientCredits(false);
          router.push(userRoutes.settings + "?tab=billing");
        }}
        onCancel={() => setShowInsufficientCredits(false)}
      />

      <BuyCreditsModal
        isOpen={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
      />

      <ViewPlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
      />
    </>
  );
};
