"use client";

import { Target, ShieldCheck, Highlighter } from "lucide-react";
import { Button } from "@/common";
import { useAuthModal } from "@/context";
import { ScrollReveal, StaggerChildren, StaggerItem } from "../animations";

const features = [
  {
    title: "AI Originality Check",
    copy: "Detects sentences that match AI writing patterns. See exactly which lines get flagged and how strong the signal is, so you can rewrite with precision.",
    icon: <Target className="h-5 w-5 text-blue-600" />,
  },
  {
    title: "Plagiarism Source Check",
    copy: "Scans your text against published sources and surfaces matches with direct links. Catch unintentional overlaps and fix citations before they become a problem.",
    icon: <ShieldCheck className="h-5 w-5 text-blue-600" />,
  },
  {
    title: "Alignment Brief Check",
    copy: "Compares your document against the original instructions, rubric, or RFP. Flags every requirement you missed and tells you exactly what is still needed.",
    icon: <Highlighter className="h-5 w-5 text-blue-600" />,
  },
];

const FeaturesSection = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <section id="features" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <ScrollReveal>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase">
                What You Get
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Three checks. One report. Full confidence.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                Whether you are a student submitting a thesis, a team responding
                to an RFP, or a writer delivering a final draft, AlphaDrafts
                checks the three things that matter most.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Button
              text="Run My Free Check"
              onClick={() => openAuthModal("signup")}
              className="bg-blue-600 px-6 py-3 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:bg-blue-700"
            />
          </ScrollReveal>
        </div>

        <StaggerChildren
          className="mt-10 grid gap-6 md:grid-cols-3"
          staggerDelay={0.15}
        >
          {features.map(card => (
            <StaggerItem key={card.title}>
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 transition-colors duration-300 group-hover:bg-blue-100">
                  {card.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {card.copy}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};

export default FeaturesSection;
