"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/common";
import { useAuthModal } from "@/context";
import { ScrollReveal } from "../animations";

const FinalCtaSection = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <ScrollReveal>
        <div className="animate-gradient-shift mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-12 text-white shadow-xl shadow-blue-500/20 md:flex-row">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-blue-100 uppercase">
              Ready When You Are
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Check your work in under five minutes.
            </h2>
            <p className="mt-2 text-sm text-blue-100 md:text-base">
              Upload your document, run the checks, fix what needs fixing, and
              submit with confidence.
            </p>
          </div>
          <Button
            text="Check My Work Free"
            onClick={() => openAuthModal("signup")}
            className="animate-glow-pulse border-2 border-white bg-transparent px-6 py-3 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:text-blue-700 hover:shadow-xl"
            icon={<ArrowRight className="text-white" />}
            iconPosition="right"
          />
        </div>
      </ScrollReveal>
    </section>
  );
};

export default FinalCtaSection;
