import React from "react";
import { TooltipRenderProps } from "react-joyride";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const TourTooltip: React.FC<TooltipRenderProps> = ({
  index,
  step,
  size,
  isLastStep,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) => {
  // For the intro step, override Joyride's positioning to force true center-middle
  if (index === 0) {
    return (
      <div
        ref={tooltipProps.ref}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10001,
        }}
        className="w-[420px]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-slate-200 bg-white px-7 py-10 text-center shadow-2xl"
          >
            <button
              {...skipProps}
              className="absolute top-3 right-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            {step.title && (
              <h3 className="text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
            )}
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {step.content}
            </p>

            <div className="mt-5 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: size }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                      i === index ? "bg-violet-600" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <button
                {...primaryProps}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-violet-700 hover:to-violet-800"
              >
                Let&apos;s go
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div {...tooltipProps} className="max-w-xs">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
        >
          {/* Skip button */}
          <button
            {...skipProps}
            className="absolute top-3 right-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Step content */}
          {step.title && (
            <h3 className="pr-6 text-base font-semibold text-slate-900">
              {step.title}
            </h3>
          )}
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {step.content}
          </p>

          {/* Progress dots + navigation */}
          <div className="mt-5 flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: size }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                    i === index ? "bg-violet-600" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  {...backProps}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
                >
                  Back
                </button>
              )}
              <button
                {...primaryProps}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-violet-700 hover:to-violet-800"
              >
                {isLastStep ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TourTooltip;
