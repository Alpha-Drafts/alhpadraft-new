"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Highlighter,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/common";
import { useAuthModal } from "@/context";
import Image from "next/image";
import {
  ScrollReveal,
  MotionText,
  StaggerChildren,
  StaggerItem,
  ParallaxFloat,
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
        color: "bg-blue-100 text-blue-700 border border-blue-200/60",
        accent: "text-blue-600",
      },
      plagiarism: {
        title: "Plagiarism Source Check",
        highlight:
          "Source match found: Journal of Public Policy, Vol. 12 (2019).",
        color: "bg-rose-50 text-rose-700 border border-rose-200/60",
        accent: "text-rose-600",
      },
      alignment: {
        title: "Alignment Brief Check",
        highlight:
          "Missing requirement: 3-year financial projection not addressed.",
        color: "bg-amber-50 text-amber-700 border border-amber-200/60",
        accent: "text-amber-600",
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
    <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:px-6 lg:px-8 lg:pt-32 lg:pb-36">
      {/* Massive animated gradient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="animate-blob-morph absolute -top-32 -left-20 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-blue-300/50 via-cyan-200/40 to-transparent blur-3xl" />
        <div
          className="animate-blob-morph absolute -top-10 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-blue-200/60 via-sky-300/40 to-transparent blur-3xl"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="animate-blob-morph absolute bottom-0 left-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gradient-to-t from-indigo-200/30 to-transparent blur-3xl"
          style={{ animationDelay: "-8s" }}
        />
      </div>

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 -z-10 dot-pattern opacity-60" />

      {/* Floating decorative orbs */}
      <ParallaxFloat className="absolute top-20 right-[15%] hidden lg:block" speed={30}>
        <div className="h-3 w-3 rounded-full bg-blue-400/40 blur-[1px]" />
      </ParallaxFloat>
      <ParallaxFloat className="absolute top-40 left-[10%] hidden lg:block" speed={20} delay={2}>
        <div className="h-2 w-2 rounded-full bg-cyan-400/50 blur-[1px]" />
      </ParallaxFloat>
      <ParallaxFloat className="absolute bottom-32 right-[25%] hidden lg:block" speed={25} delay={1}>
        <div className="h-4 w-4 rounded-full bg-blue-300/30 blur-[2px]" />
      </ParallaxFloat>

      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left column - Text */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-200/80 bg-white/80 px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              Check before you submit
            </div>
          </motion.div>

          <MotionText
            text="Know your work is original, complete, and ready to submit."
            as="h1"
            className="text-5xl leading-[1.08] font-bold tracking-tight text-slate-900 md:text-6xl lg:text-[4.25rem]"
            delay={0.25}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <p className="max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl">
              Catch AI flags, source matches, and missing requirements before
              your reviewer does. Sentence-level highlights show you exactly
              what to fix so you can revise and resubmit with full confidence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.85 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Button
              text="Check My Work Free"
              onClick={() => openAuthModal("signup")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/35"
              icon={<ArrowRight className="h-5 w-5" />}
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
              className="border border-slate-200 bg-white/80 px-8 py-3.5 text-base font-semibold text-slate-700 backdrop-blur-sm hover:border-blue-200 hover:bg-blue-50"
            />
          </motion.div>

          <StaggerChildren className="flex flex-wrap gap-3" staggerDelay={0.06}>
            {[
              {
                icon: <CheckCircle2 className="h-4 w-4 text-blue-600" />,
                text: "Original writing verified.",
              },
              {
                icon: <ShieldCheck className="h-4 w-4 text-blue-600" />,
                text: "Every requirement covered.",
              },
              {
                icon: <FileCheck className="h-4 w-4 text-blue-600" />,
                text: "Confidence to submit.",
              },
            ].map(badge => (
              <StaggerItem key={badge.text}>
                <span className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm">
                  {badge.icon}
                  {badge.text}
                </span>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>

        {/* Right column - Interactive Card */}
        <ScrollReveal direction="right" delay={0.3} blur={false}>
          <div className="relative">
            {/* Glow ring behind card */}
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-blue-500/20 via-cyan-400/15 to-blue-500/20 blur-xl opacity-60" />

            <div className="glow-ring-lg glass-shimmer relative rounded-3xl border border-blue-200/40 bg-white/75 p-8 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-[0.25em] text-blue-500/70 uppercase">
                    Document Report
                  </p>
                  <h3 className="mt-1.5 text-xl font-bold text-slate-900">
                    Verification Summary
                  </h3>
                </div>
                <span className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-200/50">
                  3 checks, one report
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white/60 p-5">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                    <Highlighter className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Line-by-Line Feedback
                    </p>
                    <p className={`text-xs font-medium ${activeMeta.accent}`}>
                      {activeMeta.title}
                    </p>
                  </div>
                </div>
                <div
                  className={`typing-block typing-${activeCheck} mt-4 space-y-2.5`}
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
                  className={`mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold ${activeMeta.color}`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {activeMeta.highlight}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {(
                  [
                    { key: "ai", label: "AI Originality", icon: <Zap className="h-3.5 w-3.5" /> },
                    { key: "plagiarism", label: "Source Check", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
                    { key: "alignment", label: "Brief Check", icon: <FileCheck className="h-3.5 w-3.5" /> },
                  ] as const
                ).map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveCheck(item.key);
                      setAutoIndex(checkOrder.indexOf(item.key));
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all duration-300 ${
                      activeCheck === item.key
                        ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                <Image
                  src="/image/ready.svg"
                  alt="Submission ready illustration"
                  width={44}
                  height={44}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Your document at a glance
                </p>
                <p className="text-xs text-slate-500">
                  One clear report before you hit submit.
                </p>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HeroSection;
