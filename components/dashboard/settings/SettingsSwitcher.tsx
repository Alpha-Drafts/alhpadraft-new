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
      {/* Tab bar — M3 primary-container tonal surface */}
      <div
        className="relative overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] p-1"
        ref={containerRef}
        style={{ boxShadow: "var(--elevation-0)" }}
      >
        {/* Slider pill */}
        <div
          className="absolute top-1 bottom-1 rounded-[var(--radius-button)] bg-[var(--color-primary)] transition-[left,width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ left: sliderStyle.left, width: sliderStyle.width }}
        />

        <div className="relative flex gap-1">
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
                  `text-body-medium-14 relative z-10 flex items-center gap-2 rounded-[var(--radius-button)] px-5 py-2.5 transition-[color,background] duration-150 ease-in-out ` +
                  (isHighlighted
                    ? "text-[var(--color-on-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]")
                }
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-8">
        {activeIdx === 0 && <Accounts />}
        {activeIdx === 1 && <Billing />}
      </div>
    </>
  );
};

export default SettingsSwitcher;
