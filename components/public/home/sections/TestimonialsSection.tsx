"use client";

import { Quote } from "lucide-react";
import { ScrollReveal, StaggerChildren, StaggerItem } from "../animations";

const testimonials = [
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
];

const TestimonialsSection = () => {
  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase">
              What People Say
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Trusted by students and professionals.
            </h2>
          </div>
        </ScrollReveal>

        <StaggerChildren className="grid gap-6 lg:grid-cols-3" staggerDelay={0.12}>
          {testimonials.map(item => (
            <StaggerItem key={item.name}>
              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50">
                <Quote className="h-5 w-5 text-blue-600" />
                <p className="mt-4 text-sm leading-relaxed text-slate-700">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-700">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};

export default TestimonialsSection;
