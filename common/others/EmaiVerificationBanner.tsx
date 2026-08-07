import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useClaims, useAuth } from "@/context";
import { apiClient, formatError } from "@/utils";
import { API_BASE_URL } from "@/constants";
import { toast } from "react-toastify";

export function EmailVerificationBanner() {
  const { customClaims } = useClaims();
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const isEmailVerified = customClaims?.email_verified || false;
    setIsVerified(isEmailVerified);
  }, [customClaims]);

  const handleVerifyClick = async () => {
    if (isVerified || emailSent || !user) {
      return;
    }

    setIsLoading(true);

    try {
      // Backend endpoint: POST /v1/auth/send-verification-email
      // (to be added on the decoupled backend — no Firebase email verification).
      await apiClient.post(
        `${API_BASE_URL}/v1/auth/send-verification-email`,
        {},
      );

      toast.success("Verification email sent! Please check your inbox.");
      setEmailSent(true);
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.error(
        formatError(
          error,
          "Failed to send verification email. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return null; // Don't show the banner if the email is already verified
  }

  return (
    <div className="mx-auto my-4 rounded-lg border border-yellow-400 bg-white px-4 py-3 md:px-6 md:py-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-start space-x-3 md:items-center">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-body-bold-16 text-yellow-800">
              Account Verification Required!
            </h2>
            <p className="text-body-medium-14 mt-1 text-yellow-700">
              Email sending will not work until your account is verified. Please
              verify your account.
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={handleVerifyClick}
            disabled={isLoading || emailSent}
            className="w-full rounded bg-yellow-600 px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            title={
              isLoading
                ? "Sending verification email..."
                : emailSent
                  ? "Verification email sent"
                  : "Verify your email"
            }
            aria-label="Verify Email"
          >
            {isLoading ? "Sending..." : emailSent ? "Email Sent" : "Verify Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
