import React, { useState, useEffect, useCallback } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useRouter } from "next/router";
import { useCurrentUser } from "@/hooks";
import { useCurrentSubscription } from "@/hooks";
import TourTooltip from "./TourTooltip";

const TOUR_STEPS: Step[] = [
  {
    target: "body",
    title: "Welcome to DocAuditor!",
    content:
      "Let's take a quick tour to show you around. It only takes a moment.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="verification-checks"]',
    title: "Verification Checks",
    content:
      "Select which integrity checks to run: AI Detection, Plagiarism Search, and Objective Alignment.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour="work-upload"]',
    title: "Submit Your Work",
    content:
      "Upload a .docx file or paste your text here, then hit Run Verification to check your work.",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: '[data-tour="credit-balance"]',
    title: "Credit Balance",
    content:
      "Your credit balance shows here. Free plan users see remaining checks; paid users see credits.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-links"]',
    title: "Navigation",
    content:
      "Navigate between your dashboard overview and all your projects from here.",
    placement: "bottom",
    disableBeacon: true,
  },
];

const TOUR_STORAGE_PREFIX = "docauditor_tour_completed_";

function getTourStorageKey(userId: string) {
  return `${TOUR_STORAGE_PREFIX}${userId}`;
}

const ProductTour: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { data: subscription } = useCurrentSubscription();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const userId = currentUser?.uid;
  const hasPlan = !!subscription?.currentPlan;
  const isOnDashboard = router.pathname === "/dashboard";
  const isReplay = router.query.tour === "1";

  // Determine if tour should show
  useEffect(() => {
    if (!userId || !hasPlan || !isOnDashboard) return;

    // Desktop only — tour targets NavBar elements hidden on mobile
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;

    const storageKey = getTourStorageKey(userId);
    const completed = localStorage.getItem(storageKey);

    if (isReplay) {
      // Replay requested — clear flag and start
      localStorage.removeItem(storageKey);
      setStepIndex(0);
      setRun(true);
      // Clean up query param without reload
      router.replace("/dashboard", undefined, { shallow: true });
      return;
    }

    if (!completed) {
      // First-time user — start tour after a brief delay for content to render
      const timer = setTimeout(() => {
        setStepIndex(0);
        setRun(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [userId, hasPlan, isOnDashboard, isReplay, router]);

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { status, index, action, type } = data;

      if (type === "step:after") {
        if (action === "next") {
          setStepIndex(index + 1);
        } else if (action === "prev") {
          setStepIndex(index - 1);
        }
      }

      // Tour finished or skipped
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRun(false);
        if (userId) {
          localStorage.setItem(getTourStorageKey(userId), "true");
        }
      }
    },
    [userId],
  );

  // Don't render on mobile or when not on dashboard
  if (!isOnDashboard || !userId || !hasPlan) return null;

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      disableOverlayClose
      disableCloseOnEsc={false}
      spotlightClicks={false}
      scrollToFirstStep
      scrollOffset={100}
      tooltipComponent={TourTooltip}
      callback={handleCallback}
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: "rgba(0, 0, 0, 0.5)",
        },
        spotlight: {
          borderRadius: 16,
        },
      }}
      floaterProps={{
        hideArrow: true,
      }}
    />
  );
};

export default ProductTour;
