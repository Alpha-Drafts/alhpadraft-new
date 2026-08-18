import React from "react";
import Image from "next/image";
import site from "@/site.metadata";
import { ShieldCheck, Highlighter, Sparkles } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    text: "AI detection, plagiarism search & alignment checks",
  },
  {
    icon: <Highlighter className="h-4 w-4" />,
    text: "Sentence-level highlights with actionable feedback",
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    text: "Integrity editor with one-click rechecks",
  },
];

const AuthLayout = ({
  children,
  heading,
  subheading,
}: {
  children: React.ReactNode;
  heading: string;
  subheading: string;
}) => {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel — hidden on mobile */}
      <div className="relative hidden w-[45%] shrink-0 overflow-hidden bg-slate-900 lg:flex">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-20 h-56 w-56 rounded-full bg-primary-400/10 blur-3xl" />

        <div className="relative flex h-full w-full flex-col p-10">
          {/* Logo */}
          <div>
            <Image
              alt={`${site.title} logo`}
              src={site.logo}
              width={130}
              height={44}
              className="brightness-0 invert"
            />
          </div>

          {/* Content — vertically centered */}
          <div className="flex flex-1 flex-col justify-center space-y-8">
            <div>
              <h2 className="text-2xl leading-snug font-semibold text-white" style={{ fontFamily: "Inter, sans-serif" }}>
                {heading}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300" style={{ fontFamily: "Inter, sans-serif" }}>
                {subheading}
              </p>
            </div>

            <div className="space-y-3">
              {features.map(feature => (
                <div
                  key={feature.text}
                  className="flex items-start gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 backdrop-blur"
                >
                  <span className="mt-0.5 text-primary-400">
                    {feature.icon}
                  </span>
                  <span className="text-sm leading-snug text-slate-200/90" style={{ fontFamily: "Inter, sans-serif" }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
