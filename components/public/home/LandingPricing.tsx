"use client";

import { CheckCircle2, Zap, CreditCard, Crown, ArrowRight } from "lucide-react";
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
    <section id="pricing" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Pay for what you use. Nothing more.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Start with three free checks. Buy credits when you need more, or
              subscribe for the best per-check value. No contracts, no surprises.
            </p>
          </div>
        </ScrollReveal>

        <StaggerChildren
          className="mt-12 grid gap-6 lg:grid-cols-3"
          staggerDelay={0.15}
        >
          {/* Free Plan */}
          <StaggerItem>
            <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Zap className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Free
                  </h3>
                  <p className="text-xs text-slate-500">
                    Try AlphaDrafts at zero cost
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-4xl font-semibold text-slate-900">
                  $0
                </span>
                <span className="text-sm text-slate-500">/month</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {[
                  `${FREE_PLAN_LIMITS.checksPerMonth} checks per month`,
                  "AI Originality Check included",
                  `Up to ${FREE_PLAN_LIMITS.maxWordsPerCheck.toLocaleString()} words per check`,
                  "Sentence-level highlights",
                ].map(feature => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                text="Get Started Free"
                onClick={() => openAuthModal("signup")}
                className="mt-8 w-full border border-slate-200 bg-white py-3 text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-200 hover:bg-blue-50"
              />
            </div>
          </StaggerItem>

          {/* Pay-Per-Check */}
          <StaggerItem>
            <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Pay-Per-Check
                  </h3>
                  <p className="text-xs text-slate-500">
                    Buy credits, use them whenever you need
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-xl font-semibold text-slate-900">
                  No monthly fee
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  From $5
                </span>
              </div>

              <div className="mt-6 flex-1 space-y-2">
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Credit rates (per word)
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: "AI Originality", rate: CREDIT_RATES["ai"] },
                    {
                      label: "Source Check",
                      rate: CREDIT_RATES["plagiarism"],
                    },
                    {
                      label: "Brief Check",
                      rate: CREDIT_RATES["alignment"],
                    },
                    {
                      label: "All Three",
                      rate: CREDIT_RATES["ai+alignment+plagiarism"],
                    },
                  ].map(item => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                    >
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-medium text-slate-900">
                        {item.rate} credits
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                text="Buy Credits"
                onClick={() => openAuthModal("signup")}
                className="mt-8 w-full border border-slate-200 bg-white py-3 text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-200 hover:bg-blue-50"
              />
            </div>
          </StaggerItem>

          {/* Subscription (Highlighted) */}
          <StaggerItem>
            <div className="relative flex flex-col rounded-3xl border-2 border-blue-500 bg-gradient-to-b from-blue-50 to-white p-6 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/15">
              <div className="absolute -top-3 right-4 sm:right-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  <Crown className="h-3 w-3" />
                  Best Value
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Crown className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Subscription
                  </h3>
                  <p className="text-xs text-slate-500">
                    {SUBSCRIPTION_PLAN.monthlyCredits.toLocaleString()} credits
                    every month
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-4xl font-semibold text-slate-900">
                  {SUBSCRIPTION_PLAN.priceDisplay}
                </span>
                <span className="text-sm text-slate-500">/month</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {[
                  `${SUBSCRIPTION_PLAN.monthlyCredits.toLocaleString()} credits every month`,
                  "All three checks included",
                  "No word count limit per check",
                  "Priority processing",
                  "Buy extra credits anytime",
                ].map(feature => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                text="Subscribe Now"
                onClick={() => openAuthModal("signup")}
                className="mt-8 w-full bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30"
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
              />
            </div>
          </StaggerItem>
        </StaggerChildren>

        <p className="mt-8 text-center text-xs text-slate-400">
          1 credit = ${CREDIT_PRICE_PER_UNIT} &middot; Credits never expire
          &middot; Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default LandingPricing;
