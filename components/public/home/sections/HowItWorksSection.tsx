"use client";

import { Button } from "@/common";
import { useAuthModal } from "@/context";
import Image from "next/image";
import { ScrollReveal, StaggerChildren, StaggerItem } from "../animations";

const steps = [
  {
    step: "Step 1",
    badge: "Required",
    badgeStyle: "bg-slate-100 text-slate-600",
    title: "Upload your document",
    copy: "Paste text directly or upload a DOCX or PDF. Works with essays, reports, proposals, and any written deliverable.",
    image: "/image/ready.svg",
  },
  {
    step: "Step 2",
    badge: "Optional",
    badgeStyle: "bg-amber-100 text-amber-700",
    title: "Add your brief or instructions",
    copy: "Include the assignment prompt, RFP requirements, or project brief to run a full alignment check.",
    image: "/image/feature.svg",
  },
  {
    step: "Step 3",
    badge: "Results",
    badgeStyle: "bg-blue-100 text-blue-700",
    title: "See what needs fixing",
    copy: "Get a color-coded report showing AI flags, source matches, and missing requirements. Click any issue to jump straight to it.",
    image: "/image/review.svg",
  },
];

const HowItWorksSection = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-lg shadow-slate-200/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <ScrollReveal>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase">
                Three Steps. Full Clarity.
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Upload, check, and fix in minutes.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                Paste or upload your document, add instructions if you want a
                brief check, then review exactly what needs attention.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Button
              text="Check My Work Free"
              onClick={() => openAuthModal("signup")}
              className="bg-blue-600 px-6 py-3 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:bg-blue-700"
            />
          </ScrollReveal>
        </div>

        <StaggerChildren
          className="mt-10 grid gap-6 md:grid-cols-3"
          staggerDelay={0.15}
        >
          {steps.map(s => (
            <StaggerItem key={s.step}>
              <div className="group rounded-3xl border border-slate-200 bg-slate-50/80 p-6 transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-100/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                    {s.step}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${s.badgeStyle}`}
                  >
                    {s.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.copy}
                </p>
                <div className="mt-6 flex justify-center rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 group-hover:shadow-md">
                  <Image
                    src={s.image}
                    alt={`${s.title} illustration`}
                    width={140}
                    height={140}
                  />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};

export default HowItWorksSection;
