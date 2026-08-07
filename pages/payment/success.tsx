import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/common";
import { useClaims } from "@/context";
import { userRoutes } from "@/constants";

/**
 * Payment success landing page — the backend redirects here after Stripe
 * checkout (`FRONTEND_URL/payment/success`). Refreshes session/credits
 * so the dashboard reflects the new plan or purchased credits.
 */
const PaymentSuccessPage = () => {
  const router = useRouter();
  const { refreshClaims, refreshToken } = useClaims();
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await refreshClaims();
        await refreshToken();
      } finally {
        if (active) setIsRefreshing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshClaims, refreshToken]);

  const goToDashboard = () => router.push(userRoutes.dashboard);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
        <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
          Payment Successful
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isRefreshing
            ? "Updating your account..."
            : "Thank you! Your payment was processed successfully."}
        </p>
        <Button
          className="mt-6"
          onClick={goToDashboard}
          disabled={isRefreshing}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
