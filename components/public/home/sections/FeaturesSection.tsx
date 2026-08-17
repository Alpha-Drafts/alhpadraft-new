"use client";

import { Target, ShieldCheck, Highlighter } from "lucide-react";
import { Button } from "@/common";
import { useAuthModal } from "@/context";
import { ScrollReveal, StaggerChildren, StaggerItem } from "../animations";

const features = [
  {
    title: "AI Originality Check",
    copy: "Detects sentences that match AI writing patterns. See exactly which lines get flagged and how strong the signal is, so you can rewrite with precision.",
    icon: <Target className="h-6 w-6 text-blue-600" />,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "Plagiarism Source Check",
    copy: "Scans your text against published sources and surfaces matches with direct links. Catch unintentional overlaps and fix citations before they become a problem.",
    icon: <ShieldCheck className="h-6 w-6 text-blue-600" />,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Alignment Brief Check",
    copy: "Compares your document against the original instructions, rubric, or RFP. Flags every requirement you missed and tells you exactly what is still needed.",
    icon: <Highlighter className="h-6 w-6 text-blue-600" />,
    gradient: "from-blue-600 to-indigo-500",
  },
];

const FeaturesSection = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <ScrollReveal>
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-blue-600 uppercase">
                What You Get
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Three checks. One report. Full confidence.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
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
              className="bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.03] hover:bg-blue-700"
            />
          </ScrollReveal>
        </div>

        <StaggerChildren
          className="mt-12 grid gap-6 md:grid-cols-3"
          staggerDelay={0.15}
        >
          {features.map(card => (
            <StaggerItem key={card.title}>
              <div className="card-premium group p-8">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-110`}>
                  {card.icon}
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
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
