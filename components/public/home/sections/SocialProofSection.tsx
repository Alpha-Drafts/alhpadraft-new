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
    icon: <TrendingUp className="h-5 w-5 text-white" />,
  },
  {
    label: "Average User Satisfaction",
    value: 4.7,
    suffix: " / 5",
    decimals: 1,
    icon: <ShieldCheck className="h-5 w-5 text-white" />,
  },
  {
    label: "Active Users Across",
    value: 5,
    suffix: " Institutions",
    icon: <Building2 className="h-5 w-5 text-white" />,
  },
  {
    label: "Average Report Delivery",
    value: 48,
    prefix: "< ",
    suffix: " Seconds",
    icon: <Timer className="h-5 w-5 text-white" />,
  },
];

const SocialProofSection = () => {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-gradient-shift mx-auto max-w-6xl rounded-3xl border border-blue-800/30 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 px-6 py-6 text-white shadow-xl shadow-blue-900/20">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <ScrollReveal>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-blue-200 uppercase">
                Trusted Across Industries
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                The numbers speak for themselves.
              </h3>
              <p className="mt-2 text-sm text-blue-100">
                Used by students, professionals, and teams at organizations
                worldwide.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-blue-100 backdrop-blur-sm">
              <BadgeCheck className="h-4 w-4 text-blue-200" />
              Real usage, real results
            </div>
          </ScrollReveal>
        </div>

        <StaggerChildren
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          staggerDelay={0.1}
        >
          {stats.map(stat => (
            <StaggerItem key={stat.label}>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    {stat.icon}
                  </span>
                  <span className="text-2xl font-semibold text-white">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      decimals={stat.decimals}
                      duration={2.5}
                    />
                  </span>
                </div>
                <p className="mt-3 text-xs text-blue-100">{stat.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};

export default SocialProofSection;
