import Pricing from "@/components/public/home/Pricing";
import { CircleX } from "lucide-react";
import React from "react";

const ViewPlanModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="landscape-horizontal:max-h-[90vh] landscape-horizontal:w-[95vw] landscape-horizontal:max-w-[1200px] relative h-[85vh] w-full max-w-[95vw] overflow-hidden bg-[var(--color-surface-container)]"
        style={{
          borderRadius: "var(--radius-modal)",
          boxShadow: "var(--elevation-3)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-[var(--color-surface-container)] p-2 transition-[background,box-shadow] duration-150 hover:bg-[var(--color-surface-background)]"
          style={{ boxShadow: "var(--elevation-1)" }}
          aria-label="Close"
        >
          <CircleX className="h-6 w-6 text-[var(--color-text-secondary)]" />
        </button>

        <div className="h-full">
          <Pricing
            onPlanAssigned={() => {
              sessionStorage.setItem("plan_selected", "true");
            }}
            onCancel={() => {
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewPlanModal;
