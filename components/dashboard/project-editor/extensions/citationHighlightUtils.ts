import type { Editor } from "@tiptap/react";
import type {
  AlignmentIssueItem,
  CitationIssueProps,
  PlagiarismIssueItem,
} from "@/types";
import { buildTextIndex, charPosToPmPos } from "./aiHighlightUtils";

/**
 * Apply citation issue highlights to the editor content.
 * Uses the normalized text index so matches are consistent with the API.
 */
export const applyCitationHighlights = (
  editor: Editor,
  issues: CitationIssueProps[],
) => {
  // First clear any existing highlights
  clearCitationHighlights(editor);

  const { fullText, entries, charMap } = buildTextIndex(editor);
  console.info("Document length:", fullText.length);

  issues.forEach((issue, index) => {
    let isHighlighted = false;

    if (issue.text && issue.text.length > 10) {
      const searchIndex = fullText.indexOf(issue.text);

      if (searchIndex >= 0) {
        const foundEnd = searchIndex + issue.text.length;
        console.info(
          `Found issue #${index} text at character position ${searchIndex}-${foundEnd}`,
        );

        const fromPos = charPosToPmPos(entries, searchIndex, charMap);
        const toPos = charPosToPmPos(entries, foundEnd, charMap);

        if (fromPos !== null && toPos !== null) {
          editor.commands.setTextSelection({
            from: fromPos,
            to: toPos,
          });

          const severityClass = getSeverityClass(issue.severity);
          editor
            .chain()
            .setMark("highlight", {
              class: severityClass,
              "data-issue-type": issue.type,
              "data-severity": issue.severity,
              "data-confidence": issue.confidenceScore,
            })
            .run();
          isHighlighted = true;
        }
      } else {
        console.error(`Could not find text for issue #${index} in document`);
      }
    }

    if (!isHighlighted) {
      console.warn(`Could not highlight issue #${index}`);
    }
  });

  // Deselect without scrolling
  editor.commands.blur();
};

/**
 * Remove all citation/plagiarism/alignment highlights from the editor
 */
export const clearCitationHighlights = (editor: Editor) => {
  try {
    editor.chain().selectAll().run();
    editor.chain().unsetMark("editedMark").run();
    editor.chain().unsetMark("highlight").run();
    editor.commands.blur();
  } catch (error) {
    console.error("Error clearing citation highlights:", error);
  }
};

/** Alias for clearing all integrity-issue highlights (plagiarism + alignment). */
export const clearAllIssueHighlights = clearCitationHighlights;

/**
 * Apply plagiarism highlights using character offsets from Winston.
 * Uses the normalized text index so that positions after paragraph boundaries
 * are not shifted.
 */
export const applyPlagiarismHighlights = (
  editor: Editor,
  issues: PlagiarismIssueItem[],
) => {
  if (!issues?.length) return;
  const { entries, charMap } = buildTextIndex(editor);
  issues.forEach((issue, _index) => {
    const fromPos = charPosToPmPos(entries, issue.startIndex, charMap);
    const toPos = charPosToPmPos(entries, issue.endIndex, charMap);
    if (fromPos !== null && toPos !== null) {
      editor.commands.setTextSelection({ from: fromPos, to: toPos });
      editor
        .chain()
        .setMark("highlight", {
          class: "plagiarism-issue-high",
          "data-issue-type": "plagiarism",
          "data-severity": "high",
          "data-score": String(issue.score),
        })
        .run();
    }
  });
  editor.commands.blur();
};

/**
 * Apply alignment issue highlights (by text search).
 * Uses the normalized text index so that text spanning paragraph boundaries
 * is found correctly.
 */
export const applyAlignmentHighlights = (
  editor: Editor,
  issues: AlignmentIssueItem[],
) => {
  if (!issues?.length) return;
  const { fullText, entries, charMap } = buildTextIndex(editor);
  issues.forEach((issue, _index) => {
    if (!issue.text || issue.text.length < 10) return;
    const searchIndex = fullText.indexOf(issue.text);
    if (searchIndex >= 0) {
      const foundEnd = searchIndex + issue.text.length;
      const fromPos = charPosToPmPos(entries, searchIndex, charMap);
      const toPos = charPosToPmPos(entries, foundEnd, charMap);
      if (fromPos !== null && toPos !== null) {
        editor.commands.setTextSelection({ from: fromPos, to: toPos });
        const severityClass =
          issue.severity === "high"
            ? "alignment-issue-high"
            : issue.severity === "medium"
              ? "alignment-issue-medium"
              : "alignment-issue-low";
        editor
          .chain()
          .setMark("highlight", {
            class: severityClass,
            "data-issue-type": "alignment",
            "data-severity": issue.severity,
            "data-confidence": issue.confidenceScore,
          })
          .run();
      }
    }
  });
  editor.commands.blur();
};

/**
 * Get the CSS class for different severity levels
 */
const getSeverityClass = (severity: string): string => {
  switch (severity) {
    case "high":
      return "citation-issue-high";
    case "medium":
      return "citation-issue-medium";
    case "low":
      return "citation-issue-low";
    default:
      return "citation-issue-default";
  }
};
