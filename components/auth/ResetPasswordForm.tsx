import React, { useState, useEffect } from "react";
import { apiClient, formatError } from "@/utils";
import { API_BASE_URL } from "@/constants";
import { Eye, EyeOff, Loader2, Lock, Zap } from "lucide-react";
import { Button, MessageModal } from "@/common";
import AuthHeader from "./AuthHeader";
import { useRouter } from "next/router";

const ResetPasswordForm = ({
  query,
}: {
  query: { oobCode?: string; continueUrl?: string; mode?: string };
}) => {
  const { oobCode } = query;
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);

  // Countdown and redirect logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (showModal && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (showModal && countdown === 0) {
      // Redirect to home page with login modal open
      router.push("/?auth=login");
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showModal, countdown, router]);

  const isDisabled = isProcessing;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const sanitisedPassword = password.trim();
    const sanitisedConfirmPassword = confirmPassword.trim();

    if (!sanitisedPassword) {
      setError("Password is required");
      return;
    }

    // Password validation pattern
    // At least 8 characters long
    const passwordPattern = /^.{8,}$/;

    // Validate password strength
    if (!passwordPattern.test(password)) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (sanitisedPassword !== sanitisedConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsProcessing(true);

      // Backend endpoint: POST /v1/auth/reset-password (to be added on the
      // decoupled backend — firebase-decopling has no password-reset flow yet).
      const response = await apiClient.post(
        `${API_BASE_URL}/v1/auth/reset-password`,
        {
          password: sanitisedPassword,
          token: oobCode, // reset token from the emailed link
        },
      );

      if (response.data.status === "success") {
        setShowModal(true);
        return;
      }
    } catch (error) {
      setError(
        formatError(error, "An error occurred while resetting password"),
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
        title="Password Updated"
        message={`Your password has been successfully updated. You will be redirected to the login page in ${countdown} seconds.`}
        cancelText="Go to Login Now"
        onCancel={() => router.push("/?auth=login")}
        closeOnOverlayClick={false}
      />

      <div className="flex min-h-screen items-center justify-center">
        <div className="auth w-full max-w-[390px]">
          <div className="auth-content">
            <AuthHeader />

            <main className="auth-content_body">
              <header className="auth-content_header">
                <h1 className="auth-content_title">Create new password</h1>
              </header>

              <section className="auth-content_section">
                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-content_form">
                  {/* Form Group */}
                  <div>
                    <label htmlFor="password">Password</label>
                    <div className="auth-content_form_input">
                      <Lock className="icon absolute top-1/2 left-3 size-4 -translate-y-1/2 transform text-[#667185]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pr-10 pl-8"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="auth-content_visibility-button"
                      >
                        {showPassword ? (
                          <EyeOff className="icon" />
                        ) : (
                          <Eye className="icon" />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* End Form Group */}

                  {/* Form Group */}
                  <div>
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <div className="auth-content_form_input">
                      <Lock className="icon absolute top-1/2 left-3 size-4 -translate-y-1/2 transform text-[#667185]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="confirm-password"
                        name="confirm-password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="pr-10 pl-8"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="auth-content_visibility-button"
                      >
                        {showPassword ? (
                          <EyeOff className="icon" />
                        ) : (
                          <Eye className="icon" />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* End Form Group */}

                  {/* Display error message */}
                  {error && <p className="error-message">{error}</p>}

                  <Button
                    type="submit"
                    className="mt-3"
                    disabled={isDisabled}
                    icon={
                      isProcessing ? <Loader2 className="loader" /> : undefined
                    }
                  >
                    {isProcessing ? "Reset password..." : "Reset password"}
                  </Button>
                </form>
                {/* End Form */}
              </section>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordForm;
