import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Highlighter,
  ShieldCheck,
  Sparkles,
  Target,
  Quote,
  TrendingUp,
  Timer,
  Building2,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/common";
import { useAuthModal } from "@/context";
import Image from "next/image";
import LandingPricing from "./LandingPricing";

const NewLanding = () => {
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
        badge: "Indigo highlight",
        color: "bg-indigo-100 text-indigo-700",
        underline: "bg-indigo-200/60",
      },
      plagiarism: {
        title: "Plagiarism Source Check",
        highlight:
          "Source match found: Journal of Public Policy, Vol. 12 (2019).",
        badge: "Red highlight",
        color: "bg-rose-100 text-rose-700",
        underline: "bg-rose-200/60",
      },
      alignment: {
        title: "Alignment Brief Check",
        highlight:
          "Missing requirement: 3-year financial projection not addressed.",
        badge: "Yellow highlight",
        color: "bg-amber-100 text-amber-700",
        underline: "bg-amber-200/70",
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
    <main className="bg-[#F7F6F3] text-slate-900">
      <section className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 lg:px-8 lg:pt-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-20 left-6 h-80 w-80 rounded-full bg-gradient-to-br from-violet-200/60 via-cyan-200/40 to-transparent blur-3xl" />
          <div className="absolute top-24 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-amber-200/70 via-orange-200/50 to-transparent blur-3xl" />
          <div className="absolute bottom-6 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-slate-200/70 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-violet-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Check before you submit
            </div>
            <h1 className="font-['Space_Grotesk'] text-4xl leading-tight font-semibold text-slate-900 drop-shadow-[0_10px_26px_rgba(58,12,163,0.18)] md:text-5xl lg:text-6xl">
              Know your work is original, complete, and ready to submit.
            </h1>
            <p className="max-w-xl font-['DM_Sans'] text-base text-slate-600 md:text-lg">
              Catch AI flags, source matches, and missing requirements before
              your reviewer does. Sentence-level highlights show you exactly
              what to fix so you can revise and resubmit with full confidence.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                text="Check My Work Free"
                onClick={() => openAuthModal("signup")}
                className="bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-3 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
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
                className="border border-slate-200 bg-white text-slate-700"
              />
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-600" />
                Original writing verified.
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
                Every requirement covered.
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <FileCheck className="h-3.5 w-3.5 text-violet-600" />
                Confidence to submit.
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                    Document Report
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-800">
                    Verification Summary
                  </h3>
                </div>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  3 checks, one report
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
                    <Highlighter className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Line-by-Line Feedback
                    </p>
                    <p className="text-xs text-slate-500">{activeMeta.title}</p>
                  </div>
                </div>
                <div
                  className={`typing-block typing-${activeCheck} mt-4 space-y-2`}
                >
                  <div
                    className="typing-row"
                    style={{ animationDelay: "0s" }}
                  />
                  <div
                    className="typing-row typing-row--focus"
                    style={{ animationDelay: "0.3s" }}
                  />
                  <div
                    className="typing-row"
                    style={{ animationDelay: "0.6s" }}
                  />
                  <div
                    className="typing-row"
                    style={{ animationDelay: "0.9s" }}
                  />
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
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      activeCheck === item.key
                        ? "border-violet-600 bg-violet-50 text-violet-700"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
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
            <div className="absolute -bottom-10 -left-10 hidden h-24 w-24 rotate-12 rounded-3xl bg-violet-200/60 blur-xl lg:block" />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-violet-600 uppercase">
                Three Steps. Full Clarity.
              </p>
              <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold text-slate-900">
                Upload, check, and fix in minutes.
              </h2>
              <p className="mt-3 max-w-2xl font-['DM_Sans'] text-sm text-slate-600 md:text-base">
                Paste or upload your document, add instructions if you want a
                brief check, then review exactly what needs attention.
              </p>
            </div>
            <Button
              text="Check My Work Free"
              onClick={() => openAuthModal("signup")}
              className="bg-violet-600 px-6 py-3 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:bg-violet-700"
            />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Step 1
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                  Required
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Upload your document
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Paste text directly or upload a DOCX or PDF. Works with essays,
                reports, proposals, and any written deliverable.
              </p>
              <div className="mt-6 flex justify-center rounded-2xl border border-slate-200 bg-white p-4">
                <Image
                  src="/image/ready.svg"
                  alt="Document upload illustration"
                  width={140}
                  height={140}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Step 2
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Optional
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Add your brief or instructions
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Include the assignment prompt, RFP requirements, or project
                brief to run a full alignment check.
              </p>
              <div className="mt-6 flex justify-center rounded-2xl border border-slate-200 bg-white p-4">
                <Image
                  src="/image/feature.svg"
                  alt="Brief upload illustration"
                  width={180}
                  height={140}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Step 3
                </span>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                  Results
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                See what needs fixing
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Get a color-coded report showing AI flags, source matches, and
                missing requirements. Click any issue to jump straight to it.
              </p>
              <div className="mt-6 flex justify-center rounded-2xl border border-slate-200 bg-white p-4">
                <Image
                  src="/image/review.svg"
                  alt="Document review illustration"
                  width={140}
                  height={140}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-violet-700 bg-gradient-to-br from-violet-700 via-violet-800 to-slate-900 px-6 py-6 text-white shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-violet-200 uppercase">
                Trusted Across Industries
              </p>
              <h3 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">
                The numbers speak for themselves.
              </h3>
              <p className="mt-2 font-['DM_Sans'] text-sm text-violet-100">
                Used by students, professionals, and teams at organizations
                worldwide.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-violet-100">
              <BadgeCheck className="h-4 w-4 text-violet-200" />
              Real usage, real results
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Academic Document Evaluated",
                value: "1.18K+",
                icon: <TrendingUp className="h-5 w-5 text-white" />,
              },
              {
                label: "Average User Satisfaction",
                value: "4.7 / 5",
                icon: <ShieldCheck className="h-5 w-5 text-white" />,
              },
              {
                label: "Active User Across",
                value: "5 Institutions",
                icon: <Building2 className="h-5 w-5 text-white" />,
              },
              {
                label: "Average Report Delivery",
                value: "< 48 Seconds",
                icon: <Timer className="h-5 w-5 text-white" />,
              },
            ].map(stat => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    {stat.icon}
                  </span>
                  <span className="font-['Space_Grotesk'] text-2xl font-semibold text-white">
                    {stat.value}
                  </span>
                </div>
                <p className="mt-3 text-xs text-violet-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="interactive-editor"
        className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-slate-900 to-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 right-10 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-violet-300 uppercase">
                The Editor
              </p>
              <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold md:text-4xl">
                Write, check, and revise in one place.
              </h2>
              <p className="mt-3 max-w-2xl font-['DM_Sans'] text-sm text-slate-300 md:text-base">
                Color-coded highlights mark every issue directly in your text.
                Click on a flag to see why it was raised and what you can do
                about it.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Requirement Checklist",
                copy: "Your brief, turned into a checklist. See which requirements are met and which still need work.",
              },
              {
                title: "Three-Color Highlight Map",
                copy: "Indigo for AI flags, red for source matches, amber for missing requirements. Spot issues at a glance.",
              },
              {
                title: "Edit and Recheck",
                copy: "Make your changes right in the editor, then run a fresh check to confirm the issues are resolved.",
              },
            ].map(item => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-300"
              >
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-xs text-slate-400">{item.copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-6">
              <div className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
                <video
                  className="max-h-[400px] w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label="Editor text editing demonstration"
                >
                  <source src="/video/editor-text-edit.mp4" type="video/mp4" />
                  <track
                    kind="descriptions"
                    label="Video description"
                    srcLang="en"
                    default
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Summary
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-3">
                    <span>AI Originality</span>
                    <span className="font-semibold text-indigo-200">15%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-3">
                    <span>Source Matches</span>
                    <span className="font-semibold text-rose-200">2</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-3">
                    <span>Missing Requirements</span>
                    <span className="font-semibold text-amber-200">1</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Issue Feed
                </p>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                    {activeMeta.highlight}
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                    Add a citation or rewrite this section in your own words.
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                    Recheck only the sections you changed to save time.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-violet-600 uppercase">
                What You Get
              </p>
              <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold text-slate-900">
                Three checks. One report. Full confidence.
              </h2>
              <p className="mt-3 max-w-2xl font-['DM_Sans'] text-sm text-slate-600 md:text-base">
                Whether you are a student submitting a thesis, a team responding
                to an RFP, or a writer delivering a final draft, AlphaDrafts
                checks the three things that matter most.
              </p>
            </div>
            <Button
              text="Run My Free Check"
              onClick={() => openAuthModal("signup")}
              className="bg-violet-600 px-6 py-3 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:bg-violet-700"
            />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "AI Originality Check",
                copy: "Detects sentences that match AI writing patterns. See exactly which lines get flagged and how strong the signal is, so you can rewrite with precision.",
                icon: <Target className="h-5 w-5 text-violet-600" />,
              },
              {
                title: "Plagiarism Source Check",
                copy: "Scans your text against published sources and surfaces matches with direct links. Catch unintentional overlaps and fix citations before they become a problem.",
                icon: <ShieldCheck className="h-5 w-5 text-violet-600" />,
              },
              {
                title: "Alignment Brief Check",
                copy: "Compares your document against the original instructions, rubric, or RFP. Flags every requirement you missed and tells you exactly what is still needed.",
                icon: <Highlighter className="h-5 w-5 text-violet-600" />,
              },
            ].map(card => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                  {card.icon}
                </div>
                <h3 className="mt-4 font-['Space_Grotesk'] text-lg font-semibold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-2 font-['DM_Sans'] text-sm text-slate-600">
                  {card.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-violet-600 uppercase">
                Why It Matters Now
              </p>
              <h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
                Every submission gets scrutinized. Yours should be ready.
              </h2>
              <p className="mt-3 max-w-3xl font-['DM_Sans'] text-sm text-slate-600 md:text-base">
                Reviewers, professors, and procurement teams are running their
                own checks. AlphaDrafts lets you run the same checks first, so
                nothing in your document comes as a surprise after you submit.
              </p>
            </div>
            <Button
              text="Verify My Document"
              onClick={() => openAuthModal("signup")}
              className="bg-violet-600 px-6 py-3 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:bg-violet-700"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {[
            {
              quote:
                "I caught a missing requirement the night before my deadline. Fixed it in ten minutes and submitted knowing everything was covered.",
              name: "Ava M.",
              role: "Graduate Student, Economics",
            },
            {
              quote:
                "We used AlphaDrafts to review our grant proposal before submission. The brief check flagged two criteria we had completely overlooked.",
              name: "Daniel R.",
              role: "Program Director, Nonprofit",
            },
            {
              quote:
                "The source check found a paragraph that was too close to a journal article I had read months ago. Saved me from an unintentional citation issue.",
              name: "Maya K.",
              role: "PhD Researcher, Business",
            },
          ].map(item => (
            <div
              key={item.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Quote className="h-5 w-5 text-violet-600" />
              <p className="mt-4 font-['DM_Sans'] text-sm text-slate-700">
                {item.quote}
              </p>
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-700">
                  {item.name}
                </p>
                <p className="text-xs text-slate-500">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <LandingPricing />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                Common Questions
              </p>
              <h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
                Straight answers, no fine print.
              </h2>
            </div>
            <Button
              text="Get Started Free"
              onClick={() => openAuthModal("signup")}
              className="bg-slate-900 px-6 py-3 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              {
                q: "What does the Alignment Brief Check do?",
                a: "It compares your document against the original instructions, rubric, or project brief. You get a list of every requirement that is met and every one that is missing, so you can fix gaps before submission.",
              },
              {
                q: "How do the AI Originality and Plagiarism Source Checks work?",
                a: "The AI Originality Check scans each sentence for patterns common in AI-generated text. The Plagiarism Source Check compares your content against published sources and shows you direct links to matches. Both give you sentence-level detail.",
              },
              {
                q: "Does AlphaDrafts change or rewrite my content?",
                a: "No. We flag issues and tell you what to look at. You decide what to change. Your words stay yours.",
              },
              {
                q: "What do I get after a check?",
                a: "A full verification report with scores for each check type, color-coded highlights in your document, and a prioritized list of what to fix first.",
              },
              {
                q: "Who is AlphaDrafts for?",
                a: "Anyone who submits written work for review. Students use it for essays and theses. Professionals use it for proposals, reports, and grant applications. Teams use it to quality-check deliverables before they go out.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Subscriptions can be canceled at any time with no questions asked. Credits you have already purchased never expire.",
              },
            ].map(item => (
              <div
                key={item.q}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">{item.q}</p>
                <p className="mt-2 text-xs text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-violet-600 via-violet-700 to-violet-800 px-8 py-12 text-white md:flex-row">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-violet-100 uppercase">
              Ready When You Are
            </p>
            <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold md:text-4xl">
              Check your work in under five minutes.
            </h2>
            <p className="mt-2 font-['DM_Sans'] text-sm text-violet-100 md:text-base">
              Upload your document, run the checks, fix what needs fixing, and
              submit with confidence.
            </p>
          </div>
          <Button
            text="Check My Work Free"
            onClick={() => openAuthModal("signup")}
            className="border-2 border-white bg-transparent px-6 py-3 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:bg-white hover:text-violet-700 hover:shadow-xl"
            icon={<ArrowRight className="text-white" />}
            iconPosition="right"
          />
        </div>
      </section>
    </main>
  );
};

export default NewLanding;
