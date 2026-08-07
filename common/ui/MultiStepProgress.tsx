import React from "react";
import { CheckCircle } from "lucide-react";

export interface MultiStepProgressStep {
  label: string;
}

interface MultiStepProgressProps {
  steps: MultiStepProgressStep[];
  currentStep: number; // 1-based index
}

export const MultiStepProgress: React.FC<MultiStepProgressProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-3">
      {steps.map((step, idx) => {
        const stepNumber = idx + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <React.Fragment key={step.label}>
            <div className="flex items-center">
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                  isCompleted || isActive ? "" : "border border-[#E4E7EC]"
                }`}
                style={{
                  background:
                    isCompleted || isActive
                      ? "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)"
                      : "#ECECF0",
                }}
              >
                {isCompleted ? (
                  <CheckCircle
                    className={`h-[14px] w-[14px] ${
                      isCompleted || isActive
                        ? "text-white"
                        : "text-primary-600"
                    }`}
                  />
                ) : (
                  <span
                    className={`text-body-medium-14 ${
                      isCompleted || isActive ? "text-white" : "text-[#717182]"
                    }`}
                  >
                    {stepNumber}
                  </span>
                )}
              </div>
              <span
                className={`text-body-medium-14 ml-2 transition-colors duration-200 ${
                  isCompleted || isActive ? "text-blue-600" : "text-gray-800"
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {idx < steps.length - 1 && (
              <hr
                className={`mx-4 hidden h-0.5 flex-1 border-0 sm:block ${
                  isCompleted || isActive ? "bg-blue-600" : "bg-black/10"
                }`}
                style={{
                  minWidth: 32,
                  maxWidth: 64,
                  background:
                    isCompleted || isActive
                      ? "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)"
                      : "#0000001A",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
