"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/common";
import { useAuthModal } from "@/context";
import { ScrollReveal, StaggerChildren, StaggerItem } from "../animations";

const faqs = [
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
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        open
          ? "border-blue-200 bg-white shadow-md shadow-blue-100/50 ring-1 ring-blue-100"
          : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <p className="text-sm font-bold text-slate-900 pr-4">{q}</p>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-blue-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0">
          <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
};

const FaqSection = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <section className="px-4 py-20 sm:px-6 lg:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 md:p-10 lg:p-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <ScrollReveal>
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase">
                Common Questions
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Straight answers, no fine print.
              </h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Button
              text="Get Started Free"
              onClick={() => openAuthModal("signup")}
              className="bg-slate-900 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] hover:bg-slate-800"
            />
          </ScrollReveal>
        </div>
        <StaggerChildren
          className="mt-10 grid gap-4 md:grid-cols-2"
          staggerDelay={0.08}
        >
          {faqs.map(faq => (
            <StaggerItem key={faq.q}>
              <FaqItem q={faq.q} a={faq.a} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};

export default FaqSection;
