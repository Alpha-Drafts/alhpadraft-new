"use client";

import { Quote, Star } from "lucide-react";
import { ScrollReveal, StaggerChildren, StaggerItem } from "../animations";

const testimonials = [
  {
    quote:
      "I caught a missing requirement the night before my deadline. Fixed it in ten minutes and submitted knowing everything was covered.",
    name: "Ava M.",
    role: "Graduate Student, Economics",
    stars: 5,
  },
  {
    quote:
      "We used AlphaDrafts to review our grant proposal before submission. The brief check flagged two criteria we had completely overlooked.",
    name: "Daniel R.",
    role: "Program Director, Nonprofit",
    stars: 5,
  },
  {
    quote:
      "The source check found a paragraph that was too close to a journal article I had read months ago. Saved me from an unintentional citation issue.",
    name: "Maya K.",
    role: "PhD Researcher, Business",
    stars: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-10 text-center">
            <p className="text-xs font-bold tracking-[0.25em] text-blue-600 uppercase">
              What People Say
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Trusted by students and professionals.
            </h2>
          </div>
        </ScrollReveal>

        <StaggerChildren className="grid gap-6 lg:grid-cols-3" staggerDelay={0.12}>
          {testimonials.map(item => (
            <StaggerItem key={item.name}>
              <div className="card-premium group p-8">
                <Quote className="h-8 w-8 text-blue-500/30" />
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mt-4 text-base leading-relaxed text-slate-700">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
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
