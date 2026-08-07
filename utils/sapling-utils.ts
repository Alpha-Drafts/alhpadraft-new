import { SaplingBrowser } from "./sapling-browser";
import { SaplingEditSummary } from "@/types/sapling";

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

/**
 * Utility functions for working with Sapling grammar and spelling suggestions
 */
export const SaplingUtils = {
  /**
   * Trigger a manual check for grammar and spelling
   * @param element Optional element to check. If not provided, tries to find the first ProseMirror editor
   * @returns Promise that resolves to true if successful, false otherwise
   */
  checkGrammar: async (element?: Element | null): Promise<boolean> => {
    if (!isBrowser) return false;

    try {
      // If no element is provided, try to find the first ProseMirror editor
      const targetElement = element || document.querySelector(".ProseMirror");

      if (!targetElement) {
        console.error("No element provided and no ProseMirror editor found");
        return false;
      }

      return await SaplingBrowser.triggerCheck(targetElement);
    } catch (error) {
      console.error("Failed to trigger grammar check:", error);
      return false;
    }
  },

  /**
   * Get a summary of edits suggested by Sapling
   * This processes the raw edits into a more user-friendly format
   */
  getEditSummary: async (): Promise<SaplingEditSummary> => {
    if (!isBrowser) return { count: 0, edits: [] };

    try {
      const edits = await SaplingBrowser.getEdits();
      const summaryEdits = edits.map(edit => ({
        id: edit.id,
        description: edit.rule.description,
        original: edit.sentence.substring(edit.start, edit.end),
        replacement: edit.replacement,
      }));

      return {
        count: summaryEdits.length,
        edits: summaryEdits,
      };
    } catch (error) {
      console.error("Failed to get Sapling edit summary:", error);
      return { count: 0, edits: [] };
    }
  },

  /**
   * Get all available edits/suggestions from Sapling
   */
  getEdits: async () => {
    if (!isBrowser) return [];

    try {
      return await SaplingBrowser.getEdits();
    } catch (error) {
      console.error("Failed to get Sapling edits:", error);
      return [];
    }
  },

  /**
   * Accept a specific edit by ID
   * @param editId The ID of the edit to accept
   */
  acceptEdit: (editId: string) => {
    if (!isBrowser) return;

    try {
      // Use the browser-safe wrapper
      SaplingBrowser.acceptEdit(editId);
    } catch (error) {
      console.error(`Failed to accept Sapling edit ${editId}:`, error);
    }
  },

  /**
   * Reject a specific edit by ID
   * @param editId The ID of the edit to reject
   */
  rejectEdit: (editId: string) => {
    if (!isBrowser) return;

    try {
      // Use the browser-safe wrapper
      SaplingBrowser.rejectEdit(editId);
    } catch (error) {
      console.error(`Failed to reject Sapling edit ${editId}:`, error);
    }
  },
};
