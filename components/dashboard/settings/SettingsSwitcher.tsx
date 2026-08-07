import React, { useState, useRef, useEffect } from "react";
import { User, CreditCard } from "lucide-react";
import Accounts from "./Accounts";
import Billing from "./Billing";
import { useRouter } from "next/router";

const tabs = [
  { label: "Accounts", icon: User },
  { label: "Billing", icon: CreditCard },
];

const SettingsSwitcher: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [sliderStyle, setSliderStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const router = useRouter();

  // Set active tab based on query param on mount and when query changes
  useEffect(() => {
    const tabParam = (router.query.tab as string)?.toLowerCase();
    if (tabParam === "billing") {
      setActiveIdx(1);
    } else {
      setActiveIdx(0);
    }
  }, [router.query.tab]);

  const updateSlider = (index: number) => {
    const btn = tabRefs.current[index];
    const container = containerRef.current;
    if (btn && container) {
      const btnRect = btn.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      setSliderStyle({
        left: btnRect.left - contRect.left,
        width: btnRect.width,
      });
    }
  };

  useEffect(() => {
    updateSlider(activeIdx);
  }, [activeIdx]);

  return (
    <>
      <div className="relative overflow-x-auto" ref={containerRef}>
        {/* Slider background */}
        <div
          className="absolute top-0 bottom-0 rounded-[12.75px] bg-blue-500 transition-all duration-200"
          style={{ left: sliderStyle.left, width: sliderStyle.width }}
        />

        <div className="relative flex space-x-4 px-2">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isHighlighted = (hoverIdx ?? activeIdx) === idx;
            return (
              <button
                key={tab.label}
                ref={el => {
                  tabRefs.current[idx] = el;
                }}
                onClick={() => setActiveIdx(idx)}
                onMouseEnter={() => {
                  setHoverIdx(idx);
                  updateSlider(idx);
                }}
                onMouseLeave={() => {
                  setHoverIdx(null);
                  updateSlider(activeIdx);
                }}
                className={
                  `text-body-regular-14 relative z-10 flex items-center gap-2 px-4 py-2 transition-colors duration-200 ` +
                  (isHighlighted
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-800")
                }
              >
                <Icon className="h-[14px] w-[14px]" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div className="mt-6">
        {activeIdx === 0 && <Accounts />}
        {activeIdx === 1 && <Billing />}
      </div>
    </>
  );
};

export default SettingsSwitcher;
