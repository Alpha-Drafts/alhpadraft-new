"use client";

import { Button } from "@/common";
import { useAuthModal } from "@/context";
import { ScrollReveal } from "../animations";

const CtaBannerSection = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <ScrollReveal>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase">
                Why It Matters Now
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Every submission gets scrutinized. Yours should be ready.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
                Reviewers, professors, and procurement teams are running their
                own checks. AlphaDrafts lets you run the same checks first, so
                nothing in your document comes as a surprise after you submit.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Button
              text="Verify My Document"
              onClick={() => openAuthModal("signup")}
              className="bg-blue-600 px-6 py-3 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:bg-blue-700"
            />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default CtaBannerSection;
