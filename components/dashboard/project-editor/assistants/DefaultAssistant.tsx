import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  X,
  CheckCircle2,
  Circle,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  AlertTriangle,
} from "lucide-react";
import React, { useCallback, useEffect, useState, useRef } from "react";
import count from "text-count";
import { cn } from "@/utils/cn";
import type { Editor } from "@tiptap/react";
import {
  applySentenceHighlights,
  clearAIHighlights,
  buildTextIndex,
  charPosToPmPos,
} from "../extensions/aiHighlightUtils";
import {
  applyAlignmentHighlights,
  applyPlagiarismHighlights,
  clearAllIssueHighlights,
} from "../extensions/citationHighlightUtils";
import { useClaims, useProject, useCredits } from "@/context";
import { AI_THRESHOLD, API_BASE_URL, userRoutes } from "@/constants";
import {
  ProjectProps,
  WinstonAIDetectionResponse,
  WinstonPlagiarismResponse,
} from "@/types";
import { LoadingTab } from "../tabs";
import { Modal, Button, MessageModal } from "@/common";
import type {
  AlignmentIssueItem,
  PlagiarismIssueItem,
} from "@/types/citations";

import {
  apiClient,
  validateCredits,
  deductCredits,
  calculateCredits,
  formatError,
  stripHtmlTags,
} from "@/utils";
import { SaplingAIResponse } from "@/types/sapling";
import { useCurrentSubscription } from "@/hooks";
import InsufficientCreditsModal from "@/components/dashboard/modals/InsufficientCreditsModal";
import BuyCreditsModal from "@/components/dashboard/modals/BuyCreditsModal";
import { useRouter } from "next/router";
import { CheckTypeId } from "@/types/plans";

export interface WritingAssistantProps {
  projectId: string;
  content: string;
  editorRef: React.RefObject<{ editor: Editor | null } | null>;
  editorReady?: boolean;
  postId?: string;
}

type CheckId = "ai" | "plagiarism" | "alignment";

interface CheckStatus {
  ran: boolean;
  checking: boolean;
}

