import { Button, Modal } from "@/common";
import { API_BASE_URL } from "@/constants";
import { Upload } from "lucide-react";
import React, { useState } from "react";
import { apiClient } from "@/utils";
import count from "text-count";
import { useClaims } from "@/context";
import { MessageModal } from "@/common/ui/modals/MessageModal";
import { useRouter } from "next/router";
import { X } from "lucide-react";
import { isAxiosError } from "axios";

interface AddInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  refetchData: () => void;
  initialInstructions?: string; // New prop for prefilled instructions
}

const AddInstructionsModal = ({
  isOpen,
  onClose,
  projectId,
  refetchData,
  initialInstructions = "", // Default to empty string
}: AddInstructionsModalProps) => {
  const { token } = useClaims();
  const router = useRouter();

  const [instructions, setInstructions] = useState(initialInstructions);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  type ErrorResponseData = {
    message?: string;
    statusCode?: number;
    [key: string]: unknown;
  };

  // Prefill instructions when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setInstructions(initialInstructions);
      setError(null);
      setErrorStatusCode(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Word and char count using text-count
  const wordCount = count.wordCount(instructions);
  const charCount = count.charCount(instructions);

  const handleSubmit = async () => {
    if (!token) return;
    if (submitting) return;

    if (!instructions.trim()) {
      setError("Please enter some instructions.");
      return;
    }

    if (!projectId) {
      setError("Project ID is missing. Please refresh the page.");
      return;
    }

    setError(null);
    setSubmitting(true);
    setErrorStatusCode(null);

    try {
      await apiClient.put(
        `${API_BASE_URL}/v1/projects/${projectId}/instructions/update-and-analyze`,
        {
          textContent: instructions.trim(),
        },
      );
      setInstructions("");
      setError(null);
      onClose();
      if (refetchData) {
        refetchData();
      }
    } catch (err: unknown) {
      let message = "Failed to update instructions. Please try again.";
      let statusCode: number | null = null;
      if (isAxiosError<ErrorResponseData>(err)) {
        const data = err.response?.data;
        message = data?.message || err.message || message;
        statusCode = data?.statusCode ?? err.response?.status ?? null;
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }
      setError(message);
      setErrorStatusCode(statusCode);
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setInstructions("");
      setError(null);
      onClose();
    }
  };

  // Add MessageModal for error display
  return (
    <>
      <Modal isOpen={isOpen} onCancel={handleClose}>
        <div className="modal-content_container max-w-[500px]">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="text-primary-500 h-5 w-5" />
                <h3 className="text-body-semibold-16 text-black">
                  Upload More Instructions
                </h3>
              </div>
            </div>
            <p className="text-body-regular-14 mt-2 text-gray-500">
              Add additional text-based instructions to refine your project
              analysis.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="instructions"
                className="text-body-semibold-14 text-black"
              >
                Instructions
              </label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Enter your additional instructions here..."
                rows={8}
                className="text-body-regular-14 focus:border-primary-500 focus:ring-primary-500 mt-2 w-full rounded-lg border border-gray-300 p-3 focus:ring-1 focus:outline-none"
                disabled={submitting}
              />
              <div className="text-body-regular-12 mt-2 flex justify-between text-gray-500">
                <span>{wordCount} words</span>
                <span>{charCount} characters</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !instructions.trim()}
                icon={<Upload className="h-4 w-4" />}
              >
                {submitting ? "Updating..." : "Update Instructions"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <MessageModal
        isOpen={showErrorModal}
        iconStyle={
          errorStatusCode === 403
            ? "bg-red-100 border-red-50 text-red-500"
            : undefined
        }
        icon={<X />}
        title={errorStatusCode === 403 ? "Limit Reached" : "Update Failed"}
        message={error}
        submitText={errorStatusCode === 403 ? "Upgrade Plan" : "Try Again"}
        onSubmit={() => {
          if (errorStatusCode === 403) {
            router.push("/settings?tab=billing");
          } else {
            setShowErrorModal(false);
            setErrorStatusCode(null);
            setError(null);
          }
        }}
        cancelText={errorStatusCode === 403 ? undefined : "Close"}
        onCancel={() => {
          setShowErrorModal(false);
          setErrorStatusCode(null);
          setError(null);
        }}
      />
    </>
  );
};

export default AddInstructionsModal;
