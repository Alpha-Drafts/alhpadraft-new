import { useEffect, useRef, useCallback } from "react";

interface UseDebounceOptions {
  delay?: number; // milliseconds to wait before executing
}

interface UseDebounceReturn {
  trigger: () => void;
  cancel: () => void;
}

/**
 * Hook to debounce a callback function
 * Useful for auto-saving after user stops typing
 *
 * @example
 * const { trigger } = useDebounce(saveDraft, { delay: 2000 });
 *
 * // In editor onUpdate:
 * trigger(); // Reset timer on each keystroke
 */
export const useDebounce = <
  T extends () => void | Promise<void> | Promise<unknown>,
>(
  callback: T,
  options: UseDebounceOptions = {},
): UseDebounceReturn => {
  const { delay = 500 } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<T>(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cancel function - clears the pending timeout
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Trigger function - clears existing timeout and sets new one
  const trigger = useCallback(() => {
    // Clear existing timeout to reset the timer
    cancel();

    // Set new timeout - callback executes after delay of inactivity
    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);
  }, [delay, cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { trigger, cancel };
};
