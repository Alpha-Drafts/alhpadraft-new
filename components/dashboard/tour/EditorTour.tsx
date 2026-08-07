import React, { useState, useEffect, useCallback } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useRouter } from "next/router";
import { useCurrentUser } from "@/hooks";
import TourTooltip from "./TourTooltip";

const EDITOR_TOUR_STEPS: Step[] = [
  {
    target: "body",
    title: "Your Verification Results",
    content:
      "Here's where you review your integrity check results. Let's walk through the key areas.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="integrity-sidebar"]',
    title: "Integrity Checks Panel",
    content:
      "This panel shows all the checks that were run on your work — AI Detection, Plagiarism, and Alignment.",
    placement: "right-start",
    disableBeacon: true,
  },
  {
    target: '[data-tour="risk-summary"]',
    title: "Risk Summary",
    content:
      "A quick overview of your results. See your AI probability, plagiarism matches, and alignment gaps at a glance.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tour="editor-area"]',
    title: "Document Editor",
    content:
      "Your document is displayed here with flagged passages highlighted. Click any issue in the sidebar to jump to it.",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: '[data-tour="editor-toolbar"]',
    title: "Editor Tools",
    content:
      "Use these to search text, enter focus mode for distraction-free editing, or manage your project.",
    placement: "bottom",
    disableBeacon: true,
  },
];

const EDITOR_TOUR_STORAGE_PREFIX = "docauditor_editor_tour_completed_";

function getEditorTourStorageKey(userId: string) {
  return `${EDITOR_TOUR_STORAGE_PREFIX}${userId}`;
}

const EditorTour: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const userId = currentUser?.uid;
  const isOnEditorPage = router.pathname.startsWith(
    "/dashboard/projects/draft",
  );

  useEffect(() => {
    if (!userId || !isOnEditorPage) return;

    // Desktop only
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;

    const storageKey = getEditorTourStorageKey(userId);
    const completed = localStorage.getItem(storageKey);

    if (!completed) {
      // Wait for editor content to render before starting
      const timer = setTimeout(() => {
        setStepIndex(0);
        setRun(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [userId, isOnEditorPage]);

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

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRun(false);
        if (userId) {
          localStorage.setItem(getEditorTourStorageKey(userId), "true");
        }
      }
    },
    [userId],
  );

  if (!isOnEditorPage || !userId) return null;

  return (
    <Joyride
      steps={EDITOR_TOUR_STEPS}
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

export default EditorTour;
