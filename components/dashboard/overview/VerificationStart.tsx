import React, { useEffect, useMemo, useState } from "react";
import {
  Clipboard,
  File,
  Upload,
  ShieldCheck,
  AlertTriangle,
  Lock,
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
      <div
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        data-tour="verification-checks"
      >
        <h3 className="text-base font-semibold text-slate-900">
          Verification Checks
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Choose which risk signals you want flagged before submission.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-slate-300 text-violet-600 focus:ring-violet-400"
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
                <p className="text-sm font-semibold text-slate-800">
                  AI Detection
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Flags likely AI-generated passages.
              </p>
            </div>
          </label>

          <div
            className={`flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 ${
              isFreePlan ? "cursor-pointer opacity-50 hover:opacity-70" : ""
            }`}
            onClick={isFreePlan ? () => setShowPlanModal(true) : undefined}
          >
            <input
              type="checkbox"
              aria-label="Plagiarism Search"
              className="mt-1 size-4 rounded border-slate-300 text-violet-600 focus:ring-violet-400 disabled:opacity-50"
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
                <p className="text-sm font-semibold text-slate-800">
                  Plagiarism Search
                </p>
                {isFreePlan && <Lock className="h-3.5 w-3.5 text-slate-400" />}
              </div>
              <p className="text-xs text-slate-500">
                {isFreePlan
                  ? "Upgrade to unlock"
                  : "Detects overlaps with published sources."}
              </p>
            </div>
          </div>

          <div
            className={`flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 ${
              isFreePlan ? "cursor-pointer opacity-50 hover:opacity-70" : ""
            }`}
            onClick={isFreePlan ? () => setShowPlanModal(true) : undefined}
          >
            <input
              type="checkbox"
              aria-label="Objective Alignment"
              className="mt-1 size-4 rounded border-slate-300 text-violet-600 focus:ring-violet-400 disabled:opacity-50"
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
                <p className="text-sm font-semibold text-slate-800">
                  Objective Alignment
                </p>
                {isFreePlan && <Lock className="h-3.5 w-3.5 text-slate-400" />}
              </div>
              <p className="text-xs text-slate-500">
                {isFreePlan
                  ? "Upgrade to unlock"
                  : "Highlights gaps versus requirements."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section
        className="mt-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-3 shadow-sm sm:p-6 md:p-8"
        data-tour="work-upload"
      >
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Final Work
                </h3>
                <p className="text-xs text-slate-500">
                  Upload a file or paste your full draft.
                </p>
              </div>
              <div className="flex gap-2 rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setWorkMode("upload")}
                  className={`rounded-full px-3 py-1 transition ${
                    workMode === "upload"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setWorkMode("paste")}
                  className={`rounded-full px-3 py-1 transition ${
                    workMode === "paste"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Paste
                </button>
              </div>
            </div>

            {workMode === "upload" ? (
              <div
                className="mt-4 flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-violet-400 hover:bg-violet-50"
                onDrop={e => handleDrop(e, "work")}
                onDragOver={e => e.preventDefault()}
                onClick={() => document.getElementById("work-file")?.click()}
              >
                <Upload className="h-6 w-6 text-violet-600" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Drop your file here or browse
                </p>
                <p className="mt-1 text-xs text-slate-500">
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
                <div className="tiptap-editor upload-editor w-full rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-200/60">
                  <EditorContent editor={workEditor} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Button
                    variant="plain"
                    className="text-xs text-violet-700 hover:bg-violet-50"
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
                  <span className="text-xs text-slate-500">
                    {workWordCount} words · {workCharCount} chars
                  </span>
                </div>
              </div>
            )}

            {workFile && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-800">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="truncate">{workFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWorkFile(null)}
                  className="text-xs font-semibold text-violet-700 hover:text-violet-900"
                >
                  Remove
                </button>
              </div>
            )}

            {workFileError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{workFileError}</span>
              </div>
            )}
          </div>

          {objectiveAlignmentEnabled && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Assignment Objectives
                  </h3>
                  <p className="text-xs text-slate-500">
                    Optional, required for alignment checks.
                  </p>
                </div>
                <div className="flex gap-2 rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setInstructionsMode("upload")}
                    className={`rounded-full px-3 py-1 transition ${
                      instructionsMode === "upload"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstructionsMode("paste")}
                    className={`rounded-full px-3 py-1 transition ${
                      instructionsMode === "paste"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Paste
                  </button>
                </div>
              </div>

              {instructionsMode === "upload" ? (
                <div
                  className="mt-4 flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-amber-400 hover:bg-amber-50"
                  onDrop={e => handleDrop(e, "instructions")}
                  onDragOver={e => e.preventDefault()}
                  onClick={() =>
                    document.getElementById("instructions-file")?.click()
                  }
                >
                  <Upload className="h-6 w-6 text-amber-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Drop objectives or prompt file
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
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
                  <div className="tiptap-editor upload-editor w-full rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-200/60">
                    <EditorContent editor={instructionsEditor} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Button
                      variant="plain"
                      className="text-xs text-amber-700 hover:bg-amber-50"
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
                    <span className="text-xs text-slate-500">
                      {instructionWordCount} words · {instructionCharCount}{" "}
                      chars
                    </span>
                  </div>
                </div>
              )}

              {instructionsFile && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <span className="truncate">{instructionsFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInstructionsFile(null)}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-900"
                  >
                    Remove
                  </button>
                </div>
              )}

              {instructionsFileError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{instructionsFileError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 border-t border-slate-200 pt-4">
          <Button
            onClick={handleSubmit}
            icon={<ShieldCheck className="h-4 w-4" />}
            iconPosition="right"
            disabled={processing}
            loading={processing}
            className="w-full bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-md transition-all duration-200 hover:from-violet-700 hover:to-violet-800"
          >
            Run Verification
          </Button>
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
        icon={<AlertTriangle className="h-8 w-8 text-red-500" />}
        iconStyle="bg-red-100 border-red-50"
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
