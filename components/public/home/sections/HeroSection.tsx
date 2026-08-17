"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Highlighter,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/common";
import { useAuthModal } from "@/context";
import Image from "next/image";
import {
  ScrollReveal,
  MotionText,
  StaggerChildren,
  StaggerItem,
} from "../animations";

const HeroSection = () => {
  const { openAuthModal } = useAuthModal();
  const checkOrder = useMemo(
    () => ["ai", "plagiarism", "alignment"] as const,
    [],
  );
  const [activeCheck, setActiveCheck] = useState<
    "ai" | "plagiarism" | "alignment"
  >("ai");
  const [autoIndex, setAutoIndex] = useState(0);

  const activeCheckCopy = useMemo(
    () => ({
      ai: {
        title: "AI Originality Check",
        highlight:
          "Flagged: 67% of this paragraph matches known AI writing patterns.",
        color: "bg-blue-100 text-blue-700",
      },
      plagiarism: {
        title: "Plagiarism Source Check",
        highlight:
          "Source match found: Journal of Public Policy, Vol. 12 (2019).",
        color: "bg-rose-100 text-rose-700",
      },
      alignment: {
        title: "Alignment Brief Check",
        highlight:
          "Missing requirement: 3-year financial projection not addressed.",
        color: "bg-amber-100 text-amber-700",
      },
    }),
    [],
  );

  const activeMeta = activeCheckCopy[activeCheck];

  useEffect(() => {
    const interval = setInterval(() => {
      setAutoIndex(prevIndex => (prevIndex + 1) % checkOrder.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [checkOrder.length]);

  useEffect(() => {
    setActiveCheck(checkOrder[autoIndex]);
  }, [autoIndex, checkOrder]);

  return (
    <section className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 lg:px-8 lg:pt-32">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="animate-blob-morph absolute -top-20 left-6 h-80 w-80 rounded-full bg-gradient-to-br from-blue-200/60 via-cyan-200/40 to-transparent blur-3xl" />
        <div
          className="animate-blob-morph absolute top-24 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/70 via-sky-200/50 to-transparent blur-3xl"
          style={{ animationDelay: "-5s" }}
        />
        <div
          className="animate-blob-morph absolute bottom-6 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-slate-200/70 to-transparent blur-3xl"
          style={{ animationDelay: "-10s" }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left column - Text */}
        <div className="space-y-6">
          <ScrollReveal delay={0.1}>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Check before you submit
            </div>
          </ScrollReveal>

          <MotionText
            text="Know your work is original, complete, and ready to submit."
            as="h1"
            className="text-4xl leading-tight font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl"
            delay={0.2}
          />

          <ScrollReveal delay={0.6}>
            <p className="max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
              Catch AI flags, source matches, and missing requirements before
              your reviewer does. Sentence-level highlights show you exactly
              what to fix so you can revise and resubmit with full confidence.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.7}>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                text="Check My Work Free"
                onClick={() => openAuthModal("signup")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30"
                icon={<ArrowRight />}
                iconPosition="right"
              />
              <Button
                text="See How It Works"
                variant="secondary"
                onClick={() =>
                  document.getElementById("how-it-works")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              />
            </div>
          </ScrollReveal>

          <StaggerChildren className="flex flex-wrap gap-3" staggerDelay={0.08}>
            {[
              {
                icon: <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />,
                text: "Original writing verified.",
              },
              {
                icon: <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />,
                text: "Every requirement covered.",
              },
              {
                icon: <FileCheck className="h-3.5 w-3.5 text-blue-600" />,
                text: "Confidence to submit.",
              },
            ].map(badge => (
              <StaggerItem key={badge.text}>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1 shadow-sm">
                  {badge.icon}
                  <span className="text-xs text-slate-600">{badge.text}</span>
                </span>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>

        {/* Right column - Interactive Card */}
        <ScrollReveal direction="right" delay={0.3}>
          <div className="relative">
            <div className="glass-shimmer rounded-3xl border border-slate-200/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                    Document Report
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-800">
                    Verification Summary
                  </h3>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  3 checks, one report
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Highlighter className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Line-by-Line Feedback
                    </p>
                    <p className="text-xs text-slate-500">
                      {activeMeta.title}
                    </p>
                  </div>
                </div>
                <div
                  className={`typing-block typing-${activeCheck} mt-4 space-y-2`}
                >
                  <div className="typing-row" style={{ animationDelay: "0s" }} />
                  <div
                    className="typing-row typing-row--focus"
                    style={{ animationDelay: "0.3s" }}
                  />
                  <div className="typing-row" style={{ animationDelay: "0.6s" }} />
                  <div className="typing-row" style={{ animationDelay: "0.9s" }} />
                </div>
                <div
                  className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${activeMeta.color}`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {activeMeta.highlight}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {(
                  [
                    { key: "ai", label: "AI Originality" },
                    { key: "plagiarism", label: "Source Check" },
                    { key: "alignment", label: "Brief Check" },
                  ] as const
                ).map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveCheck(item.key);
                      setAutoIndex(checkOrder.indexOf(item.key));
                    }}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                      activeCheck === item.key
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Image
                  src="/image/ready.svg"
                  alt="Submission ready illustration"
                  width={44}
                  height={44}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Your document at a glance
                </p>
                <p className="text-xs text-slate-500">
                  One clear report before you hit submit.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HeroSection;
