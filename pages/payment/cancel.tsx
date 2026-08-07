import React from "react";
import { useRouter } from "next/router";
import { XCircle } from "lucide-react";
import { Button } from "@/common";
import { userRoutes } from "@/constants";

/**
 * Payment cancel landing page — the backend redirects here when the user
 * abandons the Stripe checkout (`FRONTEND_URL/payment/cancel`).
 */
const PaymentCancelPage = () => {
  const router = useRouter();

  const goToDashboard = () => router.push(userRoutes.dashboard);
  const retry = () => router.push("/?auth=login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <XCircle className="mx-auto mb-4 h-14 w-14 text-amber-500" />
        <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
          Payment Cancelled
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your payment was not completed. No charges were made. You can retry or
          return to your dashboard.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={retry}>Try Again</Button>
          <Button variant="outline" onClick={goToDashboard}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
