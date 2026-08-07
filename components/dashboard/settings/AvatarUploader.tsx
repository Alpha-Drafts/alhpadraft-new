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
    <div className="mb-6 flex items-center space-x-4">
      {/* Avatar Preview */}
      <div className="relative h-[70px] w-[70px] overflow-hidden rounded-full bg-gray-100">
        {hasImage ? (
          isBlob ? (
            // Local preview
            <img
              src={displayImageUrl!}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={displayImageUrl!}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          )
        ) : (
          // Fallback (no avatar)
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-6 w-6 text-gray-400" />
          </div>
        )}

        {/* Remove button for selected file */}
        {selectedFile && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 rounded-full bg-white p-1 hover:bg-gray-100"
            disabled={isProcessing}
            aria-label="Remove profile photo selection"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Change Photo Action */}
      <div>
        <button
          type="button"
          onClick={onClickChange}
          className="text-body-medium-14 flex items-center text-black hover:text-gray-900"
          disabled={isProcessing}
        >
          <Camera className="mr-1 h-4 w-4" /> Change Photo
        </button>
        <p className="text-body-regular-14 mt-1 text-gray-500">
          JPG, PNG or GIF. Max size 2MB.
        </p>
        {error && <p className="text-body-regular-12 text-red-600">{error}</p>}
      </div>
    </div>
  );
};
