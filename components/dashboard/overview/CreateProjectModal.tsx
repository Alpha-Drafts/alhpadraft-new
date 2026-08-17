import React, { useEffect, useState } from "react";
import { CheckCircle, ChevronDown, X } from "lucide-react";
import { Button, Modal } from "@/common";
import { MessageModal } from "@/common/ui/modals/MessageModal";
import Image from "next/image";
import site from "@/site.metadata";
import {
  API_BASE_URL,
  PROJECT_TYPES,
  userRoutes,
  CITATION_STYLES,
} from "@/constants";
import { useRouter } from "next/router";
import {
  CitationStyleType,
  ProjectCreateProps,
  ProjectHistoryProps,
  ProjectTypeType,
} from "@/types";
import { useClaims } from "@/context";
import { apiClient } from "@/utils";
import { useFetchHook } from "@/hooks";

interface FormData {
  name: string;
  description: string;
  type: ProjectTypeType | "";
  dueDate: string | null;
}

interface ErrorProps {
  statusCode: number;
  message: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  showCitationStyle?: boolean;
  onProjectCreated?: (projectId: string, citationStyle?: string) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  showCitationStyle = false,
  onProjectCreated,
}) => {
  const router = useRouter();
  const { token } = useClaims();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    type: "",
    dueDate: null,
  });
  const [citationStyle, setCitationStyle] = useState<CitationStyleType>("APA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string>("");
  const [subscribeError, setSubscribeError] = useState("");
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const { refetch: refetchRecentProjects } = useFetchHook<ProjectHistoryProps>({
    endpoint: `${API_BASE_URL}/v2/projects?skip=0&take=3`,
    enabled: !!token,
  });
  const { refetch: refetchAllProjects } = useFetchHook<ProjectHistoryProps>({
    endpoint: `${API_BASE_URL}/v2/projects`,
    enabled: !!token,
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        type: "",
        dueDate: null,
      });
      setCitationStyle("APA");
      setError("");
    }
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCitationStyleChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setCitationStyle(e.target.value as CitationStyleType);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.type
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Date validation (optional)
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setError("Due date cannot be in the past");
        setIsSubmitting(false);
        return;
      }
    }

    // Prepare payload
    const payload: ProjectCreateProps = {
      name: formData.name,
      description: formData.description,
      content: "",
      type: formData.type,
      dueDate: formData.dueDate ? formData.dueDate : null,
    };

    setIsSubmitting(true);
    try {
      // Inline project creation logic
      if (!token) {
        setError("Authentication token not found.");
        setIsSubmitting(false);
        return;
      }

      // POST /v1/projects (the decoupled backend has no bare POST /v2/projects)
      const createPayload = {
        name: payload.name,
        description: payload.description,
        type: payload.type,
        dueDate: payload.dueDate || undefined,
      };
      const response = await apiClient.post(
        `${API_BASE_URL}/v1/projects`,
        createPayload,
      );

      if (response.data.status === "success") {
        const projectId = response.data.data.id;
        setProjectId(projectId);
        setFormData({ name: "", description: "", type: "", dueDate: null });
        setError("");

        // Refetch project data to update recent projects list
        await refetchRecentProjects();
        await refetchAllProjects();

        // If onProjectCreated callback is provided, use it
        if (onProjectCreated) {
          onProjectCreated(projectId, citationStyle);
          onClose();
          return;
        }

        // Default behavior - close modal and navigate to project
        onClose();
        return;
      }

      // If not success, throw error
      throw new Error(response.data.message || "Failed to create project");
    } catch (error) {
      let statusCode: number | undefined;
      let errorMessage: string = "An error occurred";

      if (typeof error === "object" && error !== null) {
        statusCode = (error as ErrorProps).statusCode;
        errorMessage = (error as ErrorProps).message || errorMessage;
      }

      if (statusCode === 403) {
        if (errorMessage?.includes("User is not subscribed")) {
          setSubscribeError(
            "You need to be subscribed to a plan to create a project.",
          );
        } else {
          setSubscribeError(
            errorMessage || "You need to be subscribed to a plan.",
          );
        }
        setShowSubscribeModal(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onCancel={onClose}>
        <div className="modal-content_container max-w-[390px]">
          <div className="mb-6">
            <div className="flex items-center">
              <Image src={site.icon} alt={site.title} width={40} height={40} />
              <h2 className="text-body-semibold-20 text-[var(--color-text-primary)]">
                Start New Project
              </h2>
            </div>

            <p className="text-body-regular-12 mt-1 text-[var(--color-text-secondary)]">
              Set up a new writing project with AI-powered assistance. Fill in
              the details below to get started.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Project Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your project name"
                required
              />
            </div>

            <div>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what your project is about"
                required
              />
            </div>

            <div>
              <label htmlFor="type">Project Type</label>
              <div className="relative mt-1">
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="capitalize"
                >
                  <option value="">Select a project type</option>
                  {PROJECT_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Citation Style Selection - Only show when initiated from Citation Manager */}
            {showCitationStyle && (
              <div>
                <label htmlFor="citationStyle">Citation Style</label>
                <div className="relative mt-1">
                  <select
                    id="citationStyle"
                    name="citationStyle"
                    value={citationStyle}
                    onChange={handleCitationStyleChange}
                    className="capitalize"
                    required
                  >
                    {CITATION_STYLES.map(style => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="dueDate">Due Date (Optional)</label>
              <div className="relative mt-1">
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate || undefined}
                  onChange={handleInputChange}
                  placeholder="dd/mm/yyyy"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              {error && <p className="error-message-plain">{error}</p>}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                text="Cancel"
                variant="secondary"
                onClick={onClose}
                type="button"
                disabled={isSubmitting}
              />
              <Button
                text={
                  isSubmitting
                    ? "Creating..."
                    : showCitationStyle
                      ? "Start Citation"
                      : "Create Project"
                }
                variant="primary"
                type="submit"
                disabled={isSubmitting}
              />
            </div>
          </form>
        </div>
      </Modal>

      {/* Success Message - Only show when not using onProjectCreated callback */}
      {!onProjectCreated && (
        <MessageModal
          isOpen={!!projectId}
          icon={<CheckCircle />}
          title="Project Created Successfully"
          message={
            <span>
              The project <strong>{formData.name}</strong> has been created
              successfully!
            </span>
          }
          submitText="Start Writing"
          onSubmit={() =>
            router.push(`${userRoutes?.project_new}/${projectId}`)
          }
        />
      )}

      {/* Subscription Error Modal */}
      <MessageModal
        isOpen={showSubscribeModal}
        iconStyle="bg-red-100 border-red-50 text-red-500"
        icon={<X />}
        title="Failed to Create Project"
        message={
          subscribeError ||
          "Either you are not subscribed, your subscription has expired, or you have reached your usage limit."
        }
        submitText="Upgrade Plan"
        onSubmit={() => router.push(`${userRoutes?.settings}?tab=billing`)}
        cancelText="Close"
        onCancel={() => setShowSubscribeModal(false)}
      />
    </>
  );
};

export default CreateProjectModal;
