"use client";

import { ScrollReveal, StaggerChildren, StaggerItem } from "../animations";

const features = [
  {
    title: "Requirement Checklist",
    copy: "Your brief, turned into a checklist. See which requirements are met and which still need work.",
  },
  {
    title: "Three-Color Highlight Map",
    copy: "Blue for AI flags, red for source matches, amber for missing requirements. Spot issues at a glance.",
  },
  {
    title: "Edit and Recheck",
    copy: "Make your changes right in the editor, then run a fresh check to confirm the issues are resolved.",
  },
];

const EditorDemoSection = () => {
  return (
    <section
      id="interactive-editor"
      className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8"
    >
      {/* Parallax background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-parallax-float absolute -top-16 right-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div
          className="animate-parallax-float absolute bottom-10 left-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
          style={{ animationDelay: "-4s" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-blue-300 uppercase">
              The Editor
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Write, check, and revise in one place.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
              Color-coded highlights mark every issue directly in your text.
              Click on a flag to see why it was raised and what you can do
              about it.
            </p>
          </div>
        </ScrollReveal>

        <StaggerChildren
          className="mt-8 grid gap-4 md:grid-cols-3"
          staggerDelay={0.12}
        >
          {features.map(f => (
            <StaggerItem key={f.title}>
              <div className="glass-shimmer rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {f.copy}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <ScrollReveal delay={0.2}>
          <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-slate-700/50 bg-slate-950/70 p-6 backdrop-blur-sm">
              <div className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
                <video
                  className="max-h-[400px] w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label="Editor text editing demonstration"
                >
                  <source
                    src="/video/editor-text-edit.mp4"
                    type="video/mp4"
                  />
                  <track
                    kind="descriptions"
                    label="Video description"
                    srcLang="en"
                    default
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-5 backdrop-blur-sm">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Summary
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3">
                    <span>AI Originality</span>
                    <span className="font-semibold text-blue-200">15%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3">
                    <span>Source Matches</span>
                    <span className="font-semibold text-rose-200">2</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3">
                    <span>Missing Requirements</span>
                    <span className="font-semibold text-amber-200">1</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-5 backdrop-blur-sm">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Issue Feed
                </p>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/70 p-3">
                    Flagged: 67% of this paragraph matches known AI writing
                    patterns.
                  </div>
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/70 p-3">
                    Add a citation or rewrite this section in your own words.
                  </div>
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/70 p-3">
                    Recheck only the sections you changed to save time.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default EditorDemoSection;
