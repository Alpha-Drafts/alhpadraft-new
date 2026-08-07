import React from "react";
import { MessageModalProps } from "@/types";
import { Button } from "../Button";
import { Modal } from "./Modal";

/**
 * A Modal component that displays a popup dialog with customizable content and actions.
 * @param {boolean} isOpen - Controls the visibility of the modal
 * @param {React.ReactNode} icon - Icon element to display at the top of the modal
 * @param {string} iconStyle - Additional CSS classes for the icon container
 * @param {string} title - The title text of the modal
 * @param {string} message - The main content/message of the modal
 * @param {string} submitText - Text for the submit/confirm button
 * @param {Function} onSubmit - Handler for submit/confirm action
 * @param {string} cancelText - Text for the cancel button (optional)
 * @param {Function} onCancel - Handler for cancel action (optional)
 * @param {string} className - Additional CSS classes
 */

export const MessageModal = ({
  isOpen,
  icon,
  iconStyle,
  title,
  message,
  submitText,
  onSubmit,
  cancelText,
  onCancel,
  isProcessing = false,
  closeOnOverlayClick = true,
  hideCloseButton = false,
}: MessageModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onCancel={hideCloseButton ? undefined : onCancel}
      closeOnOverlayClick={closeOnOverlayClick}
    >
      <div className="modal-content_container">
        <div className="modal-content_container-body">
          {/* Icon section */}
          <span className={`modal-content_icon-wrapper ${iconStyle}`}>
            {icon}
          </span>
          {/* Title section */}
          <h3 className="modal-content_title">{title}</h3>
          {/* Message section */}
          <p className="modal-content_sub-title">{message}</p>
        </div>

        {/* Modal footer with action buttons */}
        <div className="modal-content_button-wrapper">
          {/* Submit/confirm button */}
          {submitText && onSubmit && (
            <Button
              text={submitText}
              onClick={onSubmit}
              disabled={isProcessing}
            />
          )}

          {/* Optional cancel button */}
          {cancelText && onCancel && (
            <Button
              text={cancelText}
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
