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
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Project
            </h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-700">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">{projectName}</span>?
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
