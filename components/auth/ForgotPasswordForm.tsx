import React, { useState } from "react";
import { apiClient, formatError } from "@/utils";
import { API_BASE_URL } from "@/constants";
import { Loader2, Mail, Zap, ArrowLeft } from "lucide-react";
import { MessageModal } from "@/common";

const ForgotPasswordForm = ({
  onSwitchToLogin,
}: {
  onSwitchToLogin?: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const isDisabled = isProcessing;

  const handleModalClose = () => {
    setShowModal(false);
    setEmail("");
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    const sanitisedEmail = email.trim().toLocaleLowerCase();

    if (!sanitisedEmail) {
      setError("Email is required");
      return;
    }

    try {
      // Backend endpoint: POST /v1/auth/forgot-password (to be added on the
      // decoupled backend — firebase-decopling has no password-reset flow yet).
      const response = await apiClient.post(
        `${API_BASE_URL}/v1/auth/forgot-password`,
        {
          email: email.trim().toLowerCase(),
        },
      );

      if (response.data.status === "success") {
        setShowModal(true);
        return;
      }
    } catch (error) {
      setError(
        formatError(error, "An error occurred while sending reset link"),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <MessageModal
        isOpen={showModal}
        icon={<Zap className="icon" />}
        title="Email Sent"
        message="If your email is registered, you will receive a password reset link shortly."
        cancelText="Close"
        onCancel={handleModalClose}
      />

      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
            Reset your password
          </h1>
          <p className="mt-1.5 font-['DM_Sans'] text-sm text-slate-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="jane@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-3 pl-9 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-violet-500/25 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:hover:scale-100"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* Back to login */}
        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </button>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordForm;
