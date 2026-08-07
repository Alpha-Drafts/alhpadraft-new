import React from "react";
import { Modal } from "./Modal";

export interface ProcessingModalProps {
  isOpen: boolean;
  icon: React.ReactNode;
  iconStyle?: string;
  title: string;
  subtitle?: string;
  progress?: number;
  progressMessage?: string;
  footer?: React.ReactNode;
  onCancel?: () => void;
  closeOnOverlayClick?: boolean;
}

/**
 * A Modal component that displays a popup dialog with customizable content and actions.
 * @param {boolean} isOpen - Controls the visibility of the modal
 * @param {React.ReactNode} icon - Icon element to display at the top of the modal
 * @param {string} iconStyle - Additional CSS classes for the icon container
 * @param {string} title - The title text of the modal
 * @param {string} subtitle - The subtitle text of the modal (optional)
 * @param {number} progress - Progress percentage (0-100) for the modal's operation (optional)
 * @param {string} progressMessage - Additional message to display alongside the progress (optional)
 * @param {React.ReactNode} footer - Optional footer content, can be used to customize the bottom section of the modal
 * @param {Function} onCancel - Handler for cancel action
 * @param {boolean} closeOnOverlayClick - Determines if the modal should close when clicking on the overlay
 */

export const ProcessingModal = ({
  isOpen,
  icon,
  iconStyle,
  title,
  subtitle,
  progress,
  progressMessage,
  footer,
  onCancel,
  closeOnOverlayClick = true,
}: ProcessingModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onCancel={onCancel}
      closeOnOverlayClick={closeOnOverlayClick}
    >
      <div className="modal-content_container px-10 py-16">
        <div className="mx-auto max-w-[400px]">
          <div className="modal-content_container-body">
            {/* Icon section */}
            <span
              className={`mx-auto mb-6 flex items-center justify-center rounded-2xl ${iconStyle}`}
              style={{
                width: 56,
                height: 56,
                background:
                  "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)",
              }}
            >
              {icon}
            </span>
            {/* Title section */}
            <h3 className="modal-content_title">{title}</h3>
            {/* Subtitle section */}
            {subtitle && <p className="modal-content_sub-title">{subtitle}</p>}
          </div>

          {/* Progress bar and message */}
          {typeof progress === "number" && (
            <div className="mt-10">
              {/* <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs text-gray-500">{progress}%</span>
              </div> */}
              <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progressMessage && (
                <div className="mt-4 text-center text-xs text-gray-500">
                  {progressMessage}
                </div>
              )}
            </div>
          )}

          {/* Optional footer */}
          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </Modal>
  );
};
