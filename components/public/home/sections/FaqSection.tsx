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
    <div className="rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-blue-200">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <p className="text-sm font-semibold text-slate-900">{q}</p>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ${open ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"}`}
      >
        <p className="min-h-0 px-4 text-xs leading-relaxed text-slate-600">
          {a}
        </p>
      </div>
    </div>
  );
};

const FaqSection = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <ScrollReveal>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                Common Questions
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Straight answers, no fine print.
              </h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Button
              text="Get Started Free"
              onClick={() => openAuthModal("signup")}
              className="bg-slate-900 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800"
            />
          </ScrollReveal>
        </div>
        <StaggerChildren
          className="mt-8 grid gap-4 md:grid-cols-2"
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
