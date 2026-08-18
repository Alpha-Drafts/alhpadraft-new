import React, { useEffect, useMemo, useState } from "react";
import {
  Clipboard,
  File,
  Upload,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button, MessageModal, ProcessingModal } from "@/common";
import { useClaims, useCredits } from "@/context";
import { useCurrentSubscription } from "@/hooks";
import InsufficientCreditsModal from "@/components/dashboard/modals/InsufficientCreditsModal";
import BuyCreditsModal from "@/components/dashboard/modals/BuyCreditsModal";
import ViewPlanModal from "@/components/dashboard/settings/ViewPlanModal";
import { API_BASE_URL, userRoutes, FREE_PLAN_LIMITS } from "@/constants";
import {
  apiClient,
  calculateCredits,
  isFreePlan as checkIsFreePlan,
  validateCredits,
  deductCredits,
} from "@/utils";
import { extractTextFromFile, extractHtmlFromFile } from "@/utils/file-extract";
import { CheckTypeId } from "@/types";
import { useRouter } from "next/router";
import axios from "axios";
import count from "text-count";
import { toast } from "react-toastify";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

const MAX_FILE_SIZE_MB = 10;

type InputMode = "upload" | "paste";

const VerificationStart = () => {
  const router = useRouter();
  const { token } = useClaims();
  const { balance } = useCredits();
  const { data: subscription } = useCurrentSubscription();
  const isFreePlan = checkIsFreePlan(subscription?.currentPlan);

  const [workMode, setWorkMode] = useState<InputMode>("paste");
  const [instructionsMode, setInstructionsMode] = useState<InputMode>("paste");
  const [workFile, setWorkFile] = useState<File | null>(null);
  const [instructionsFile, setInstructionsFile] = useState<File | null>(null);
  const [workText, setWorkText] = useState("");
  const [instructionsText, setInstructionsText] = useState("");
  const [workFileError, setWorkFileError] = useState<string | null>(null);
  const [instructionsFileError, setInstructionsFileError] = useState<
    string | null
  >(null);
  const [checks, setChecks] = useState({
    aiDetection: true,
    plagiarismSearch: false,
    objectiveAlignment: false,
  });
  const [processing, setProcessing] = useState(false);
  const [textMessage, setTextMessage] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<
    "creating" | "uploading" | "running" | "complete"
  >("creating");
  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: "", message: "" });
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const objectiveAlignmentEnabled = checks.objectiveAlignment;

  // TipTap editors — preserve formatting from Word paste
  const workEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Paste your final draft here...",
      }),
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setWorkText(editor.getText());
    },
  });

  const instructionsEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Paste assignment objectives or grading rubric...",
      }),
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setInstructionsText(editor.getText());
    },
  });

  // Debounce text stats to avoid blocking the main thread on every keystroke
  const [workStats, setWorkStats] = useState({ words: 0, chars: 0 });
  const [instructionStats, setInstructionStats] = useState({
    words: 0,
    chars: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setWorkStats({
        words: count.wordCount(workText),
        chars: count.charCount(workText),
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [workText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInstructionStats({
        words: count.wordCount(instructionsText),
        chars: count.charCount(instructionsText),
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [instructionsText]);

  const workWordCount = workStats.words;
  const workCharCount = workStats.chars;
  const instructionWordCount = instructionStats.words;
  const instructionCharCount = instructionStats.chars;

  const selectedCheckCount = useMemo(
    () => Object.values(checks).filter(Boolean).length,
    [checks],
  );

  // Map check state to CheckTypeId array for credit calculation
  const selectedCheckTypes = useMemo(() => {
    const types: CheckTypeId[] = [];
    if (checks.aiDetection) types.push("ai");
    if (checks.plagiarismSearch) types.push("plagiarism");
    if (checks.objectiveAlignment) types.push("alignment");
    return types;
  }, [checks]);

  // Estimate credits based on pasted text word count (file uploads use server-side word count)
  const estimatedWordCount = workMode === "paste" ? workWordCount : 0;
  const estimatedCredits = useMemo(
    () =>
      !isFreePlan && estimatedWordCount > 0 && selectedCheckTypes.length > 0
        ? calculateCredits(estimatedWordCount, selectedCheckTypes)
        : 0,
    [isFreePlan, estimatedWordCount, selectedCheckTypes],
  );

  useEffect(() => {
    if (instructionsText.trim() || instructionsFile) {
      setChecks(prev =>
        prev.objectiveAlignment ? prev : { ...prev, objectiveAlignment: true },
      );
    }
  }, [instructionsFile, instructionsText]);

  const validateFile = (file: File | null | undefined) => {
    if (!file) return "No file selected.";
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return "File exceeds 10MB size limit.";
    }
    if (!file.name.toLowerCase().endsWith(".docx")) {
      return "Only .docx files are supported.";
    }
    return null;
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    target: "work" | "instructions",
  ) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    const error = validateFile(droppedFile);
    if (target === "work") {
      if (error) {
        setWorkFile(null);
        setWorkFileError(error);
        return;
      }
      setWorkFile(droppedFile || null);
      setWorkFileError(null);
      return;
    }
    if (error) {
      setInstructionsFile(null);
      setInstructionsFileError(error);
      return;
    }
    setInstructionsFile(droppedFile || null);
    setInstructionsFileError(null);
  };

  const simulateProgress = () => {
    let current = 0;
    const interval = setInterval(() => {
      current += 8;
      setProgress(current);
      if (current >= 88) {
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  };

  const _submitInstructionText = async (projectId: string, text: string) => {
    const clearSimulation = simulateProgress();
    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/v1/projects/${projectId}/instructions/analyze`,
        {
          textContent: text,
          purpose: "objectives",
        },
      );
      return response?.data?.data?.id;
    } catch (error: unknown) {
      clearSimulation();
      if (axios.isAxiosError(error) && error.response) {
        const statusError = new Error(
          error.response.data?.message || error.message || "An error occurred",
        );
        (statusError as Error & { statusCode?: number }).statusCode =
          error.response.status;
        throw statusError;
      }
      throw error;
    }
  };

  const extractStatusCode = (error: unknown) => {
    if (typeof error === "object" && error !== null) {
      if ("statusCode" in error) {
        return (error as { statusCode?: number }).statusCode || null;
      }
      if (axios.isAxiosError(error) && error.response) {
        return error.response.status;
      }
    }
    return null;
  };

  const _submitInstructionFile = async (
    projectId: string,
    fileToUpload: File,
  ) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("purpose", "objectives");

      xhr.open(
        "POST",
        `${API_BASE_URL}/v1/projects/${projectId}/instructions/file`,
      );

      // Session is cookie-based now (httpOnly cookies) — no Authorization header
      xhr.withCredentials = true;

      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100,
          );
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response?.data?.id);
          } catch {
            reject(new Error("Invalid response format"));
          }
        } else {
          const statusError = new Error(
            `Upload failed with status ${xhr.status}`,
          );
          (statusError as Error & { statusCode?: number }).statusCode =
            xhr.status;
          reject(statusError);
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error occurred during upload"));
      };

      xhr.send(formData);
    });
  };

  const _submitWorkText = async (projectId: string, text: string) => {
    const clearSimulation = simulateProgress();
    try {
      // Send HTML to preserve formatting from Word paste
      const htmlContent = workEditor?.getHTML() || text;
      const response = await apiClient.post(
        `${API_BASE_URL}/v1/projects/${projectId}/posts`,
        htmlContent,
        {
          headers: {
            "Content-Type": "text/html",
          },
        },
      );
      return response?.data?.data?.id;
    } catch (error: unknown) {
      clearSimulation();
      if (axios.isAxiosError(error) && error.response) {
        const statusError = new Error(
          error.response.data?.message || error.message || "An error occurred",
        );
        (statusError as Error & { statusCode?: number }).statusCode =
          error.response.status;
        throw statusError;
      }
      throw error;
    }
  };

  const _submitWorkFile = async (projectId: string, fileToUpload: File) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", fileToUpload);

      // Backend gap: POST /v1/projects/:id/posts/file does not exist yet on
      // the decoupled backend — pending backend implementation.
      xhr.open("POST", `${API_BASE_URL}/v1/projects/${projectId}/posts/file`);

      // Session is cookie-based now (httpOnly cookies) — no Authorization header
      xhr.withCredentials = true;

      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100,
          );
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response?.data?.id);
          } catch {
            reject(new Error("Invalid response format"));
          }
        } else {
          const statusError = new Error(
            `Upload failed with status ${xhr.status}`,
          );
          (statusError as Error & { statusCode?: number }).statusCode =
            xhr.status;
          reject(statusError);
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error occurred during upload"));
      };

      xhr.send(formData);
    });
  };

  const handleSubmit = async () => {
    if (!token) return;

    const hasWork =
      (workMode === "upload" && !!workFile) ||
      (workMode === "paste" && !!workText.trim());
    const hasInstructions =
      (instructionsMode === "upload" && !!instructionsFile) ||
      (instructionsMode === "paste" && !!instructionsText.trim());

    if (!hasWork) {
      setErrorModal({
        open: true,
        title: "Work submission required",
        message: "Upload your final work or paste it into the editor.",
      });
      return;
    }

    if (!selectedCheckCount) {
      setErrorModal({
        open: true,
        title: "Select at least one check",
        message: "Choose the verification checks you want to run.",
      });
      return;
    }

    // Free plan: enforce word limit on pasted text (compute fresh, not debounced)
    const liveWordCount = count.wordCount(workText);
    if (
      isFreePlan &&
      workMode === "paste" &&
      liveWordCount > FREE_PLAN_LIMITS.maxWordsPerCheck
    ) {
      setErrorModal({
        open: true,
        title: "Word limit exceeded",
        message: `Free plan allows up to ${FREE_PLAN_LIMITS.maxWordsPerCheck.toLocaleString()} words per check. Please shorten your text or upgrade your plan.`,
      });
      return;
    }

    if (checks.objectiveAlignment && !hasInstructions) {
      setErrorModal({
        open: true,
        title: "Objectives required",
        message:
          "Objective alignment requires assignment instructions or objectives.",
      });
      return;
    }

    setProcessing(true);
    setProgress(5);
    setProcessingStage("creating");

    try {
      setProgress(15);
      // Prepare content and instructions
      let content = "";
      let instructions = "";

      if (workMode === "upload" && workFile) {
        try {
          content = await extractHtmlFromFile(workFile);
        } catch {
          setProcessing(false);
          setErrorModal({
            open: true,
            title: "Unsupported file type",
            message:
              "Could not extract text. Please upload a valid .docx file.",
          });
          return;
        }
      } else if (workMode === "paste" && workText.trim()) {
        content = workEditor?.getHTML() || workText.trim();
      }

      if (instructionsMode === "upload" && instructionsFile) {
        try {
          instructions = await extractTextFromFile(instructionsFile);
        } catch {
          setProcessing(false);
          setErrorModal({
            open: true,
            title: "Unsupported file type",
            message:
              "Could not extract text. Please upload a valid .docx file.",
          });
          return;
        }
      } else if (instructionsMode === "paste" && instructionsText.trim()) {
        instructions = instructionsText.trim();
      }

      // Compute word count from plain text to avoid counting HTML tags
      const plainText =
        workMode === "upload"
          ? await extractTextFromFile(workFile!)
          : workEditor?.getText() || workText.trim();
      const wordCount: number = count.wordCount(plainText);

      const validation = await validateCredits({
        checks: {
          aiDetection: checks.aiDetection,
          objectiveAlignment: checks.objectiveAlignment,
          plagiarismSearch: checks.plagiarismSearch,
        },
        wordCount,
        projectId: "",
      });

      if (!validation.allowed) {
        setTextMessage(validation.reason || "");
        setProcessing(false);
        setShowInsufficientCredits(true);
        return;
      }

      setProcessingStage("uploading");
      setProgress(25);

      // Prepare checks object for API
      const apiChecks = {
        ai: !!checks.aiDetection,
        plagiarism: !!checks.plagiarismSearch,
        evaluation: !!checks.objectiveAlignment,
      };

      setProcessingStage(apiChecks.evaluation ? "running" : "uploading");
      setProgress(apiChecks.evaluation ? 80 : 60);
      const today = new Date().toISOString();

      const response = await apiClient.post(
        `${API_BASE_URL}/v2/projects/save`,
        {
          content,
          name: `Verification Run - ${today}`,
          instructions,
          checks: apiChecks,
          wordCount: wordCount,
        },
      );

      setProgress(100);
      setProcessingStage("complete");

      // Handle response
      const data = response.data.data;
      if (data) {
        // Deduct credits for evaluation since it was run on the backend
        if (checks.objectiveAlignment) {
          try {
            await deductCredits({
              checks: {
                aiDetection: false,
                objectiveAlignment: true,
                plagiarismSearch: false,
              },
              wordCount,
            });
          } catch (deductError) {
            console.error(
              "Failed to deduct credits for evaluation:",
              deductError,
            );
            throw new Error("Something went wrong deducting credits");
          }
        }

        // Build checks query parameter (exclude alignment since it already ran)
        const checksToAutoRun = selectedCheckTypes.filter(
          check => check !== "alignment",
        );
        const checksParam = checksToAutoRun.join(",");

        toast.success("Project submitted successfully.");
        if (checksParam) {
          router.push(
            `${userRoutes.project_draft}/${data.id}?checks=${checksParam}`,
          );
        } else {
          router.push(`${userRoutes.project_draft}/${data.id}`);
        }
      } else {
        toast.warn(
          "No data returned from server. Please check your submission.",
        );
      }

      setTimeout(() => {
        setProcessing(false);
      }, 600);
    } catch (error: unknown) {
      const statusCode = extractStatusCode(error);

      if (statusCode === 403) {
        setProcessing(false);
        setShowInsufficientCredits(true);
        return;
      }

      let errorMessage = "Verification setup failed.";
      if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = (error as { message?: string }).message || errorMessage;
      }
      setProcessing(false);
      setErrorModal({
        open: true,
        title: "Submission failed",
        message: errorMessage,
      });
    }
  };

  return (
    <>
      {/* Verification Checks — Glass Card */}
      <div
        className="glass relative overflow-hidden p-5"
        style={{
          borderRadius: "var(--radius-card-elevated)",
          boxShadow: "var(--elevation-1)",
        }}
        data-tour="verification-checks"
      >
        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-0 h-1 w-full" style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-container), transparent)" }} />

        <h3
          className="font-semibold text-[var(--color-text-primary)]"
          style={{ fontSize: "1rem", lineHeight: "24px" }}
        >
          Verification Checks
        </h3>
        <p className="mt-1 text-[var(--color-text-secondary)]" style={{ fontSize: "0.875rem", lineHeight: "20px" }}>
          Choose which risk signals you want flagged before submission.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="group relative flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-background)] p-3 transition-[var(--transition-premium)] hover:border-[var(--color-primary)] hover:shadow-[var(--elevation-1)]">
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-[var(--color-border-medium)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              checked={checks.aiDetection}
              onChange={e =>
                setChecks(prev => ({
                  ...prev,
                  aiDetection: e.target.checked,
                }))
              }
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  AI Detection
                </p>
              </div>
              <p className="text-[var(--color-text-secondary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
                Flags likely AI-generated passages.
              </p>
            </div>
          </label>

          <div
            className={`group relative flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-background)] p-3 transition-[var(--transition-premium)] ${
              isFreePlan
                ? "cursor-pointer opacity-60 hover:border-[var(--color-warning)] hover:opacity-80"
                : "hover:border-[var(--color-primary)] hover:shadow-[var(--elevation-1)]"
            }`}
            onClick={isFreePlan ? () => setShowPlanModal(true) : undefined}
          >
            <input
              type="checkbox"
              aria-label="Plagiarism Search"
              className="mt-1 size-4 rounded border-[var(--color-border-medium)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] disabled:opacity-50"
              checked={checks.plagiarismSearch}
              disabled={isFreePlan}
              onChange={e =>
                setChecks(prev => ({
                  ...prev,
                  plagiarismSearch: e.target.checked,
                }))
              }
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Plagiarism Search
                </p>
                {isFreePlan && (
                  <span className="badge-warning" style={{ fontSize: "0.6rem", padding: "1px 6px" }}>
                    PRO
                  </span>
                )}
              </div>
              <p className="text-[var(--color-text-secondary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
                {isFreePlan
                  ? "Upgrade to unlock"
                  : "Detects overlaps with published sources."}
              </p>
            </div>
          </div>

          <div
            className={`group relative flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-background)] p-3 transition-[var(--transition-premium)] ${
              isFreePlan
                ? "cursor-pointer opacity-60 hover:border-[var(--color-warning)] hover:opacity-80"
                : "hover:border-[var(--color-primary)] hover:shadow-[var(--elevation-1)]"
            }`}
            onClick={isFreePlan ? () => setShowPlanModal(true) : undefined}
          >
            <input
              type="checkbox"
              aria-label="Objective Alignment"
              className="mt-1 size-4 rounded border-[var(--color-border-medium)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] disabled:opacity-50"
              checked={checks.objectiveAlignment}
              disabled={isFreePlan}
              onChange={e =>
                setChecks(prev => ({
                  ...prev,
                  objectiveAlignment: e.target.checked,
                }))
              }
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Objective Alignment
                </p>
                {isFreePlan && (
                  <span className="badge-warning" style={{ fontSize: "0.6rem", padding: "1px 6px" }}>
                    PRO
                  </span>
                )}
              </div>
              <p className="text-[var(--color-text-secondary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
                {isFreePlan
                  ? "Upgrade to unlock"
                  : "Highlights gaps versus requirements."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Work Upload — Glass Card with M3elevation */}
      <section
        className="glass mt-6 overflow-hidden p-3 sm:p-6 md:p-8"
        style={{
          borderRadius: "var(--radius-card-elevated)",
          boxShadow: "var(--elevation-2)",
        }}
        data-tour="work-upload"
      >
        <div className="mt-6 space-y-6">
          {/* Final Work Card */}
          <div
            className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] p-5 transition-[var(--transition-premium)] hover:shadow-[var(--elevation-1)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="font-semibold text-[var(--color-text-primary)]"
                  style={{ fontSize: "1rem", lineHeight: "24px" }}
                >
                  Final Work
                </h3>
                <p className="text-[var(--color-text-secondary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
                  Upload a file or paste your full draft.
                </p>
              </div>
              <div className="toggle-pill">
                <button
                  type="button"
                  onClick={() => setWorkMode("upload")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-[var(--transition-fast)] ${
                    workMode === "upload" ? "toggle-pill-active" : "toggle-pill-inactive"
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setWorkMode("paste")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-[var(--transition-fast)] ${
                    workMode === "paste" ? "toggle-pill-active" : "toggle-pill-inactive"
                  }`}
                >
                  Paste
                </button>
              </div>
            </div>

            {workMode === "upload" ? (
              <div
                className="mt-4 flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-medium)] bg-[var(--color-surface-background)] p-6 text-center transition-[var(--transition-premium)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-container)]"
                onDrop={e => handleDrop(e, "work")}
                onDragOver={e => e.preventDefault()}
                onClick={() => document.getElementById("work-file")?.click()}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--color-primary-container)" }}>
                  <Upload className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
                  Drop your file here or browse
                </p>
                <p className="mt-1 text-[var(--color-text-tertiary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
                  DOCX/Word only (max 10MB)
                </p>
                <input
                  id="work-file"
                  type="file"
                  className="hidden"
                  accept=".docx"
                  onChange={e => {
                    const selectedFile = e.target.files?.[0];
                    const error = validateFile(selectedFile);
                    if (error) {
                      setWorkFile(null);
                      setWorkFileError(error);
                      return;
                    }
                    setWorkFile(selectedFile || null);
                    setWorkFileError(null);
                  }}
                />
              </div>
            ) : (
              <div className="mt-4">
                <div
                  className="tiptap-editor upload-editor w-full rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] transition-[var(--transition-standard)] focus-within:border-[var(--color-border-focus)] focus-within:ring-4 focus-within:ring-[var(--color-primary-container)]"
                >
                  <EditorContent editor={workEditor} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Button
                    variant="plain"
                    className="text-xs text-[var(--color-primary)] hover:bg-[var(--color-primary-container)]"
                    icon={<Clipboard size={14} />}
                    onClick={async () => {
                      if (!workEditor) return;
                      try {
                        if (navigator.clipboard.read) {
                          const items = await navigator.clipboard.read();
                          for (const item of items) {
                            if (item.types.includes("text/html")) {
                              const blob = await item.getType("text/html");
                              const html = await blob.text();
                              workEditor.commands.setContent(html);
                              return;
                            }
                          }
                        }
                        const text = await navigator.clipboard.readText();
                        workEditor.commands.setContent(text);
                      } catch (err) {
                        console.error("Failed to paste from clipboard:", err);
                        toast.error(
                          "Unable to paste from clipboard. Please check your permissions.",
                        );
                      }
                    }}
                  >
                    Paste from clipboard
                  </Button>
                  <span className="text-[var(--color-text-tertiary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
                    {workWordCount} words · {workCharCount} chars
                  </span>
                </div>
              </div>
            )}

            {workFile && (
              <div
                className="mt-4 flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-primary-container)] bg-[var(--color-primary-container)] p-3 text-sm text-[var(--color-on-primary-container)]"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="truncate">{workFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWorkFile(null)}
                  className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                >
                  Remove
                </button>
              </div>
            )}

            {workFileError && (
              <div
                className="mt-3 flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-error-container)] bg-[var(--color-error-container)] p-3 text-xs font-medium text-[var(--color-on-error-container)]"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--color-error)]" />
                <span>{workFileError}</span>
              </div>
            )}
          </div>

          {/* Assignment Objectives — conditional glass card */}
          {objectiveAlignmentEnabled && (
            <div
              className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] p-5 transition-[var(--transition-premium)] hover:shadow-[var(--elevation-1)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="font-semibold text-[var(--color-text-primary)]"
                    style={{ fontSize: "1rem", lineHeight: "24px" }}
                  >
                    Assignment Objectives
                  </h3>
                  <p className="text-[var(--color-text-secondary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
                    Optional, required for alignment checks.
                  </p>
                </div>
                <div className="toggle-pill">
                  <button
                    type="button"
                    onClick={() => setInstructionsMode("upload")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-[var(--transition-fast)] ${
                      instructionsMode === "upload" ? "toggle-pill-active" : "toggle-pill-inactive"
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstructionsMode("paste")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-[var(--transition-fast)] ${
                      instructionsMode === "paste" ? "toggle-pill-active" : "toggle-pill-inactive"
                    }`}
                  >
                    Paste
                  </button>
                </div>
              </div>

              {instructionsMode === "upload" ? (
                <div
                  className="mt-4 flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-medium)] bg-[var(--color-surface-background)] p-6 text-center transition-[var(--transition-premium)] hover:border-[var(--color-warning)] hover:bg-[var(--color-warning-container)]"
                  onDrop={e => handleDrop(e, "instructions")}
                  onDragOver={e => e.preventDefault()}
                  onClick={() =>
                    document.getElementById("instructions-file")?.click()
                  }
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--color-warning-container)" }}>
                    <Upload className="h-5 w-5 text-[var(--color-warning)]" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
                    Drop objectives or prompt file
                  </p>
                  <p className="mt-1 text-[var(--color-text-tertiary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
                    DOCX/Word Only (max 10MB)
                  </p>
                  <input
                    id="instructions-file"
                    type="file"
                    className="hidden"
                    accept=".docx"
                    onChange={e => {
                      const selectedFile = e.target.files?.[0];
                      const error = validateFile(selectedFile);
                      if (error) {
                        setInstructionsFile(null);
                        setInstructionsFileError(error);
                        return;
                      }
                      setInstructionsFile(selectedFile || null);
                      setInstructionsFileError(null);
                    }}
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <div
                    className="tiptap-editor upload-editor w-full rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] transition-[var(--transition-standard)] focus-within:border-[var(--color-border-focus)] focus-within:ring-4 focus-within:ring-[var(--color-primary-container)]"
                  >
                    <EditorContent editor={instructionsEditor} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Button
                      variant="plain"
                      className="text-xs text-[var(--color-primary)] hover:bg-[var(--color-primary-container)]"
                      icon={<Clipboard size={14} />}
                      onClick={async () => {
                        if (!instructionsEditor) return;
                        try {
                          if (navigator.clipboard.read) {
                            const items = await navigator.clipboard.read();
                            for (const item of items) {
                              if (item.types.includes("text/html")) {
                                const blob = await item.getType("text/html");
                                const html = await blob.text();
                                instructionsEditor.commands.setContent(html);
                                return;
                              }
                            }
                          }
                          const text = await navigator.clipboard.readText();
                          instructionsEditor.commands.setContent(text);
                        } catch (err) {
                          console.error("Failed to paste from clipboard:", err);
                          toast.error(
                            "Unable to paste from clipboard. Please check your permissions.",
                          );
                        }
                      }}
                    >
                      Paste from clipboard
                    </Button>
                    <span className="text-[var(--color-text-tertiary)]" style={{ fontSize: "0.75rem", lineHeight: "16px" }}>
                      {instructionWordCount} words · {instructionCharCount}{" "}
                      chars
                    </span>
                  </div>
                </div>
              )}

              {instructionsFile && (
                <div
                  className="mt-4 flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-warning-container)] bg-[var(--color-warning-container)] p-3 text-sm text-[var(--color-on-warning-container)]"
                >
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <span className="truncate">{instructionsFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInstructionsFile(null)}
                    className="text-xs font-semibold text-[var(--color-warning)] hover:text-[var(--color-on-warning-container)]"
                  >
                    Remove
                  </button>
                </div>
              )}

              {instructionsFileError && (
                <div
                  className="mt-3 flex items-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-error-container)] bg-[var(--color-error-container)] p-3 text-xs font-medium text-[var(--color-on-error-container)]"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--color-error)]" />
                  <span>{instructionsFileError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button — Premium CTA */}
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-[var(--color-border-subtle)] pt-5">
          <Button
            onClick={handleSubmit}
            icon={<ShieldCheck className="h-4 w-4" />}
            iconPosition="right"
            disabled={processing}
            loading={processing}
            className="w-full rounded-[var(--radius-button)] text-[var(--color-on-primary)] transition-[var(--transition-premium)] hover:-translate-y-0.5 hover:shadow-[var(--elevation-3)] active:translate-y-0"
            style={{
              background: "var(--gradient-hero)",
              boxShadow: "0 2px 8px rgba(26, 115, 232, 0.3), 0 4px 16px rgba(26, 115, 232, 0.15)",
            }}
          >
            Run Verification
          </Button>
          <p className="text-center text-xs text-[var(--color-text-tertiary)]">
            Estimated credit cost will be calculated based on word count
          </p>
        </div>
      </section>

      <ProcessingModal
        isOpen={processing}
        icon={<ShieldCheck className="h-8 w-8 text-white" />}
        title="Verification in progress"
        subtitle="Preparing your submission for integrity checks"
        progress={progress}
        progressMessage={
          processingStage === "creating"
            ? "Creating project workspace..."
            : processingStage === "uploading"
              ? "Uploading your files..."
              : processingStage === "running"
                ? "Running verification checks..."
                : "Launching integrity editor..."
        }
      />

      <MessageModal
        isOpen={errorModal.open}
        title={errorModal.title}
        message={errorModal.message}
        submitText="Close"
        onSubmit={() => setErrorModal({ ...errorModal, open: false })}
        icon={<AlertTriangle className="h-8 w-8 text-[var(--color-error)]" />}
        iconStyle="bg-[var(--color-error-container)] border-[var(--color-error-container)]"
      />

      <InsufficientCreditsModal
        isOpen={showInsufficientCredits}
        requiredCredits={estimatedCredits}
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

      <BuyCreditsModal
        isOpen={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
      />

      <ViewPlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
      />
    </>
  );
};

export default VerificationStart;
