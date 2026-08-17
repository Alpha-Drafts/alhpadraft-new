"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/common";
import { useAuthModal } from "@/context";
import { ScrollReveal } from "../animations";
import { ParallaxFloat } from "../animations";

const FinalCtaSection = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <section className="px-4 pb-24 sm:px-6 lg:px-8">
      <ScrollReveal>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-16 text-white shadow-2xl shadow-blue-500/20 md:px-12 md:py-20">
          {/* Glow orbs */}
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          {/* Dot pattern */}
          <div className="absolute inset-0 dot-pattern dot-pattern-dark opacity-30" />

          {/* Floating sparkle */}
          <ParallaxFloat className="absolute top-8 right-[20%] hidden md:block" speed={15}>
            <Sparkles className="h-5 w-5 text-blue-200/40" />
          </ParallaxFloat>

          <div className="relative flex flex-col items-center justify-between gap-8 md:flex-row">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] text-blue-200 uppercase">
                Ready When You Are
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Check your work in under five minutes.
              </h2>
              <p className="mt-3 text-base text-blue-100 md:text-lg">
                Upload your document, run the checks, fix what needs fixing, and
                submit with confidence.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                text="Check My Work Free"
                onClick={() => openAuthModal("signup")}
                className="animate-glow-pulse bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:bg-blue-50"
                icon={<ArrowRight className="h-5 w-5 text-blue-600" />}
                iconPosition="right"
              />
            </motion.div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default FinalCtaSection;
