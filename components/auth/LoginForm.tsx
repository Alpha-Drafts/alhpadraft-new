import React, { useEffect, useState } from "react";
import { useLogin } from "@/hooks";
import { useRouter } from "next/router";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useAuthModal } from "@/context";

const LoginForm = ({
  onSwitchToSignup,
  onSwitchToForgotPassword,
}: {
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
}) => {
  const router = useRouter();
  const { redirect } = router.query;
  const queryRedirectUrl = Array.isArray(redirect) ? redirect[0] : redirect;

  // Use prop redirectUrl if provided, otherwise fall back to query parameter
  const redirectUrl = queryRedirectUrl;

  const { login, error: loginError, isProcessing, isSuccess } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { selectedPlan } = useAuthModal();

  useEffect(() => {
    if (loginError) {
      setError(loginError);
    }
  }, [loginError]);

  useEffect(() => {
    if (isSuccess && selectedPlan) {
      const pricingSection = document.getElementById("pricing");
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [isSuccess, selectedPlan]);

  const isDisabled = isProcessing;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const sanitisedEmail = email.trim().toLocaleLowerCase();
    const sanitisedPassword = password.trim();

    if (!sanitisedEmail || !sanitisedPassword) {
      setError("All fields are required");
      return;
    }

    await login(sanitisedEmail, sanitisedPassword, redirectUrl);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1.5 font-['DM_Sans'] text-sm text-slate-500">
          Sign in to continue your integrity audits.
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

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-xs font-medium text-violet-600 transition-colors hover:text-violet-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
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

        {/* Error */}
        {error && (
          <div
            id="login-error"
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
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Switch to signup */}
      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-medium text-violet-600 transition-colors hover:text-violet-700 hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
