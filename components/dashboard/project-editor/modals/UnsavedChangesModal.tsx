// This component provides a modal dialog to handle unsaved changes
// when user tries to close the browser tab or navigate away

import React from "react";
import { AlertTriangle, Save, X } from "lucide-react";
import { Button } from "@/common";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
  isSaving = false,
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Unsaved Changes
            </h3>
            <p className="text-sm text-gray-600">
              You have unsaved changes that will be lost.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700">
            Would you like to save your changes before leaving? Your work has
            been automatically cached, but saving will ensure it&apos;s stored
            securely.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="plain" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={onDiscard}
            disabled={isSaving}
            icon={<X className="h-4 w-4" />}
            iconPosition="left"
          >
            Don&apos;t Save
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            loading={isSaving}
            icon={<Save className="h-4 w-4" />}
            iconPosition="left"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
