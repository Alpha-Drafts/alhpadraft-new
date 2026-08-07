import { Button, ProcessingModal, MessageModal } from "@/common";
import { API_BASE_URL, userRoutes } from "@/constants";
import { useCurrentSubscription } from "@/hooks";
import {
  Clipboard,
  Upload,
  Info,
  Trash2,
  File,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Lock,
} from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import count from "text-count";
import {
  apiClient,
  calculateCredits,
  isFreePlan as checkIsFreePlan,
} from "@/utils";
import { useClaims, useCredits } from "@/context";
import { CheckTypeId } from "@/types";
import axios from "axios";
import { toast } from "react-toastify";
import { extractTextFromFile, extractHtmlFromFile } from "@/utils/file-extract";
import InsufficientCreditsModal from "@/components/dashboard/modals/InsufficientCreditsModal";
import BuyCreditsModal from "@/components/dashboard/modals/BuyCreditsModal";
import ViewPlanModal from "@/components/dashboard/settings/ViewPlanModal";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

const MAX_FILE_SIZE_MB = 10;

const UploadForm = ({
  setStep,
}: {
  setStep: React.Dispatch<React.SetStateAction<"upload" | "analyse">>;
}) => {
  const router = useRouter();
  const { id: projectId } = router.query;

  const { token } = useClaims();

  const [objectiveText, setObjectiveText] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [objectiveFile, setObjectiveFile] = useState<File | null>(null);
  const [guideFile, setGuideFile] = useState<File | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [objectiveFileError, setObjectiveFileError] = useState<string | null>(
    null,
  );
  const [guideFileError, setGuideFileError] = useState<string | null>(null);
  const [submissionFileError, setSubmissionFileError] = useState<string | null>(
    null,
  );
  const objectiveFileInputRef = useRef<HTMLInputElement>(null);
  const guideFileInputRef = useRef<HTMLInputElement>(null);
  const submissionFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedChecks, setSelectedChecks] = useState({
    aiDetection: true,
    plagiarismSearch: true,
    objectiveAlignment: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const { data: subscription } = useCurrentSubscription();
  const { balance } = useCredits();

  // TipTap editors — preserve formatting from Word paste
  const objectiveEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Paste the assignment prompt or objectives here...",
      }),
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setObjectiveText(editor.getText());
    },
  });

  const submissionEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Paste your draft for verification...",
      }),
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setSubmissionText(editor.getText());
    },
  });

  const isFreePlan = checkIsFreePlan(subscription?.currentPlan);
  const hideUploadInput = isFreePlan;

  const selectedCheckCount = useMemo(
    () => Object.values(selectedChecks).filter(Boolean).length,
    [selectedChecks],
  );

  React.useEffect(() => {
    if (!isFreePlan && (objectiveText.trim() || objectiveFile)) {
      setSelectedChecks(prev =>
        prev.objectiveAlignment ? prev : { ...prev, objectiveAlignment: true },
      );
    }
  }, [objectiveFile, objectiveText, isFreePlan]);

  const validateFile = (selectedFile: File | undefined | null) => {
    if (!selectedFile) return "No file selected.";
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return "File exceeds 10MB size limit.";
    }
    if (!selectedFile.name.toLowerCase().endsWith(".docx")) {
      return "Only .docx files are supported.";
    }
    return null;
  };

  // Handle file selection
  const handleObjectiveFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = e.target.files?.[0];
    const error = validateFile(selectedFile);
    if (error) {
      setObjectiveFile(null);
      setObjectiveFileError(error);
      return;
    }
    setObjectiveFile(selectedFile || null);
    setObjectiveFileError(null);
  };

  const handleGuideFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const error = validateFile(selectedFile);
    if (error) {
      setGuideFile(null);
      setGuideFileError(error);
      return;
    }
    setGuideFile(selectedFile || null);
    setGuideFileError(null);
  };

  const handleSubmissionFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = e.target.files?.[0];
    const error = validateFile(selectedFile);
    if (error) {
      setSubmissionFile(null);
      setSubmissionFileError(error);
      return;
    }
    setSubmissionFile(selectedFile || null);
    setSubmissionFileError(null);
  };

  // Handle drag and drop
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    target: "objectives" | "guide" | "submission",
  ) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    const error = validateFile(droppedFile);
    if (target === "objectives") {
      if (error) {
        setObjectiveFile(null);
        setObjectiveFileError(error);
        return;
      }
      setObjectiveFile(droppedFile);
      setObjectiveFileError(null);
      return;
    }
    if (target === "guide") {
      if (error) {
        setGuideFile(null);
        setGuideFileError(error);
        return;
      }
      setGuideFile(droppedFile);
      setGuideFileError(null);
      return;
    }
    if (error) {
      setSubmissionFile(null);
      setSubmissionFileError(error);
      return;
    }
    setSubmissionFile(droppedFile);
    setSubmissionFileError(null);
  };

  // Remove file
  const handleRemoveFile = (target: "objectives" | "guide" | "submission") => {
    if (target === "objectives") {
      setObjectiveFile(null);
      setObjectiveFileError(null);
      if (objectiveFileInputRef.current) {
        objectiveFileInputRef.current.value = "";
      }
      return;
    }
    if (target === "guide") {
      setGuideFile(null);
      setGuideFileError(null);
      if (guideFileInputRef.current) {
        guideFileInputRef.current.value = "";
      }
      return;
    }
    setSubmissionFile(null);
    setSubmissionFileError(null);
    if (submissionFileInputRef.current) {
      submissionFileInputRef.current.value = "";
    }
  };

  // Handle modal actions
  const handleModalSubmit = () => {
    if (errorStatusCode === 403) {
      // Redirect to pricing page for upgrade
      router.push(userRoutes.settings + "?tab=billing");
    } else {
      // Try again - retry the upload
      setShowErrorModal(false);
      setErrorStatusCode(null);
      setSubmitError(null); // Clear previous error
      handleSubmit();
    }
  };

  const handleModalCancel = () => {
    setShowErrorModal(false);
    setErrorStatusCode(null);
  };

  // Word and char count using text-count
  const objectiveWordCount = count.wordCount(objectiveText);
  const objectiveCharCount = count.charCount(objectiveText);
  const submissionWordCount = count.wordCount(submissionText);
  const submissionCharCount = count.charCount(submissionText);

  // Map check state to CheckTypeId array for credit calculation
  const selectedCheckTypes = useMemo(() => {
    const types: CheckTypeId[] = [];
    if (selectedChecks.aiDetection) types.push("ai");
    if (selectedChecks.plagiarismSearch) types.push("plagiarism");
    if (selectedChecks.objectiveAlignment) types.push("alignment");
    return types;
  }, [selectedChecks]);

  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);

  const estimatedCredits =
    !isFreePlan && submissionWordCount > 0 && selectedCheckTypes.length > 0
      ? calculateCredits(submissionWordCount, selectedCheckTypes)
      : 0;

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 90) {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  };

  // Helper function to submit text content
  const submitInstructionText = useCallback(
    async (text: string, _purpose: "objectives" | "guide") => {
      const clearSimulation = simulateProgress();

      try {
        const textResponse = await apiClient.post(
          `${API_BASE_URL}/v1/projects/${projectId}/instructions/analyze`,
          {
            textContent: text,
            // NOTE: `purpose` was removed — the decoupled backend's
            // UploadInstructionDto only accepts textContent (whitelist).
          },
        );
        // Set to 100% when complete
        setUploadProgress(100);
        return textResponse?.data?.data?.id;
      } catch (error: unknown) {
        clearSimulation();
        // Check if it's an Axios error with a response
        if (axios.isAxiosError(error) && error.response) {
          const statusError = new Error(
            error.response.data?.message ||
              error.message ||
              "An error occurred",
          );
          (statusError as Error & { statusCode?: number }).statusCode =
            error.response.status;
          throw statusError;
        }
        throw error;
      }
    },
    [projectId],
  );

  const submitSubmissionText = useCallback(
    async (text: string) => {
      const clearSimulation = simulateProgress();

      try {
        // Send HTML to preserve formatting from Word paste
        const htmlContent = submissionEditor?.getHTML() || text;
        const textResponse = await apiClient.post(
          `${API_BASE_URL}/v1/projects/${projectId}/posts`,
          htmlContent,
          {
            headers: {
              "Content-Type": "text/html",
            },
          },
        );
        setUploadProgress(100);
        return textResponse?.data?.data?.id;
      } catch (error: unknown) {
        clearSimulation();
        if (axios.isAxiosError(error) && error.response) {
          const statusError = new Error(
            error.response.data?.message ||
              error.message ||
              "An error occurred",
          );
          (statusError as Error & { statusCode?: number }).statusCode =
            error.response.status;
          throw statusError;
        }
        throw error;
      }
    },
    [projectId, submissionEditor],
  );

  // Submission handler
  const handleSubmit = async () => {
    if (!token) return;
    if (submitting) return;

    // Credit check for paid plans
    if (!isFreePlan && estimatedCredits > 0 && estimatedCredits > balance) {
      setShowInsufficientCredits(true);
      return;
    }

    const hasObjectives = !!objectiveText.trim() || !!objectiveFile;
    const hasSubmission = !!submissionText.trim() || !!submissionFile;
    const hasChecks = selectedCheckCount > 0;

    if (!hasObjectives || !hasSubmission || !hasChecks) {
      setSubmitError(
        !hasObjectives
          ? "Please add assignment objectives (text or file)."
          : !hasSubmission
            ? "Please add a work submission (text or file)."
            : "Select at least one check to run.",
      );
      setShowErrorModal(true);
      return;
    }

    setSubmitError(null);
    setErrorStatusCode(null);
    setSubmitting(true);
    setShowProcessingModal(true);
    setUploadProgress(0); // Reset progress at start

    try {
      let uploadSuccess = false;

      // Free plan: only text allowed
      if (hideUploadInput) {
        if (objectiveText.trim()) {
          await submitInstructionText(objectiveText.trim(), "objectives");
          uploadSuccess = true;
        }
        if (submissionText.trim()) {
          await submitSubmissionText(submissionText.trim());
          uploadSuccess = true;
        }
      } else {
        // Premium plan: file or text or both allowed
        // Files are extracted client-side and sent as text/HTML
        if (objectiveFile) {
          const extracted = await extractTextFromFile(objectiveFile);
          if (!extracted.trim())
            throw new Error(
              "The uploaded objectives file appears to be empty.",
            );
          await submitInstructionText(extracted, "objectives");
          uploadSuccess = true;
        }
        if (objectiveText.trim()) {
          await submitInstructionText(objectiveText.trim(), "objectives");
          uploadSuccess = true;
        }
        if (guideFile) {
          const extracted = await extractTextFromFile(guideFile);
          if (!extracted.trim())
            throw new Error("The uploaded guide file appears to be empty.");
          await submitInstructionText(extracted, "guide");
          uploadSuccess = true;
        }
        if (submissionFile) {
          const extractedHtml = await extractHtmlFromFile(submissionFile);
          if (!extractedHtml.trim())
            throw new Error(
              "The uploaded submission file appears to be empty.",
            );
          const clearSimulation = simulateProgress();
          try {
            await apiClient.post(
              `${API_BASE_URL}/v1/projects/${projectId}/posts`,
              extractedHtml,
              { headers: { "Content-Type": "text/html" } },
            );
            setUploadProgress(100);
            uploadSuccess = true;
          } catch (error: unknown) {
            clearSimulation();
            if (axios.isAxiosError(error) && error.response) {
              const statusError = new Error(
                error.response.data?.message ||
                  error.message ||
                  "An error occurred",
              );
              (statusError as Error & { statusCode?: number }).statusCode =
                error.response.status;
              throw statusError;
            }
            throw error;
          }
        }
        if (submissionText.trim()) {
          await submitSubmissionText(submissionText.trim());
          uploadSuccess = true;
        }
      }

      if (uploadSuccess) {
        // Set final progress to 100% before moving to next step
        setUploadProgress(100);
        setTimeout(() => {
          setStep("analyse");
        }, 500); // Small delay to show 100% complete before moving on
      } else {
        throw new Error("Please upload a file or paste some text.");
      }
    } catch (error: unknown) {
      let errorMessage: string = "An error occurred";
      let statusCode: number | null = null;

      if (typeof error === "object" && error !== null) {
        if ("message" in error) {
          errorMessage =
            (error as { message?: string }).message || errorMessage;
        }
        if ("statusCode" in error) {
          statusCode = (error as { statusCode?: number }).statusCode || null;
        }
      }

      if (statusCode === 403) {
        setShowInsufficientCredits(true);
      } else {
        setSubmitError(errorMessage);
        setErrorStatusCode(statusCode);
        setShowErrorModal(true);
      }
    } finally {
      setSubmitting(false);
      setShowProcessingModal(false);
      // Don't reset progress here so the user can see final progress in the UI
    }
  };

  return (
    <>
      <main className="space-y-6">
        {/* Header Section with Clear Guidance */}
        <section className="space-y-3 rounded-lg bg-[#F8F9FA] p-6">
          <h2 className="text-xl font-semibold text-[#0A0A0A]">
            Prepare Your Verification Inputs
          </h2>
          <p className="text-sm leading-relaxed text-[#717182]">
            Build the ground truth so we can flag compliance risks before
            submission. Add assignment objectives, optional style guidance, and
            the work you want to verify.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Assignment Objectives */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Assignment Objectives
              </h3>
              <span className="text-xs font-medium text-red-500">Required</span>
            </div>

            <div className="flex flex-1 flex-col">
              <div className="tiptap-editor upload-editor w-full rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20">
                <EditorContent editor={objectiveEditor} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="plain"
                className="text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                icon={<Clipboard size={14} />}
                onClick={async () => {
                  if (!objectiveEditor) return;
                  try {
                    if (navigator.clipboard.read) {
                      const items = await navigator.clipboard.read();
                      for (const item of items) {
                        if (item.types.includes("text/html")) {
                          const blob = await item.getType("text/html");
                          const html = await blob.text();
                          objectiveEditor.commands.setContent(html);
                          return;
                        }
                      }
                    }
                    const text = await navigator.clipboard.readText();
                    objectiveEditor.commands.setContent(text);
                  } catch (err) {
                    console.error("Failed to paste from clipboard:", err);
                    toast.error(
                      "Unable to paste from clipboard. Please check your permissions.",
                    );
                  }
                }}
              >
                Paste from Clipboard
              </Button>
              <p className="text-xs font-medium text-gray-500">
                {objectiveWordCount} words · {objectiveCharCount} characters
              </p>
            </div>

            {!hideUploadInput && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500">
                  Or upload the objectives as a file.
                </p>
                <div
                  className="flex min-h-[180px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-200 hover:border-violet-400 hover:bg-gradient-to-br hover:from-violet-50 hover:to-teal-50 hover:shadow-md"
                  onDrop={e => handleDrop(e, "objectives")}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => objectiveFileInputRef.current?.click()}
                >
                  <div className="w-full text-center">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
                      <File className="h-6 w-6 text-violet-600" />
                    </span>
                    <div className="mt-4 flex flex-wrap justify-center gap-1 text-sm text-gray-700">
                      <span className="font-medium">Drop file here or</span>
                      <span className="font-semibold text-violet-600 underline hover:text-violet-700">
                        browse
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-gray-500">
                      DOCX/Word Only (max 10MB)
                    </p>
                    <input
                      title="objective-file-input"
                      ref={objectiveFileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleObjectiveFileChange}
                      accept=".docx"
                    />
                  </div>
                </div>

                {objectiveFile && (
                  <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-teal-50 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-white shadow-sm">
                          <File className="h-5 w-5 text-violet-600" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {objectiveFile.name}
                          </p>
                          <p className="text-xs font-medium text-gray-600">
                            {(objectiveFile.size / (1024 * 1024)).toFixed(2)} MB
                            ·{" "}
                            {objectiveFile.name.split(".").pop()?.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="plain"
                        icon={
                          <Trash2 className="size-4 shrink-0 text-red-500" />
                        }
                        className="rounded-lg p-1.5 hover:bg-red-50"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveFile("objectives");
                        }}
                      />
                    </div>
                  </div>
                )}

                {objectiveFileError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                    <Info className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{objectiveFileError}</span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Writing Guide */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Writing Guide
              </h3>
              <span className="text-xs font-medium text-gray-500">
                Optional
              </span>
            </div>

            {!hideUploadInput ? (
              <>
                <div
                  className="flex min-h-[260px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-200 hover:border-violet-400 hover:bg-gradient-to-br hover:from-violet-50 hover:to-teal-50 hover:shadow-md"
                  onDrop={e => handleDrop(e, "guide")}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => guideFileInputRef.current?.click()}
                >
                  <div className="w-full text-center">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
                      <Upload className="h-6 w-6 text-violet-600" />
                    </span>
                    <div className="mt-4 flex flex-wrap justify-center gap-1 text-sm text-gray-700">
                      <span className="font-medium">Drop file here or</span>
                      <span className="font-semibold text-violet-600 underline hover:text-violet-700">
                        browse
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-gray-500">
                      DOCX/Word Only (max 10MB)
                    </p>
                    <input
                      title="guide-file-input"
                      ref={guideFileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleGuideFileChange}
                      accept=".docx"
                    />
                  </div>
                </div>

                {guideFile && (
                  <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-teal-50 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-white shadow-sm">
                          <File className="h-5 w-5 text-violet-600" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {guideFile.name}
                          </p>
                          <p className="text-xs font-medium text-gray-600">
                            {(guideFile.size / (1024 * 1024)).toFixed(2)} MB ·{" "}
                            {guideFile.name.split(".").pop()?.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="plain"
                        icon={
                          <Trash2 className="size-4 shrink-0 text-red-500" />
                        }
                        className="rounded-lg p-1.5 hover:bg-red-50"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveFile("guide");
                        }}
                      />
                    </div>
                  </div>
                )}

                {guideFileError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                    <Info className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{guideFileError}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
                Upgrade your plan to upload a writing guide. You can still
                proceed without one.
              </div>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Work Submission */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Work Submission
              </h3>
              <span className="text-xs font-medium text-red-500">Required</span>
            </div>

            <div className="flex flex-1 flex-col">
              <div className="tiptap-editor upload-editor w-full rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20">
                <EditorContent editor={submissionEditor} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="plain"
                className="text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                icon={<Clipboard size={14} />}
                onClick={async () => {
                  if (!submissionEditor) return;
                  try {
                    // Try reading HTML from clipboard for rich text formatting
                    if (navigator.clipboard.read) {
                      const items = await navigator.clipboard.read();
                      for (const item of items) {
                        if (item.types.includes("text/html")) {
                          const blob = await item.getType("text/html");
                          const html = await blob.text();
                          submissionEditor.commands.setContent(html);
                          return;
                        }
                      }
                    }
                    // Fallback: read plain text
                    const text = await navigator.clipboard.readText();
                    submissionEditor.commands.setContent(text);
                  } catch (err) {
                    console.error("Failed to paste from clipboard:", err);
                    toast.error(
                      "Unable to paste from clipboard. Please check your permissions.",
                    );
                  }
                }}
              >
                Paste from Clipboard
              </Button>
              <p className="text-xs font-medium text-gray-500">
                {submissionWordCount} words · {submissionCharCount} characters
              </p>
            </div>

            {!hideUploadInput && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500">
                  Or upload your draft file.
                </p>
                <div
                  className="flex min-h-[180px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all duration-200 hover:border-violet-400 hover:bg-gradient-to-br hover:from-violet-50 hover:to-teal-50 hover:shadow-md"
                  onDrop={e => handleDrop(e, "submission")}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => submissionFileInputRef.current?.click()}
                >
                  <div className="w-full text-center">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
                      <File className="h-6 w-6 text-violet-600" />
                    </span>
                    <div className="mt-4 flex flex-wrap justify-center gap-1 text-sm text-gray-700">
                      <span className="font-medium">Drop file here or</span>
                      <span className="font-semibold text-violet-600 underline hover:text-violet-700">
                        browse
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-gray-500">
                      DOCX/Word Only (max 10MB)
                    </p>
                    <input
                      title="submission-file-input"
                      ref={submissionFileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleSubmissionFileChange}
                      accept=".docx"
                    />
                  </div>
                </div>

                {submissionFile && (
                  <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-teal-50 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-white shadow-sm">
                          <File className="h-5 w-5 text-violet-600" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {submissionFile.name}
                          </p>
                          <p className="text-xs font-medium text-gray-600">
                            {(submissionFile.size / (1024 * 1024)).toFixed(2)}{" "}
                            MB ·{" "}
                            {submissionFile.name
                              .split(".")
                              .pop()
                              ?.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="plain"
                        icon={
                          <Trash2 className="size-4 shrink-0 text-red-500" />
                        }
                        className="rounded-lg p-1.5 hover:bg-red-50"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveFile("submission");
                        }}
                      />
                    </div>
                  </div>
                )}

                {submissionFileError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                    <Info className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{submissionFileError}</span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Check Selection */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Checks to Run
            </h3>
            <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedChecks.aiDetection}
                  onChange={e =>
                    setSelectedChecks(prev => ({
                      ...prev,
                      aiDetection: e.target.checked,
                    }))
                  }
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">
                      AI Detection
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Flags likely AI-generated passages.
                  </p>
                </div>
              </label>

              <div
                className={`flex items-start gap-3 ${isFreePlan ? "cursor-pointer opacity-50 hover:opacity-70" : ""}`}
                onClick={isFreePlan ? () => setShowPlanModal(true) : undefined}
              >
                <input
                  type="checkbox"
                  aria-label="Plagiarism Search"
                  className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  checked={selectedChecks.plagiarismSearch}
                  disabled={isFreePlan}
                  onChange={e =>
                    setSelectedChecks(prev => ({
                      ...prev,
                      plagiarismSearch: e.target.checked,
                    }))
                  }
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">
                      Plagiarism Search
                    </p>
                    {isFreePlan && (
                      <Lock className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {isFreePlan
                      ? "Upgrade to unlock"
                      : "Detects overlaps with published sources."}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-start gap-3 ${isFreePlan ? "cursor-pointer opacity-50 hover:opacity-70" : ""}`}
                onClick={isFreePlan ? () => setShowPlanModal(true) : undefined}
              >
                <input
                  type="checkbox"
                  aria-label="Objective Alignment"
                  className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  checked={selectedChecks.objectiveAlignment}
                  disabled={isFreePlan}
                  onChange={e =>
                    setSelectedChecks(prev => ({
                      ...prev,
                      objectiveAlignment: e.target.checked,
                    }))
                  }
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">
                      Objective Alignment
                    </p>
                    {isFreePlan && (
                      <Lock className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {isFreePlan
                      ? "Upgrade to unlock"
                      : "Compares your draft against the objectives."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700">
              Select at least one check. We map issues back into the editor with
              color-coded highlights.
            </div>
          </section>
        </div>

        <section className="flex flex-col items-start gap-4 border-t border-gray-200 pt-6 md:flex-row md:items-center md:justify-between">
          <Button
            variant="plain"
            link={userRoutes?.projects}
            icon={<ArrowLeft className="h-4 w-4" />}
            className="text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
            disabled={
              submitting ||
              !selectedCheckCount ||
              (!objectiveText.trim() && !objectiveFile) ||
              (!submissionText.trim() && !submissionFile)
            }
            loading={submitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg md:ml-auto"
          >
            Run Verification
          </Button>
        </section>
      </main>

      {showProcessingModal && (
        <ProcessingModal
          isOpen={showProcessingModal}
          icon={<Upload className="h-8 w-8 text-white" />}
          title="Preparing Verification"
          subtitle="We are processing your objectives, guide, and submission"
          progress={uploadProgress}
          progressMessage={
            uploadProgress < 100
              ? `Uploading... ${uploadProgress}%`
              : "Running verification checks..."
          }
        />
      )}

      {showErrorModal && (
        <MessageModal
          isOpen={showErrorModal}
          icon={<AlertTriangle className="h-8 w-8 text-red-500" />}
          iconStyle="bg-red-100 border-red-50"
          title={
            errorStatusCode === 403 ? "Insufficient Credits" : "Upload Failed"
          }
          message={
            submitError ||
            "There was an error uploading your content. Please try again."
          }
          submitText={errorStatusCode === 403 ? "Buy Credits" : "Try Again"}
          onSubmit={handleModalSubmit}
          closeOnOverlayClick={true}
          onCancel={handleModalCancel}
        />
      )}

      <InsufficientCreditsModal
        isOpen={showInsufficientCredits}
        requiredCredits={estimatedCredits}
        availableCredits={balance}
        planName={subscription?.currentPlan}
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

export default UploadForm;
