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

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "Inter, sans-serif" }}>
            Reset your password
          </h1>
          <p className="mt-1.5 text-sm text-slate-500" style={{ fontFamily: "Inter, sans-serif" }}>
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
                className="block w-full rounded-[10px] border border-slate-200 bg-white py-2.5 pr-3 pl-9 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary-500 py-3 text-sm font-semibold text-white shadow-[0px_4px_12px_rgba(26,115,232,0.25)] transition-all duration-200 hover:bg-primary-600 hover:shadow-[0px_8px_24px_rgba(26,115,232,0.3)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
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
