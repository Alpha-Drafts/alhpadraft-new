import React, { ReactNode } from "react";
import { LoadingState } from "@/common";
import { useAuthGuard, useCurrentSubscription } from "@/hooks";
import { useClaims } from "@/context";
import { NavBar } from "@/components/navigation/user";
import { publicRoutes } from "@/constants";
import { EmailVerificationBanner } from "@/common/others/EmaiVerificationBanner";
import GatePricing from "@/components/dashboard/GatePricing";
import { ProductTour, EditorTour } from "@/components/dashboard/tour";

const UserLayout = ({
  children,
  isSettingPage,
  isCitationPage,
  title,
  subtitle,
  onBackClick,
}: {
  children: ReactNode;
  isSettingPage?: boolean;
  isCitationPage?: boolean;
  title?: string;
  subtitle?: string;
  onBackClick?: () => void;
}) => {
  const { isAuthorised, isLoading } = useAuthGuard("user", publicRoutes?.home);
  const { token } = useClaims();
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useCurrentSubscription();

  // Temporary bypass — remove once backend plan-assignment endpoints are live

  // Wait for auth guard, token availability, and subscription data
  if (isLoading || !token || isLoadingSubscription) {
    return <LoadingState />;
  }

  if (!isAuthorised) {
    return null; // Return null while redirecting to login
  }

  // Gate: user must select a plan before accessing the dashboard
  const needsPlanSelection = !subscription?.currentPlan && !subscriptionError;

  if (needsPlanSelection) {
    return (
      <div className="mx-auto min-h-svh">
        <NavBar
          isSettingPage={isSettingPage}
          isCitationPage={isCitationPage}
          title={title}
          subtitle={subtitle}
          onBackClick={onBackClick}
        />
        <div className="relative mx-auto w-full max-w-6xl overflow-hidden">
          <GatePricing
            currentPlan={subscription?.currentPlan}
            onPlanAssigned={() => {
              refetchSubscription();
              sessionStorage.setItem("plan_selected", "true");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto min-h-svh">
        <NavBar
          isSettingPage={isSettingPage}
          isCitationPage={isCitationPage}
          title={title}
          subtitle={subtitle}
          onBackClick={onBackClick}
        />

        {/* This is the main content area */}
        <div
          className="relative mx-auto w-full max-w-6xl overflow-hidden p-4 sm:p-7"
          id="content-area"
        >
          <EmailVerificationBanner />
          <div>{children}</div>
        </div>
        <ProductTour />
        <EditorTour />
      </div>
    </>
  );
};

export default UserLayout;