const DefaultAssistant = ({
  projectId,
  content,
  editorRef,
  editorReady,
  postId: _postId,
}: WritingAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [aiScore, setAiScore] = useState<SaplingAIResponse | null>(null);
  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: "", message: "" });
  const [plagiarismIssues, setPlagiarismIssues] = useState<
    PlagiarismIssueItem[]
  >([]);
  const [alignmentIssues, setAlignmentIssues] = useState<AlignmentIssueItem[]>(
    [],
  );
  const [textMessage, setTextMessage] = useState<string>("");
  const [evaluationResult, setEvaluationResult] =
    useState<ProjectProps["evaluation"]>(undefined);
  const [sentenceScores, setSentenceScores] = useState<
    Array<{ sentence: string; score: number }>
  >([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const hasAutoRun = useRef(false);

  // Track which checks have been run and their checking state
  const [checkStatuses, setCheckStatuses] = useState<
    Record<CheckId, CheckStatus>
  >({
    ai: { ran: false, checking: false },
    plagiarism: { ran: false, checking: false },
    alignment: { ran: false, checking: false },
  });

  // Accordion state — which section is expanded
  const [expandedSection, setExpandedSection] = useState<CheckId | null>("ai");

  const { token } = useClaims();
  const { currentProject, setCurrentProject } = useProject();
  const { balance, refetchBalance: refetchCredits } = useCredits();
  const router = useRouter();
  const { data: subscription } = useCurrentSubscription();

  // Credit validation state
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(0);

  /**
   * Check AI detection using Winston.ai v2 API via proxy endpoint
   */
  // --- Derived data ---

  const aiSentences =
    aiScore?.sentence_scores?.filter(s => s.score > AI_THRESHOLD) || [];

  const totalIssues =
    aiSentences.length + plagiarismIssues.length + alignmentIssues.length;

  const issueCountFor = (id: CheckId): number => {
    if (id === "ai") return aiSentences.length;
    if (id === "plagiarism") return plagiarismIssues.length;
    return alignmentIssues.length;
  };

  // Overall risk level
  const riskLevel = (() => {
    if (
      !checkStatuses.ai.ran &&
      !checkStatuses.plagiarism.ran &&
      !checkStatuses.alignment.ran
    ) {
      return "none";
    }
    const aiRisk = aiScore ? aiScore.score : 0;
    const highPlagiarism = plagiarismIssues.length;
    const highAlignment = alignmentIssues.filter(
      i => i.severity === "very high",
    ).length;
    if (aiRisk > 80) return "veryHigh";
    if (aiRisk > 50 || highPlagiarism > 0 || highAlignment > 0) return "high";
    if (
      aiRisk > 20 ||
      plagiarismIssues.length > 0 ||
      alignmentIssues.length > 0
    )
      return "medium";
    return "low";
  })();

  const getEditorText = useCallback(async (): Promise<string> => {
    const editor = editorRef.current?.editor;
    if (!editor) return "";

    // Editor might not have synced with content yet
    const text = editor.getText();
    if (text.length === 0 && content) {
      // Editor hasn't loaded content yet, try again after a short delay
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(editor.getText() || stripHtmlTags(content));
        }, 100);
      });
    }
    return text.replace(/\s+/g, " ").trim();
  }, [editorRef, content]);

  const convertToAisScore = useCallback((humanScore: number) => {
    return 100 - humanScore;
  }, []);

  /**
   * Process Winston AI detection results into app format
   */
  const processAIDetectionResult = useCallback(
    (winstonResult: WinstonAIDetectionResponse, text: string) => {
      if (winstonResult.sentences && Array.isArray(winstonResult.sentences)) {
        const convertedScores = winstonResult.sentences.map(sentence => ({
          sentence: sentence.text,
          score: convertToAisScore(sentence.score),
        }));

        const aiScoreResults: SaplingAIResponse = {
          score: convertToAisScore(winstonResult.score),
          text,
          sentence_scores: convertedScores,
          score_string: `AI probability: ${convertToAisScore(winstonResult.score)}%`,
        };

        setSentenceScores(convertedScores);
        setAiScore(aiScoreResults);
        setCheckStatuses(prev => ({
          ...prev,
          ai: { ran: true, checking: false },
        }));
      } else {
        setSentenceScores([]);
      }
    },
    [convertToAisScore],
  );

  /**
   * Process Winston plagiarism results into app format
   */
  const processPlagiarismResult = useCallback(
    (winstonResult: WinstonPlagiarismResponse) => {
      const indexes = winstonResult.indexes ?? [];
      const sources = winstonResult.sources ?? [];
      const resultScore = winstonResult.result?.score ?? 0;

      const built: PlagiarismIssueItem[] = indexes.map(idx => {
        const seq = idx.sequence ?? "";
        const source = sources.find(source =>
          source.plagiarismFound?.some(
            p =>
              p.startIndex === idx.startIndex &&
              p.endIndex === idx.endIndex &&
              (p.sequence === seq || !p.sequence),
          ),
        );
        return {
          startIndex: idx.startIndex,
          endIndex: idx.endIndex,
          sequence: seq,
          score: source?.score ?? resultScore,
          sourceTitle: source?.title,
          sourceUrl: source?.url,
        };
      });

      setPlagiarismIssues(built);

      setCheckStatuses(prev => ({
        ...prev,
        plagiarism: { ran: true, checking: false },
      }));
    },
    [],
  );

  /**
   * Process evaluation results into app format
   */
  const processEvaluationResult = useCallback(
    (evaluation: ProjectProps["evaluation"]) => {
      if (!evaluation) return;

      setEvaluationResult(evaluation);

      const issues: AlignmentIssueItem[] =
        evaluation.contentQuality?.areasForImprovement?.map((area: string) => ({
          text: area,
          severity:
            evaluation.contentQuality.score > 90
              ? ("very high" as const)
              : evaluation.contentQuality.score > 80
                ? ("high" as const)
                : evaluation.contentQuality.score > 60
                  ? ("medium" as const)
                  : ("low" as const),
          confidenceScore: (evaluation.overallScore / 100).toString(),
        })) ?? [];

      setAlignmentIssues(issues);
      setCheckStatuses(prev => ({
        ...prev,
        alignment: { ran: true, checking: false },
      }));
    },
    [],
  );

  // --- Check execution ---

  const checkAIDetection = useCallback(async () => {
    setCheckStatuses(prev => ({ ...prev, ai: { ran: false, checking: true } }));
    try {
      // Use plain text so Winston receives no HTML tags and its returned sentence
      // positions/text match what the editor exposes through text nodes.
      const text = await getEditorText();
      if (!text || text.length < 300) {
        throw new Error("Text must be at least 300 characters");
      }

      if (!token || !projectId) {
        throw new Error("Authentication required");
      }

      // Step 1: Validate credits (use plain-text word count, not HTML word count)
      const wordCount = count.wordCount(text);
      const validation = await validateCredits({
        checks: {
          aiDetection: true,
          objectiveAlignment: false,
          plagiarismSearch: false,
        },
        wordCount,
        projectId,
      });

      if (!validation.allowed) {
        const estimatedCredits = calculateCredits(wordCount, [
          "ai",
        ] as CheckTypeId[]);
        setTextMessage(validation.reason || "");
        setRequiredCredits(estimatedCredits);
        setShowInsufficientCredits(true);
        setCheckStatuses(prev => ({
          ...prev,
          ai: { ran: false, checking: false },
        }));

        return;
      }

      // Step 2: Run Winston AI check
      const winstonResponse = await apiClient.post(
        "/api/v1/winston/ai-detection",
        {
          text,
          sentences: true,
          language: "auto",
        },
      );

      const winstonResult: WinstonAIDetectionResponse =
        winstonResponse.data.data;

      const cacheResponse = await apiClient.post(
        `${API_BASE_URL}/v2/projects/${projectId}/ai-detection`,
        {
          ...winstonResult,
        },
      );

      // Backend returns updated project with cached aiDetectionResult
      const updatedProject = cacheResponse.data.data;
      if (updatedProject) {
        setCurrentProject(updatedProject);
      }

      // Process and display results
      processAIDetectionResult(winstonResult, text);

      await deductCredits({
        checks: {
          aiDetection: true,
          objectiveAlignment: false,
          plagiarismSearch: false,
        },
        wordCount,
      });

      // Refresh credit balance
      refetchCredits();
    } catch (error) {
      setAiScore(null);
      setErrorModal({
        open: true,
        title: "Failed to check AI with our AI",
        message: formatError(
          error,
          "Something went wrong. Please try again or contact support.",
        ),
      });
      setSentenceScores([]);
      setCheckStatuses(prev => ({
        ...prev,
        ai: { ran: true, checking: false },
      }));
    }
  }, [
    token,
    getEditorText,
    projectId,
    setCurrentProject,
    processAIDetectionResult,
    refetchCredits,
  ]);

  /**
   * Check plagiarism using Winston.ai v2 API via proxy endpoint
   */
  const checkPlagiarism = useCallback(async () => {
    setCheckStatuses(prev => ({
      ...prev,
      plagiarism: { ran: false, checking: true },
    }));
    try {
      // Use plain text so Winston character offsets (startIndex/endIndex) align
      // with the editor's text node positions used in applyPlagiarismHighlights.
      const text = await getEditorText();

      if (!text || text.length < 300) {
        throw new Error("Text must be at least 300 characters");
      }

      if (!token || !projectId) {
        throw new Error("Authentication required");
      }

      // Step 1: Validate credits (use plain-text word count, not HTML word count)
      const wordCount = count.wordCount(text);
      const validation = await validateCredits({
        checks: {
          aiDetection: false,
          objectiveAlignment: false,
          plagiarismSearch: true,
        },
        wordCount,
        projectId,
      });

      if (!validation.allowed) {
        const estimatedCredits = calculateCredits(wordCount, [
          "plagiarism",
        ] as CheckTypeId[]);
        setTextMessage(validation.reason || "");
        setRequiredCredits(estimatedCredits);
        setShowInsufficientCredits(true);
        setCheckStatuses(prev => ({
          ...prev,
          plagiarism: { ran: false, checking: false },
        }));

        return;
      }

      const winstonResponse = await apiClient.post(
        "/api/v1/winston/plagiarism",
        {
          text,
          language: "auto",
          country: "us",
        },
      );

      const winstonResult: WinstonPlagiarismResponse =
        winstonResponse.data.data;

      const cacheResponse = await apiClient.post(
        `${API_BASE_URL}/v2/projects/${projectId}/plagiarism-check`,
        {
          ...winstonResult,
        },
      );

      // Backend returns updated project with cached plagiarismResult
      const updatedProject = cacheResponse.data.data;
      if (updatedProject) {
        setCurrentProject(updatedProject);
      }

      // Process and display results
      processPlagiarismResult(winstonResult);

      await deductCredits({
        checks: {
          aiDetection: false,
          objectiveAlignment: false,
          plagiarismSearch: true,
        },
        wordCount,
      });

      // Refresh credit balance
      refetchCredits();
    } catch (error) {
      setErrorModal({
        open: true,
        title: "Failed to check plagiarism with our AI",
        message: formatError(
          error,
          "Something went wrong. Please try again or contact support.",
        ),
      });
      setPlagiarismIssues([]);
    }
  }, [
    token,
    getEditorText,
    projectId,
    setCurrentProject,
    processPlagiarismResult,
    refetchCredits,
  ]);

  /**
   * Check alignment by calling backend evaluation endpoint
   */
  const checkAlignment = useCallback(async () => {
    setCheckStatuses(prev => ({
      ...prev,
      alignment: { ran: false, checking: true },
    }));

    try {
      if (!token || !projectId) {
        throw new Error("Authentication required");
      }
      if (!currentProject?.instructionText) {
        throw new Error(
          "No instruction text found. Please add assignment instructions first.",
        );
      }

      const text = await getEditorText();

      // Step 1: Validate credits
      const wordCount = count.wordCount(text);
      const validation = await validateCredits({
        checks: {
          aiDetection: false,
          objectiveAlignment: true,
          plagiarismSearch: false,
        },
        wordCount,
        projectId,
      });

      if (!validation.allowed) {
        const estimatedCredits = calculateCredits(wordCount, [
          "alignment",
        ] as CheckTypeId[]);
        setTextMessage(validation.reason || "");
        setRequiredCredits(estimatedCredits);
        setShowInsufficientCredits(true);
        setCheckStatuses(prev => ({
          ...prev,
          alignment: { ran: false, checking: false },
        }));

        return;
      }

      const response = await apiClient.post(
        `${API_BASE_URL}/v2/projects/${projectId}/evaluate`,
      );

      // Backend returns updated project with evaluation
      const updatedProject = response.data.data;
      if (updatedProject) {
        setCurrentProject(updatedProject);
      }

      const evaluation = updatedProject?.evaluation ?? response.data.data;

      if (evaluation) {
        processEvaluationResult(evaluation);
      }

      await deductCredits({
        checks: {
          aiDetection: false,
          objectiveAlignment: true,
          plagiarismSearch: false,
        },
        wordCount,
      });

      // Refresh credit balance
      refetchCredits();
    } catch (error) {
      setAlignmentIssues([]);
      setErrorModal({
        open: true,
        title: "Failed to check Alignment with our AI",
        message: formatError(
          error,
          "Something went wrong. Please try again or contact support.",
        ),
      });
      setEvaluationResult(undefined);
      setCheckStatuses(prev => ({
        ...prev,
        alignment: { ran: true, checking: false },
      }));
    } finally {
      // check complete
    }
  }, [
    token,
    projectId,
    currentProject,
    getEditorText,
    setCurrentProject,
    processEvaluationResult,
    refetchCredits,
  ]);

  const runAllChecks = useCallback(
    async (selectedChecks?: string[]) => {
      const checksToRun = selectedChecks || ["ai", "plagiarism", "alignment"];

      // Run AI detection if selected
      if (checksToRun.includes("ai")) {
        await checkAIDetection();
      }

      if (checksToRun.includes("plagiarism")) {
        await checkPlagiarism();
      }

      // Run alignment check if selected
      if (checksToRun.includes("alignment")) {
        await checkAlignment();
      }
    },
    [checkAIDetection, checkPlagiarism, checkAlignment],
  );

  // Run single check (for per-check recheck button)
  const runSingleCheck = useCallback(
    (checkId: CheckId) => {
      runAllChecks([checkId]);
    },
    [runAllChecks],
  );

  // Load cached results from project when available.
  // NOTE: content is intentionally excluded from deps — processAIDetectionResult
  // only uses it as display metadata, not for scoring/highlighting. Including it
  // would re-run highlights on every keystroke and cause the cursor to jump.

  useEffect(() => {
    const editor = editorRef.current?.editor;

    if (!currentProject || !editor) return;

    // Load cached AI detection results
    if (currentProject.aiDetectionResult) {
      processAIDetectionResult(currentProject.aiDetectionResult, content);
    }

    // Load cached plagiarism results
    if (currentProject.plagiarismResult) {
      processPlagiarismResult(currentProject.plagiarismResult);
    }
    if (currentProject.evaluation) {
      processEvaluationResult(currentProject.evaluation);
    }
  }, [
    currentProject,
    editorRef,
    content,
    processAIDetectionResult,
    processPlagiarismResult,
    processEvaluationResult,
  ]);

  // Apply AI highlights when score changes or the editor first becomes ready.
  useEffect(() => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    // Clear existing highlights first
    clearAIHighlights(editor);

    // Apply sentence-level highlights if available
    if (sentenceScores.length > 0) {
      applySentenceHighlights(editor, sentenceScores, AI_THRESHOLD);
    }
  }, [sentenceScores, editorRef, editorReady]);

  // Apply plagiarism and alignment highlights when issues change or the editor first becomes ready.
  useEffect(() => {
    const editor = editorRef.current?.editor;
    if (!editor) return;
    clearAllIssueHighlights(editor);
    applyPlagiarismHighlights(editor, plagiarismIssues);
    applyAlignmentHighlights(editor, alignmentIssues);
  }, [plagiarismIssues, alignmentIssues, editorRef, editorReady]);

  // Auto-run checks from URL params (only from VerificationStart)
  useEffect(() => {
    if (hasAutoRun.current) return;

    // Wait for editor to be ready before auto-running checks
    if (!editorReady) {
      console.info("Auto-run: Waiting for editor to be ready...");
      return;
    }

    // Check if checks parameter is present in URL
    const urlParams = router.query;
    const checksParam = urlParams.checks as string;

    if (!checksParam) return; // Don't auto-run if no checks param

    // Wait for content to load before running checks
    // Return early but don't mark as run yet - this allows retry when content loads
    if (!content || content.trim().length < 80) {
      console.info("Auto-run: Waiting for content to load...", {
        contentLength: content?.length || 0,
      });
      return; // Will retry when content or editorReady changes
    }

    // Parse checks from URL (e.g., "ai,plagiarism,alignment")
    const checksToRun = checksParam.split(",").filter(Boolean);

    if (checksToRun.length === 0) return;

    // Mark as run ONLY after confirming editor is ready and content is loaded
    hasAutoRun.current = true;
    console.info(
      "Auto-running checks:",
      checksToRun,
      "Content length:",
      content.length,
    );

    // Run the selected checks
    runAllChecks(checksToRun);

    // Clean up URL after starting checks
    window.history.replaceState({}, "", window.location.pathname);
  }, [content, router.query, runAllChecks, editorReady]);

  // Listen for recheck events from footer
  useEffect(() => {
    const handler = async (event: Event) => {
      const customEvent = event as CustomEvent<{ selectedChecks?: string[] }>;
      const selectedChecks = customEvent.detail?.selectedChecks;
      await runAllChecks(selectedChecks);
      window.dispatchEvent(new CustomEvent("integrity:recheck:complete"));
    };
    window.addEventListener("integrity:recheck", handler);
    return () => {
      window.removeEventListener("integrity:recheck", handler);
    };
  }, [runAllChecks]);

  // --- Click to scroll to highlight in editor ---
  const scrollToText = useCallback(
    (text: string) => {
      const editor = editorRef.current?.editor;
      if (!editor || !text) return;

      // Use the flat text index so we find matches that span across inline
      // formatting splits (bold/italic) or paragraph boundaries.
      const { fullText, entries, charMap } = buildTextIndex(editor);
      const idx = fullText.indexOf(text.slice(0, 60));
      if (idx === -1) return;

      const from = charPosToPmPos(entries, idx, charMap);
      const to = charPosToPmPos(
        entries,
        Math.min(idx + text.length, fullText.length),
        charMap,
      );
      if (from === null || to === null) return;

      setIsOpen(false);
      editor.chain().focus().setTextSelection({ from, to }).run();

      // After the selection is committed to the DOM, center the highlighted
      // text vertically in the viewport using coordsAtPos.
      requestAnimationFrame(() => {
        const coords = editor.view.coordsAtPos(from);
        const targetScrollY =
          window.scrollY + coords.top - window.innerHeight / 2;
        window.scrollTo({
          top: Math.max(0, targetScrollY),
          behavior: "smooth",
        });
      });
    },
    [editorRef],
  );

  // --- Helpers ---
  const isAnyChecking = Object.values(checkStatuses).some(s => s.checking);

  const toggleSection = (id: CheckId) => {
    setExpandedSection(prev => (prev === id ? null : id));
  };

  const checkMeta: Record<
    CheckId,
    { label: string; color: string; bgColor: string }
  > = {
    ai: {
      label: "AI Detection",
      color: "text-[var(--color-on-primary-container)]",
      bgColor: "bg-[var(--color-primary-container)]",
    },
    plagiarism: {
      label: "Plagiarism",
      color: "text-[var(--color-on-error-container)]",
      bgColor: "bg-[var(--color-error-container)]",
    },
    alignment: {
      label: "Alignment",
      color: "text-[var(--color-on-warning-container)]",
      bgColor: "bg-[var(--color-warning-container)]",
    },
  };

  // --- Render helpers ---

  const renderStatusBadge = (id: CheckId) => {
    const status = checkStatuses[id];
    if (status.checking) {
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-primary)]" />;
    }
    if (status.ran) {
      const count = issueCountFor(id);
      if (count === 0) {
        return <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />;
      }
      return (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-error-container)] px-1 text-[10px] font-bold text-[var(--color-error)]">
          {count}
        </span>
      );
    }
    return <Circle className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />;
  };

  const renderRiskBadge = () => {
    if (riskLevel === "none") return null;
    const config = {
      low: {
        icon: ShieldCheck,
        label: "Low Risk",
        className: "bg-[var(--color-success-container)] text-[var(--color-on-success-container)] border-[var(--color-success)]",
      },
      medium: {
        icon: ShieldAlert,
        label: "Medium Risk",
        className: "bg-[var(--color-warning-container)] text-[var(--color-on-warning-container)] border-[var(--color-warning)]",
      },
      high: {
        icon: ShieldOff,
        label: "High Risk",
        className: "bg-[var(--color-error-container)] text-[var(--color-on-error-container)] border-[var(--color-error)]",
      },
      veryHigh: {
        icon: ShieldOff,
        label: "Very High Risk",
        className: "bg-[var(--color-error-container)] text-[var(--color-on-error-container)] border-[var(--color-error)]",
      },
    }[riskLevel];

    const Icon = config.icon;

    return (
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold",
          config.className,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </div>
    );
  };

  const renderCheckSection = (id: CheckId) => {
    const meta = checkMeta[id];
    const status = checkStatuses[id];
    const isExpanded = expandedSection === id;
    const count = issueCountFor(id);

    return (
      <div
        key={id}
        className={cn(
          "rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] transition-opacity",
          !status.ran && !status.checking && "opacity-50",
        )}
      >
        {/* Accordion header */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (meta.label === "Alignment" && !currentProject?.instructionText)
              return;
            toggleSection(id);
          }}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (
                meta.label === "Alignment" &&
                !currentProject?.instructionText
              )
                return;
              toggleSection(id);
            }
          }}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-background)]",
            meta.label === "Alignment" &&
              !currentProject?.instructionText &&
              "cursor-not-allowed opacity-50",
          )}
        >
          {renderStatusBadge(id)}
          <span className="flex-1 text-xs font-semibold text-[var(--color-text-primary)]">
            {meta.label}
          </span>
          {status.ran && (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-medium",
                meta.bgColor,
                meta.color,
              )}
            >
              {count === 0
                ? "Clear"
                : `${count} issue${count !== 1 ? "s" : ""}`}
            </span>
          )}
          <button
            type="button"
            title={`Rerun ${meta.label}`}
            onClick={e => {
              e.stopPropagation();
              runSingleCheck(id);
            }}
            className="rounded p-0.5 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-background)] hover:text-[var(--color-text-secondary)]"
          >
            <RefreshCcw className="h-3 w-3" />
          </button>
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
          )}
        </div>

        {/* Accordion body */}
        {isExpanded && (
          <div className="border-t border-[var(--color-border-subtle)] px-3 py-2.5">
            {status.checking ? (
              <div className="flex items-center gap-2 py-2 text-xs text-[var(--color-text-tertiary)]">
                <Loader2 className="h-3 w-3 animate-spin" />
                Running {meta.label.toLowerCase()}...
              </div>
            ) : !status.ran ? (
              <p className="py-2 text-xs text-[var(--color-text-tertiary)]">
                Not yet run.{" "}
                <button
                  onClick={() => runSingleCheck(id)}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Run now
                </button>
              </p>
            ) : count === 0 ? (
              <div className="flex items-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-success-container)] px-2.5 py-2 text-xs text-[var(--color-on-success-container)]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                No issues detected
              </div>
            ) : (
              <div className="space-y-1.5">
                {id === "ai" && renderAIFindings()}
                {id === "plagiarism" && renderPlagiarismFindings()}
                {id === "alignment" && renderAlignmentFindings()}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAIFindings = () => (
    <>
      {/* Overall score */}
      {aiScore && (
        <div className="mb-2 flex items-center justify-between rounded-[var(--radius-card)] bg-[var(--color-primary-container)] px-2.5 py-1.5 text-xs">
          <span className="text-[var(--color-primary)]">Overall AI probability</span>
          <span className="font-bold text-[var(--color-on-primary-container)]">
            {Math.round(aiScore.score)}%
          </span>
        </div>
      )}
      {/* Flagged sentences */}
      {aiSentences.map((s, i) => (
        <button
          key={i}
          onClick={() => scrollToText(s.sentence)}
          className="block w-full rounded-[var(--radius-card)] border border-[var(--color-primary)]/10 bg-[var(--color-primary-container)]/50 px-2.5 py-2 text-left transition-colors hover:bg-[var(--color-primary-container)]"
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[var(--color-primary)]">
              {Math.round(s.score)}% AI
            </span>
          </div>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            {s.sentence}
          </p>
        </button>
      ))}
    </>
  );

  const renderPlagiarismFindings = () => {
    return plagiarismIssues.map((issue, i) => (
      <button
        key={i}
        onClick={() => scrollToText(issue.sequence)}
        className="block w-full rounded-[var(--radius-card)] border border-[var(--color-error)]/10 bg-[var(--color-error-container)]/50 px-2.5 py-2 text-left transition-colors hover:bg-[var(--color-error-container)]"
      >
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-[var(--color-error-container)] px-1 py-0.5 text-[10px] font-semibold text-[var(--color-error)]">
            {Math.round(issue.score)}% match
          </span>
          {issue.sourceTitle && (
            <span className="line-clamp-1 text-[10px] text-[var(--color-text-tertiary)]">
              {issue.sourceTitle}
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          {issue.sequence || "Flagged passage"}
        </p>
        {issue.sourceUrl && (
          <a
            href={issue.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block truncate text-[10px] text-[var(--color-error)] underline"
            onClick={e => e.stopPropagation()}
          >
            View source
          </a>
        )}
      </button>
    ));
  };

  const renderAlignmentFindings = () => {
    const colors = {
      border: "border-[var(--color-warning)]/10",
      bg: "bg-[var(--color-warning-container)]/50",
      hoverBg: "hover:bg-[var(--color-warning-container)]",
      badge: "text-[var(--color-warning)]",
      badgeBg: "bg-[var(--color-warning-container)]",
    };
    return (
      <>
        {evaluationResult && (
          <div className="mb-2 flex items-center justify-between rounded-[var(--radius-card)] bg-[var(--color-warning-container)]/50 px-2.5 py-1.5 text-xs hover:bg-[var(--color-surface-background)]">
            <span className="text-[var(--color-primary)]">Overall alignment score</span>
            <span className="font-bold text-[var(--color-on-primary-container)]">
              {Math.round(evaluationResult.overallScore)}%
            </span>
          </div>
        )}
        {alignmentIssues &&
          alignmentIssues.map((issue, i) => (
            <button
              key={i}
              onClick={() => scrollToText(issue.text)}
              className={cn(
                "block w-full rounded-md border px-2.5 py-2 text-left transition-colors",
                colors.border,
                colors.bg,
                colors.hoverBg,
              )}
            >
              <div className="mb-1 flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded px-1 py-0.5 text-[10px] font-semibold capitalize",
                    colors.badge,
                    colors.badgeBg,
                  )}
                >
                  {issue.severity}
                </span>
                <span className="text-[10px] text-[var(--color-text-tertiary)]">
                  {Math.round(parseFloat(issue.confidenceScore) * 100)}% Align
                </span>
              </div>
              <span className="line-clamp-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                {issue.text || "Flagged passage"}
              </span>
            </button>
          ))}
      </>
    );
  };

  return (
    <>
      {/* Instructions Modal */}
      <Modal
        isOpen={showInstructions}
        onCancel={() => setShowInstructions(false)}
        wrapperClassName="max-w-2xl"
      >
        <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-container)] p-6 shadow-lg">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-text-tertiary)] uppercase">
                Uploaded Instructions
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                Assignment Objectives
              </h3>
            </div>
            <div className="max-h-[60vh] overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-background)] p-4 text-sm text-[var(--color-text-secondary)]">
              {currentProject?.instructionText || "No instructions available."}
            </div>
          </div>
        </div>
      </Modal>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 transition-opacity duration-300 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <div
        data-tour="integrity-sidebar"
        className={cn(
          "top-[var(--navbar-height)] left-0 z-30 h-[calc(100vh-var(--navbar-height))] w-80 max-w-[85vw] transform overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] transition-transform duration-300 ease-in-out lg:static lg:block lg:h-auto lg:max-h-none lg:max-w-80 lg:translate-x-0 lg:overflow-visible",
          isOpen ? "fixed translate-x-0" : "fixed -translate-x-full",
        )}
      >
        <div className="flex h-full flex-col lg:h-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] p-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                Integrity Checks
              </h2>
              <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                Results of checks run on your work.
              </p>
            </div>
            <button
              title="Close"
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 lg:flex-none lg:overflow-visible">
            {/* Loading state — only show when ALL checks are running and nothing has completed yet */}
            {isAnyChecking &&
            !checkStatuses.ai.ran &&
            !checkStatuses.plagiarism.ran &&
            !checkStatuses.alignment.ran ? (
              <LoadingTab message="Running integrity checks..." />
            ) : (
              <>
                {/* Risk Summary */}
                <div
                  className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] p-3"
                  data-tour="risk-summary"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-[var(--color-text-tertiary)]">
                      Summary
                    </p>
                    {renderRiskBadge()}
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-[var(--radius-card)] bg-[var(--color-primary-container)] px-2 py-2 text-[var(--color-on-primary-container)]">
                      <p className="font-semibold">
                        {aiScore !== null
                          ? `${Math.round(aiScore.score)}%`
                          : "—"}
                      </p>
                      <p className="text-[10px]">AI Prob.</p>
                    </div>
                    <div className="rounded-[var(--radius-card)] bg-[var(--color-error-container)] px-2 py-2 text-[var(--color-on-error-container)]">
                      <p className="font-semibold">
                        {checkStatuses.plagiarism.ran
                          ? plagiarismIssues.length
                          : "—"}
                      </p>
                      <p className="text-[10px]">Matches</p>
                    </div>
                    <div className="rounded-[var(--radius-card)] bg-[var(--color-warning-container)] px-2 py-2 text-[var(--color-on-warning-container)]">
                      <p className="font-semibold">
                        {checkStatuses.alignment.ran
                          ? alignmentIssues.length
                          : "—"}
                      </p>
                      <p className="text-[10px]">Gaps</p>
                    </div>
                  </div>
                </div>

                {/* Check sections — accordion */}
                {(["ai", "plagiarism", "alignment"] as CheckId[]).map(
                  renderCheckSection,
                )}

                {/* View instructions button */}
                {currentProject?.instructionText && (
                  <Button
                    variant="plain"
                    className="w-full border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-secondary)]"
                    onClick={() => setShowInstructions(true)}
                  >
                    View uploaded instructions
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile toggle — floating pill with issue count */}
      <button
        title="Open integrity checks"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-[120px] left-0 z-40 flex -translate-y-1/2 transform items-center gap-1.5 rounded-r-[var(--radius-card)] bg-[var(--color-surface-container)] px-2 py-2.5 shadow-lg ring-1 ring-[var(--color-border-subtle)] transition-all duration-300 ease-in-out hover:shadow-xl lg:hidden",
          isOpen ? "translate-x-[min(20rem,85vw)]" : "translate-x-0",
        )}
        style={
          isOpen
            ? { transform: "translateY(-50%) translateX(min(20rem, 85vw))" }
            : undefined
        }
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4 text-[var(--color-text-secondary)]" />
        ) : (
          <>
            <ShieldCheck className="h-4 w-4 text-[var(--color-text-secondary)]" />
            {totalIssues > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-error)] px-1 text-[10px] font-bold text-[var(--color-on-error)]">
                {totalIssues}
              </span>
            )}
          </>
        )}
      </button>

      <MessageModal
        isOpen={errorModal.open}
        title={errorModal.title}
        message={errorModal.message}
        submitText="Close"
        onSubmit={() => setErrorModal({ ...errorModal, open: false })}
        icon={<AlertTriangle className="h-8 w-8 text-[var(--color-error)]" />}
        iconStyle="bg-[var(--color-error-container)] border-[var(--color-error)]"
      />

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientCredits}
        requiredCredits={requiredCredits}
        availableCredits={balance}
        planName={subscription?.currentPlan}
        textMessage={textMessage}
        onBuyCredits={() => {
          setShowInsufficientCredits(false);
          setShowBuyCredits(true);
        }}
        onUpgradePlan={() => {
          setShowInsufficientCredits(false);
          router.push(userRoutes.settings + "?tab=billing");
        }}
        onCancel={() => setShowInsufficientCredits(false)}
      />

      {/* Buy Credits Modal */}
      <BuyCreditsModal
        isOpen={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
      />
    </>
  );
};

export default DefaultAssistant;
