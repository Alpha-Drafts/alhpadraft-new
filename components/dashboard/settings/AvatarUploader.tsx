/* eslint-disable @next/next/no-img-element */
import { User, Camera, X } from "lucide-react";

interface AvatarProps {
  displayImageUrl: string | null;
  selectedFile: File | null;
  isProcessing: boolean;
  onClickChange: () => void;
  onRemove: () => void;
  error?: string | null;
}

export const AvatarUploader: React.FC<AvatarProps> = ({
  displayImageUrl,
  selectedFile,
  isProcessing,
  onClickChange,
  onRemove,
  error,
}) => {
  const isBlob = displayImageUrl?.startsWith("blob:");
  const hasImage = Boolean(displayImageUrl);

  return (
    <div className="mb-6 flex items-center gap-4">
      {/* Avatar ring */}
      <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full border-2 border-[var(--color-border-subtle)] bg-[var(--color-surface-background)]">
        {hasImage ? (
          <img
            src={displayImageUrl!}
            alt={isBlob ? "Profile preview" : "Profile"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-6 w-6 text-[var(--color-text-tertiary)]" />
          </div>
        )}

        {selectedFile && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-0.5 right-0.5 rounded-full bg-[var(--color-surface-container)] p-0.5 shadow-[var(--elevation-1)] hover:bg-[var(--color-surface-background)]"
            disabled={isProcessing}
            aria-label="Remove profile photo selection"
          >
            <X className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div>
        <button
          type="button"
          onClick={onClickChange}
          className="text-body-medium-14 flex items-center text-[var(--color-primary)] transition-[color] duration-150 hover:text-[var(--color-primary-hover)]"
          disabled={isProcessing}
        >
          <Camera className="mr-1.5 h-4 w-4" /> Change Photo
        </button>
        <p className="text-body-regular-12 mt-1 text-[var(--color-text-tertiary)]">
          JPG, PNG or GIF. Max 2MB.
        </p>
        {error && (
          <p className="text-body-regular-12 mt-1 text-[var(--color-error)]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
