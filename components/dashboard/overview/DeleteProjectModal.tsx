import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/common";

interface DeleteProjectModalProps {
  isOpen: boolean;
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  projectName,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] p-6 shadow-[var(--elevation-3)]"
        style={{ borderRadius: "var(--radius-modal)" }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-error-container)]">
            <Trash2 className="h-5 w-5 text-[var(--color-error)]" />
          </div>
          <div>
            <h3
              className="font-semibold text-[var(--color-text-primary)]"
              style={{ fontSize: "1.125rem", lineHeight: "24px" }}
            >
              Delete Project
            </h3>
            <p className="text-body-regular-14 text-[var(--color-text-secondary)]">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-body-regular-14 mb-6 text-[var(--color-text-primary)]">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{projectName}</span>?
          All content and check results will be permanently removed.
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="plain" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            loading={isDeleting}
            className="!bg-red-600 !text-white hover:!bg-red-700"
            icon={<Trash2 className="h-4 w-4" />}
            iconPosition="left"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;
