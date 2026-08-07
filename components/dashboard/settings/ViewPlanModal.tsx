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
        className="landscape-horizontal:max-h-[90vh] landscape-horizontal:w-[95vw] landscape-horizontal:max-w-[1200px] relative h-[85vh] w-full max-w-[95vw] overflow-hidden rounded-xl bg-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal content */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white"
          aria-label="Close"
        >
          <CircleX className="h-6 w-6 text-gray-700" />
        </button>

        <div className="h-full">
          <Pricing
            onPlanAssigned={() => {
              // refetchSubscription();
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
