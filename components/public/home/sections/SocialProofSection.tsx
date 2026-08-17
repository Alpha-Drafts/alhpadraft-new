"use client";

import {
  TrendingUp,
  ShieldCheck,
  Building2,
  Timer,
  BadgeCheck,
} from "lucide-react";
import {
  ScrollReveal,
  AnimatedCounter,
  StaggerChildren,
  StaggerItem,
} from "../animations";

const stats = [
  {
    label: "Academic Documents Evaluated",
    value: 1180,
    suffix: "+",
    icon: <TrendingUp className="h-6 w-6 text-white" />,
  },
  {
    label: "Average User Satisfaction",
    value: 4.7,
    suffix: " / 5",
    decimals: 1,
    icon: <ShieldCheck className="h-6 w-6 text-white" />,
  },
  {
    label: "Active Users Across",
    value: 5,
    suffix: " Institutions",
    icon: <Building2 className="h-6 w-6 text-white" />,
  },
  {
    label: "Average Report Delivery",
    value: 48,
    prefix: "< ",
    suffix: " Seconds",
    icon: <Timer className="h-6 w-6 text-white" />,
  },
];

const SocialProofSection = () => {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-blue-700/30 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 px-8 py-10 text-white shadow-2xl shadow-blue-900/25">
        {/* Glow effects */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        {/* Dot pattern */}
        <div className="absolute inset-0 dot-pattern dot-pattern-dark opacity-40" />

        <div className="relative">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <ScrollReveal blur={false}>
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-blue-200 uppercase">
                  Trusted Across Industries
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                  The numbers speak for themselves.
                </h3>
                <p className="mt-2 text-base text-blue-100">
                  Used by students, professionals, and teams at organizations
                  worldwide.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1} blur={false}>
              <div className="flex items-center gap-3 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-blue-100 backdrop-blur-sm ring-1 ring-white/10">
                <BadgeCheck className="h-4 w-4 text-blue-200" />
                Real usage, real results
              </div>
            </ScrollReveal>
          </div>

          <StaggerChildren
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            staggerDelay={0.1}
          >
            {stats.map(stat => (
              <StaggerItem key={stat.label}>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:ring-1 hover:ring-white/20">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                      {stat.icon}
                    </span>
                    <span className="text-3xl font-bold text-white">
                      <AnimatedCounter
                        target={stat.value}
                        suffix={stat.suffix}
                        prefix={stat.prefix}
                        decimals={stat.decimals}
                        duration={2.5}
                      />
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-medium text-blue-100">
                    {stat.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
