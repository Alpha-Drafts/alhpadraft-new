import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { publicRoutes, userRoutes } from "@/constants";
import { useSignup } from "@/hooks";
import { useRouter } from "next/router";
import { Eye, EyeOff, Loader2, Zap, User, Mail, Lock } from "lucide-react";
import { MessageModal } from "@/common";
import axios from "axios";

const SignupForm = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const router = useRouter();
  const { redirect } = router.query;
  const queryRedirectUrl = Array.isArray(redirect) ? redirect[0] : redirect;

  const redirectUrl = queryRedirectUrl;

  const { signup, error: signupError, isProcessing, isSuccess } = useSignup();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [acceptedMailing, setAcceptedMailing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompletedMailing, setHasCompletedMailing] = useState(true);

  useEffect(() => {
    if (signupError) {
      setError(signupError);
    }
  }, [signupError]);

  const handleAddingNewUsersToSender = useCallback(
    async (subscriberName: string, subscriberEmail: string) => {
      const response = await axios.post("/api/v1/mail-list", {
        name: subscriberName,
        email: subscriberEmail,
      });

      if (response.status !== 200) {
        throw new Error("Failed to add user to mailing list");
      }

      return response.data;
    },
    [],
  );

  useEffect(() => {
    if (isSuccess) {
      if (acceptedMailing) {
        setHasCompletedMailing(false);
        try {
          handleAddingNewUsersToSender(name, email.trim().toLocaleLowerCase());
        } catch (err) {
          console.error("Mailing failed", err);
        } finally {
          setHasCompletedMailing(true);
        }
      }

      if (redirectUrl && hasCompletedMailing) {
        window.location.href = redirectUrl;
      } else {
        setShowSuccessModal(true);
      }
    }
  }, [
    isSuccess,
    redirectUrl,
    hasCompletedMailing,
    acceptedMailing,
    email,
    name,
    handleAddingNewUsersToSender,
  ]);

  const isDisabled = isProcessing || isSubmitting;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    const sanitisedEmail = email.trim().toLocaleLowerCase();
    const sanitisedPassword = password.trim();
    const sanitisedConfirmPassword = confirmPassword.trim();

    if (
      !name ||
      !sanitisedEmail ||
      !sanitisedPassword ||
      !sanitisedConfirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    const namePattern = /^[a-zA-Z\s]+$/;
    if (!namePattern.test(name)) {
      setError("Please enter a valid name (letters and spaces only)");
      return;
    }

    const passwordPattern = /^.{8,}$/;
    if (!passwordPattern.test(password)) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(name, sanitisedEmail, sanitisedPassword);
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setTimeout(() => {
      window.location.href = userRoutes?.dashboard || "/dashboard";
    }, 300);
  };

  return (
    <>
      <MessageModal
        isOpen={showSuccessModal}
        icon={<Zap className="icon" />}
        title="Sign up successful!"
        message="We have sent you a verification link to your email. Please check your inbox and click the link to verify your email address."
        submitText="Go to Dashboard"
        onSubmit={() => handleSuccessModalClose()}
        onCancel={() => handleSuccessModalClose()}
        closeOnOverlayClick={false}
      />

      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
            Create your account
          </h1>
          <p className="mt-1.5 font-['DM_Sans'] text-sm text-slate-500">
            Free to start — no credit card required.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name + Email side by side on larger screens */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-3 pl-9 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                  required
                />
              </div>
            </div>

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
          </div>

          {/* Password + Confirm side by side */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-10 pl-9 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-10 pl-9 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-2">
            <input
              type="checkbox"
              id="mailing-list"
              checked={acceptedMailing}
              disabled={isDisabled}
              onChange={e => setAcceptedMailing(e.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="mailing-list"
              className="cursor-pointer text-sm font-medium text-gray-700 select-none"
            >
              Join our mailing list for the latest updates.
            </label>
          </div>

          {/* Terms */}
          <p className="text-xs text-slate-400">
            By signing up, you agree to our{" "}
            <Link
              href={publicRoutes?.terms}
              className="text-violet-600 hover:underline"
            >
              Terms and Conditions
            </Link>
          </p>

          {/* Error */}
          {error && (
            <div
              id="signup-error"
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
            {isProcessing || isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Switch to login */}
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-violet-600 transition-colors hover:text-violet-700 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </>
  );
};

export default SignupForm;
