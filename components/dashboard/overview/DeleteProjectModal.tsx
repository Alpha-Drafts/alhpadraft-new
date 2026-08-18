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
      {/* Glass backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={onCancel}
      />

      {/* Modal — Premium glass */}
      <div
        className="relative w-full max-w-md overflow-hidden"
        style={{
          borderRadius: "var(--radius-modal)",
          background: "var(--glass-bg-heavy)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--elevation-4)",
        }}
      >
        {/* Red gradient accent at top */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, var(--color-error), var(--color-error-container), transparent)" }} />

        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "var(--color-error-container)" }}>
              <Trash2 className="h-5 w-5" style={{ color: "var(--color-error)" }} />
            </div>
            <div>
              <h3
                className="font-semibold text-[var(--color-text-primary)]"
                style={{ fontSize: "1.125rem", lineHeight: "24px" }}
              >
                Delete Project
              </h3>
              <p className="text-[var(--color-text-secondary)]" style={{ fontSize: "0.875rem", lineHeight: "20px" }}>
                This action cannot be undone.
              </p>
            </div>
          </div>

          <p className="mb-6 text-[var(--color-text-primary)]" style={{ fontSize: "0.875rem", lineHeight: "24px" }}>
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
              className="!bg-[var(--color-error)] !text-white hover:!bg-[var(--color-on-error-container)]"
              icon={<Trash2 className="h-4 w-4" />}
              iconPosition="left"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;
