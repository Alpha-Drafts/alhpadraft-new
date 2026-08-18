import { useCurrentUser } from "@/hooks";
import VerificationStart from "./VerificationStart";
import RecentProjects from "./RecentProjects";
import { ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

const DashboardContent = () => {
  const { currentUser } = useCurrentUser();

  return (
    <div className="dashboard-content perspective-container">
      {/* Hero Welcome Banner — Glass + Gradient + 3D */}
      <div className="relative mt-2 overflow-hidden" style={{ borderRadius: "var(--radius-card-elevated)" }}>
        {/* Background gradient mesh */}
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero-subtle)" }} />
        <div className="absolute inset-0 animate-gradient-shift" style={{ background: "var(--gradient-primary-mesh)", backgroundSize: "200% 200%" }} />

        {/* Glass overlay */}
        <div className="glass-hero relative z-10 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="animate-float-in">
                  <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
                </span>
                <span
                  className="uppercase tracking-[0.08em] text-[var(--color-primary)]"
                  style={{ fontSize: "0.7rem", fontWeight: 700 }}
                >
                  DocAuditor
                </span>
              </div>
              <h1
                className="text-gradient-blue font-bold tracking-[-0.02em]"
                style={{ fontSize: "1.5rem", lineHeight: "32px" }}
              >
                Welcome back, {currentUser?.displayName || "User"}
              </h1>
              <p className="max-w-md text-[var(--color-text-secondary)]" style={{ fontSize: "0.875rem", lineHeight: "20px" }}>
                Check the integrity of your work before submission. Upload your draft, select verification checks, and get instant feedback.
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="glass-light flex items-center gap-3 rounded-[var(--radius-card)] px-5 py-4" style={{ boxShadow: "var(--elevation-1)" }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-button)]" style={{ background: "var(--gradient-hero)" }}>
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">Start Verification</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">AI · Plagiarism · Alignment</p>
                </div>
                <ArrowRight className="ml-2 h-4 w-4 text-[var(--color-primary)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <VerificationStart />
      </div>
      <RecentProjects />
    </div>
  );
};

export default DashboardContent;
