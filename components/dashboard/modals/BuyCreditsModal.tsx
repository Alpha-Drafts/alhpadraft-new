import React, { useState } from "react";
import { Modal } from "@/common";
import { Button } from "@/common";
import {
  CREDIT_PACKAGES,
  CREDIT_PRICE_PER_UNIT,
  API_BASE_URL,
} from "@/constants";
import { formatCredits } from "@/utils";
import { apiClient, formatError } from "@/utils";
import { useClaims } from "@/context";
import { Coins } from "lucide-react";
import { toast } from "react-toastify";

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuyCreditsModal = ({ isOpen, onClose }: BuyCreditsModalProps) => {
  const { token, refreshClaims } = useClaims();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const customDollars = parseFloat(customAmount) || 0;
  const customCredits =
    customDollars >= 1 ? Math.floor(customDollars / CREDIT_PRICE_PER_UNIT) : 0;

  const getSelectedCredits = () => {
    if (selectedPackage !== null) {
      return CREDIT_PACKAGES[selectedPackage].credits;
    }
    if (customCredits > 0) {
      return customCredits;
    }
    return 0;
  };

  const getSelectedAmountCents = () => {
    if (selectedPackage !== null) {
      return CREDIT_PACKAGES[selectedPackage].amount;
    }
    if (customDollars >= 1) {
      return Math.round(customDollars * 100);
    }
    return 0;
  };

  const handlePackageSelect = (index: number) => {
    setSelectedPackage(index);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedPackage(null);
  };

  const handlePurchase = async () => {
    if (!token) {
      toast.error("Please log in to purchase credits.");
      return;
    }

    const amountCents = getSelectedAmountCents();
    if (amountCents < 100) {
      toast.error("Minimum purchase is $1.00");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/v1/payments/checkout`,
        { amount: amountCents / 100, planType: "pay_per_check" },
      );

      if (response?.data?.status !== "success") {
        toast.error(
          formatError(
            response?.data?.message || "Failed to create purchase session.",
          ),
        );
        return;
      }

      if (response?.data?.data?.url) {
        if (typeof window !== "undefined" && refreshClaims) {
          await refreshClaims();
        }
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      toast.error(
        formatError(error, "Failed to purchase credits. Please try again."),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const credits = getSelectedCredits();
  const canPurchase = credits > 0 && !isProcessing;

  return (
    <Modal
      isOpen={isOpen}
      onCancel={onClose}
      ariaLabel="Buy Credits"
      wrapperClassName="max-w-md"
    >
      <div className="mx-auto max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-lg sm:max-h-[calc(100vh-3rem)]">
        <div className="mb-6 text-center">
          <Coins className="mx-auto mb-3 h-10 w-10 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-900">Buy Credits</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose a package or enter a custom amount
          </p>
        </div>

        {/* Credit Packages */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          {CREDIT_PACKAGES.map((pkg, index) => (
            <button
              key={pkg.amount}
              type="button"
              onClick={() => handlePackageSelect(index)}
              className={`rounded-lg border-2 p-3 text-center transition-colors ${
                selectedPackage === index
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="text-lg font-semibold text-gray-900">{pkg.label}</p>
              <p className="text-xs text-gray-500">
                {formatCredits(pkg.credits)} credits
              </p>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="mb-5">
          <label
            htmlFor="custom-amount"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Custom amount
          </label>
          <div className="relative">
            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
              $
            </span>
            <input
              id="custom-amount"
              type="number"
              min="1"
              step="1"
              placeholder="Enter amount"
              value={customAmount}
              onChange={e => handleCustomAmountChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pr-3 pl-7 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {customCredits > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              = {formatCredits(customCredits)} credits
            </p>
          )}
        </div>

        {/* Summary */}
        {credits > 0 && (
          <div className="mb-5 rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-sm text-gray-600">You will receive</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCredits(credits)}
            </p>
            <p className="text-sm text-gray-500">credits</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            text="Cancel"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isProcessing}
          />
          <Button
            text={isProcessing ? "Processing..." : "Purchase"}
            variant="primary"
            onClick={handlePurchase}
            className="flex-1"
            disabled={!canPurchase}
          />
        </div>
      </div>
    </Modal>
  );
};

export default BuyCreditsModal;
