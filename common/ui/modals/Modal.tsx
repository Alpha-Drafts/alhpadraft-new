import React, { useEffect, useState, useRef, useCallback } from "react";
import { ModalProps } from "@/types";
import { CircleX } from "lucide-react";

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
 * @param {string} wrapperClassName - Additional CSS classes for the modal wrapper to control size etc.
 * @param {string} ariaLabel - Accessible label for the modal dialog
 */
export const Modal = ({
  isOpen,
  onCancel,
  closeOnOverlayClick = true,
  children,
  hideCloseButton = false,
  wrapperClassName = "",
  ariaLabel,
}: ModalProps) => {
  const ANIMATION_DURATION = 500; // ms, should match your CSS duration

  const [visible, setVisible] = useState(isOpen);
  const [animateOut, setAnimateOut] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setAnimateOut(false);
      setAnimateIn(false);
      // Trigger animateIn after mount
      const tick = setTimeout(() => {
        setAnimateIn(true);
      }, 20); // 1 frame delay
      return () => clearTimeout(tick);
    } else if (visible) {
      setAnimateOut(true);
      setAnimateIn(false);
      const timeout = setTimeout(() => {
        setVisible(false);
        setAnimateOut(false);
      }, ANIMATION_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, visible]);

  // Handle Escape key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && onCancel) {
        onCancel();
      }
    },
    [onCancel],
  );

  useEffect(() => {
    if (visible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [visible, handleKeyDown]);

  // Lock body scroll when modal is open.
  // Use a document-level counter so concurrent modals don't prematurely restore
  // overflow. Defer unlock until the close animation finishes to avoid scroll
  // jank mid-animation.
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (visible) {
      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
        unlockTimerRef.current = null;
      }
      const count = Number(document.body.dataset.modalCount ?? 0);
      document.body.dataset.modalCount = String(count + 1);
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        // Delay unlock until close animation completes
        unlockTimerRef.current = setTimeout(() => {
          const next = Number(document.body.dataset.modalCount ?? 1) - 1;
          document.body.dataset.modalCount = String(next);
          if (next <= 0) {
            document.body.removeAttribute("data-modal-count");
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
          }
        }, ANIMATION_DURATION);
      };
    }
  }, [visible]);

  // Focus management: save previous focus and focus modal on open
  useEffect(() => {
    if (visible && isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the modal content after animation starts
      const focusTimeout = setTimeout(() => {
        modalRef.current?.focus();
      }, 50);
      return () => clearTimeout(focusTimeout);
    } else if (!isOpen && previousFocusRef.current) {
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [visible, isOpen]);

  // Handler for clicking outside the modal to close it
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget && onCancel) {
      onCancel();
    }
  };

  // Early return if modal should not be shown
  if (!visible) return null;

  return (
    // Overlay backdrop with click-outside handling
    <div
      className={`modal-overlay ${animateIn && !animateOut ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`modal-wrapper ${wrapperClassName} ${animateIn && !animateOut ? "mt-7 opacity-100" : "opacity-0"}`}
        tabIndex={-1}
      >
        {/* Modal content */}
        <div className="modal-content">
          {onCancel && !hideCloseButton && (
            <div>
              <button
                type="button"
                onClick={onCancel}
                className="modal_close-button"
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                <CircleX className="icon" />
              </button>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};
