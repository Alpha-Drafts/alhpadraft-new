"use client";

import { CheckCircle2, Zap, CreditCard, Crown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/common";
import { useAuthModal } from "@/context";
import {
  CREDIT_RATES,
  FREE_PLAN_LIMITS,
  SUBSCRIPTION_PLAN,
  CREDIT_PRICE_PER_UNIT,
} from "@/constants";
import { ScrollReveal, StaggerChildren, StaggerItem } from "./animations";

const LandingPricing = () => {
  const { openAuthModal } = useAuthModal();

  return (
    <section id="pricing" className="px-4 py-20 sm:px-6 lg:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center">
            <p className="text-xs font-bold tracking-[0.25em] text-blue-600 uppercase">
              Pricing
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
              Pay for what you use. Nothing more.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              Start with three free checks. Buy credits when you need more, or
              subscribe for the best per-check value. No contracts, no surprises.
            </p>
          </div>
        </ScrollReveal>

        <StaggerChildren
          className="mt-14 grid gap-6 lg:grid-cols-3"
          staggerDelay={0.15}
        >
          {/* Free Plan */}
          <StaggerItem>
            <div className="card-premium flex flex-col p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <Zap className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Free</h3>
                  <p className="text-xs text-slate-500">
                    Try AlphaDrafts at zero cost
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <span className="text-5xl font-bold text-slate-900">$0</span>
                <span className="text-base text-slate-500">/month</span>
              </div>

              <ul className="mt-7 flex-1 space-y-3.5">
                {[
                  `${FREE_PLAN_LIMITS.checksPerMonth} checks per month`,
                  "AI Originality Check included",
                  `Up to ${FREE_PLAN_LIMITS.maxWordsPerCheck.toLocaleString()} words per check`,
                  "Sentence-level highlights",
                ].map(feature => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-slate-600"
                  >
                    <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                text="Get Started Free"
                onClick={() => openAuthModal("signup")}
                className="mt-8 w-full border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-200 hover:bg-blue-50"
              />
            </div>
          </StaggerItem>

          {/* Pay-Per-Check */}
          <StaggerItem>
            <div className="card-premium flex flex-col p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Pay-Per-Check
                  </h3>
                  <p className="text-xs text-slate-500">
                    Buy credits, use them whenever you need
                  </p>
                </div>
              </div>

              <div className="mt-7 flex items-baseline gap-2.5">
                <span className="text-2xl font-bold text-slate-900">
                  No monthly fee
                </span>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 ring-1 ring-blue-200/50">
                  From $5
                </span>
              </div>

              <div className="mt-7 flex-1 space-y-2.5">
                <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                  Credit rates (per word)
                </p>
                <div className="space-y-2">
                  {[
                    { label: "AI Originality", rate: CREDIT_RATES["ai"] },
                    { label: "Source Check", rate: CREDIT_RATES["plagiarism"] },
                    { label: "Brief Check", rate: CREDIT_RATES["alignment"] },
                    {
                      label: "All Three",
                      rate: CREDIT_RATES["ai+alignment+plagiarism"],
                    },
                  ].map(item => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm ring-1 ring-slate-100"
                    >
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-bold text-slate-900">
                        {item.rate} credits
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                text="Buy Credits"
                onClick={() => openAuthModal("signup")}
                className="mt-8 w-full border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-200 hover:bg-blue-50"
              />
            </div>
          </StaggerItem>

          {/* Subscription (Highlighted) */}
          <StaggerItem>
            <motion.div
              className="relative flex flex-col rounded-[2rem] border-2 border-blue-500 bg-gradient-to-b from-blue-50 via-white to-white p-8 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/15 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/15"
              whileHover={{ y: -4 }}
            >
              {/* Outer glow */}
              <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-r from-blue-500/20 via-cyan-400/15 to-blue-500/20 blur-lg opacity-40 -z-10" />

              <div className="absolute -top-3.5 right-5 sm:right-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30">
                  <Crown className="h-3 w-3" />
                  Best Value
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Subscription
                  </h3>
                  <p className="text-xs text-slate-500">
                    {SUBSCRIPTION_PLAN.monthlyCredits.toLocaleString()} credits
                    every month
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <span className="text-5xl font-bold text-slate-900">
                  {SUBSCRIPTION_PLAN.priceDisplay}
                </span>
                <span className="text-base text-slate-500">/month</span>
              </div>

              <ul className="mt-7 flex-1 space-y-3.5">
                {[
                  `${SUBSCRIPTION_PLAN.monthlyCredits.toLocaleString()} credits every month`,
                  "All three checks included",
                  "No word count limit per check",
                  "Priority processing",
                  "Buy extra credits anytime",
                ].map(feature => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                text="Subscribe Now"
                onClick={() => openAuthModal("signup")}
                className="mt-8 w-full bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/35"
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
              />
            </motion.div>
          </StaggerItem>
        </StaggerChildren>

        <p className="mt-10 text-center text-sm text-slate-400">
          1 credit = ${CREDIT_PRICE_PER_UNIT} &middot; Credits never expire
          &middot; Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default LandingPricing;
