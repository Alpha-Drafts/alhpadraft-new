import React, { useEffect, useState } from "react";
import SignupForm from "./SignupForm";
import LoginForm from "./LoginForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { Modal } from "@/common";
import { ShieldCheck, Sparkles, Highlighter, X } from "lucide-react";
import Image from "next/image";
import site from "@/site.metadata";

export type AuthFormType = "signup" | "login" | "forgot-password";

const brandFeatures = [
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

const AuthModal = ({
  isOpen,
  onClose,
  initialForm = "signup",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialForm?: AuthFormType;
}) => {
  const [currentForm, setCurrentForm] = useState<AuthFormType>(initialForm);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentForm(initialForm);
    }
  }, [isOpen, initialForm]);

  const renderForm = () => {
    switch (currentForm) {
      case "signup":
        return <SignupForm onSwitchToLogin={() => setCurrentForm("login")} />;
      case "login":
        return (
          <LoginForm
            onSwitchToSignup={() => setCurrentForm("signup")}
            onSwitchToForgotPassword={() => setCurrentForm("forgot-password")}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordForm onSwitchToLogin={() => setCurrentForm("login")} />
        );
      default:
        return <SignupForm onSwitchToLogin={() => setCurrentForm("login")} />;
    }
  };

  const headingText =
    currentForm === "signup"
      ? "Start auditing your work for integrity."
      : currentForm === "login"
        ? "Welcome back to your integrity workspace."
        : "We'll get you back in.";

  return (
    <Modal
      isOpen={isOpen}
      onCancel={onClose}
      hideCloseButton
      wrapperClassName="sm:max-w-5xl"
    >
      <div className="relative flex w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-400 backdrop-blur transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left brand panel — hidden on mobile */}
        <div className="relative hidden w-[45%] shrink-0 overflow-hidden bg-gradient-to-br from-violet-800 via-violet-900 to-slate-900 lg:block">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex h-full flex-col p-10">
            {/* Logo — pinned top-left */}
            <div>
              <Image
                alt={`${site.title} logo`}
                src={site.logo}
                width={130}
                height={44}
                className="brightness-0 invert"
              />
            </div>

            {/* Main content — vertically centered */}
            <div className="flex flex-1 flex-col justify-center space-y-8">
              <div>
                <h2 className="font-['Space_Grotesk'] text-2xl leading-snug font-semibold text-white">
                  {headingText}
                </h2>
                <p className="mt-3 font-['DM_Sans'] text-sm leading-relaxed text-violet-100/80">
                  Run AI detection, plagiarism search, and alignment checks —
                  all in one place.
                </p>
              </div>

              <div className="space-y-3">
                {brandFeatures.map(feature => (
                  <div
                    key={feature.text}
                    className="flex items-start gap-3 rounded-xl bg-white/[0.07] px-4 py-3 backdrop-blur"
                  >
                    <span className="mt-0.5 text-violet-300">
                      {feature.icon}
                    </span>
                    <span className="text-sm leading-snug text-violet-50/90">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex min-h-0 flex-1 flex-col justify-center px-6 py-8 sm:min-h-[560px] sm:px-10 lg:px-12">
          {renderForm()}
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
