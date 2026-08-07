import React from "react";
import { CircleCheck, Zap, CreditCard, Crown } from "lucide-react";
import { Button } from "@/common";
import { formatPrices, isFreePlan as checkIsFreePlan } from "@/utils";
import { PlanProps } from "@/types";
import { CREDIT_RATES, FREE_PLAN_LIMITS, SUBSCRIPTION_PLAN } from "@/constants";

interface PlanCardProps {
  plan: PlanProps;
  isHighlighted?: boolean;
  buttonText: string;
  buttonVariant: "primary" | "secondary" | "outline";
  onButtonClick: () => void;
  isDisabled?: boolean;
  isModal?: boolean;
}

const PlanCard = ({
  plan,
  isHighlighted = false,
  buttonText,
  buttonVariant,
  onButtonClick,
  isDisabled = false,
  isModal = false,
}: PlanCardProps) => {
  const isFree = checkIsFreePlan(plan?.name);
  const isPayPerCheck = plan?.name === "Pay-Per-Check";
  const isSubscription = plan?.name === "Subscription";

  const renderPriceSection = () => {
    if (isFree) {
      return (
        <p className="mt-2 flex items-baseline justify-center">
          <span className="text-3xl font-semibold text-gray-900">$0</span>
          <span className="text-body-regular-12 text-gray-500">/month</span>
        </p>
      );
    }

    if (isPayPerCheck) {
      return (
        <div className="mt-2 text-center">
          <p className="flex items-baseline justify-center">
            <span className="text-3xl font-semibold text-gray-900">No fee</span>
          </p>
          <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            From $5
          </span>
        </div>
      );
    }

    if (isSubscription) {
      return (
        <div className="mt-2 text-center">
          <p className="flex items-baseline justify-center">
            <span className="text-3xl font-semibold text-white">
              {SUBSCRIPTION_PLAN.priceDisplay}
            </span>
            <span className="text-body-regular-12 text-white/80">/month</span>
          </p>
          <p className="text-body-regular-12 mt-1 text-white/90">
            {SUBSCRIPTION_PLAN.monthlyCredits.toLocaleString()} credits included
          </p>
        </div>
      );
    }

    return (
      <p className="mt-2 flex items-baseline justify-center">
        <span
          className={`text-3xl font-semibold ${isHighlighted ? "text-white" : "text-gray-900"}`}
        >
          {formatPrices(plan?.amount, "USD")}
        </span>
        <span
          className={`text-body-regular-12 ${isHighlighted ? "text-white" : "text-gray-500"}`}
        >
          {`/per ${plan?.interval}`}
        </span>
      </p>
    );
  };

  const renderDetails = () => {
    if (isFree) {
      return (
        <div className="mt-4 flex-1">
          <div className="mb-3 space-y-2 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Checks per month</span>
              <span className="font-semibold text-gray-900">
                {FREE_PLAN_LIMITS.checksPerMonth}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Max words per check</span>
              <span className="font-semibold text-gray-900">
                {FREE_PLAN_LIMITS.maxWordsPerCheck.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Available checks</span>
              <span className="font-semibold text-gray-900">AI Detection</span>
            </div>
          </div>
          <ul className="space-y-2">
            {plan?.benefits?.map(feat => (
              <li key={feat?.name} className="flex items-center">
                <CircleCheck className="mr-2 h-[14px] w-[14px] text-green-500" />
                <span className="text-body-regular-12">{feat?.name}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (isPayPerCheck) {
      return (
        <div className="mt-4 flex-1">
          <div className="mb-3 rounded-lg bg-gray-50 p-3">
            <p className="mb-2 text-xs font-semibold text-gray-700">
              Credit rates (per word)
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">AI Detection</span>
                <span className="font-medium text-gray-900">
                  {CREDIT_RATES["ai"]} credits
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Plagiarism</span>
                <span className="font-medium text-gray-900">
                  {CREDIT_RATES["plagiarism"]} credits
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Alignment</span>
                <span className="font-medium text-gray-900">
                  {CREDIT_RATES["alignment"]} credits
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-1.5 text-xs">
                <span className="font-medium text-gray-700">
                  Full Check (all 3)
                </span>
                <span className="font-semibold text-blue-600">
                  {CREDIT_RATES["ai+alignment+plagiarism"]} credits
                </span>
              </div>
            </div>
          </div>
          <ul className="space-y-2">
            {plan?.benefits?.map(feat => (
              <li key={feat?.name} className="flex items-center">
                <CircleCheck className="mr-2 h-[14px] w-[14px] text-green-500" />
                <span className="text-body-regular-12">{feat?.name}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <ul className="mt-4 flex-1 space-y-2">
        {plan?.benefits?.map(feat => (
          <li key={feat?.name} className="flex items-center">
            <CircleCheck
              className={`mr-2 h-[14px] w-[14px] ${isHighlighted ? "text-white" : "text-green-500"}`}
            />
            <span
              className={`text-body-regular-12 ${isHighlighted ? "text-white" : ""}`}
            >
              {feat?.name}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const renderIcon = () => {
    if (isFree) {
      return <Zap className="mx-auto mb-2 h-6 w-6 text-gray-400" />;
    }
    if (isPayPerCheck) {
      return <CreditCard className="mx-auto mb-2 h-6 w-6 text-blue-500" />;
    }
    if (isSubscription) {
      return <Crown className="mx-auto mb-2 h-6 w-6 text-yellow-300" />;
    }
    return null;
  };

  return (
    <div
      className={`flex ${isModal ? "w-full max-w-[300px]" : "w-full max-w-[350px]"} min-w-[250px] flex-1 flex-col rounded-2xl p-6 shadow ${
        isHighlighted
          ? "relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white"
          : "bg-white text-gray-900"
      } `}
    >
      {isHighlighted && (
        <div className="absolute inset-x-0 top-3 -mt-3 flex justify-center">
          <span className="rounded-[6.75px] bg-yellow-400 px-3 py-1 text-xs font-semibold text-gray-900">
            Best Value
          </span>
        </div>
      )}

      {renderIcon()}

      <h3 className="text-body-semibold-20 text-center">{plan?.name}</h3>

      {renderPriceSection()}

      <p
        className={`text-body-regular-12 mt-2 text-center ${
          isHighlighted ? "text-white/80" : "text-gray-500"
        }`}
      >
        {plan?.description}
      </p>

      {renderDetails()}

      <div className="mt-6 flex justify-center">
        <Button
          text={buttonText}
          variant={buttonVariant}
          onClick={onButtonClick}
          disabled={isDisabled}
          className="w-full max-w-xs"
        />
      </div>
    </div>
  );
};

export default PlanCard;

export const PlanCardSkeleton = ({ isModal = false }) => {
  return (
    <div
      className={`flex ${isModal ? "w-full max-w-[300px]" : "w-full max-w-[350px]"} min-w-[250px] flex-1 animate-pulse flex-col rounded-2xl bg-white p-6`}
    >
      <div className="mx-auto mb-2 h-6 w-24 rounded bg-gray-200"></div>
      <div className="mt-2 flex items-baseline justify-center">
        <div className="h-8 w-16 rounded bg-gray-200"></div>
        <div className="ml-1 h-4 w-12 rounded bg-gray-200"></div>
      </div>
      <div className="mx-auto mt-2 h-3 w-32 rounded bg-gray-200"></div>
      <div className="mt-4 flex-1 space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div className="mr-2 h-3.5 w-3.5 rounded-full bg-gray-200"></div>
            <div className="h-3 flex-1 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <div className="h-10 w-full max-w-xs rounded bg-gray-200"></div>
      </div>
    </div>
  );
};
