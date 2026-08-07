import { Mark, mergeAttributes } from "@tiptap/core";
import type { Editor } from "@tiptap/react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    editedMark: {
      setEditedMark: () => ReturnType;
      unsetEditedMark: () => ReturnType;
    };
  }
}

/**
 * A gray tinted mark applied automatically to any flagged span the user edits.
 * Hovering over it shows the original flagged text in a tooltip.
 * Cleared automatically when a fresh integrity check runs.
 */
export const EditedMark = Mark.create({
  name: "editedMark",

  // inclusive: true — continuing to type inside the edited region keeps the mark.
  inclusive: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      originalText: {
        default: null,
        parseHTML: element => element.getAttribute("data-original-text"),
        renderHTML: attributes => {
          if (!attributes.originalText) return {};
          return { "data-original-text": attributes.originalText };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-edited]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-edited": "",
        class: "edited-mark",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setEditedMark:
        () =>
        ({ commands }) =>
          commands.setMark(this.name),
      unsetEditedMark:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

/**
 * Removes all EditedMark spans from the editor.
 * Called at the start of every integrity check run.
 */
export const clearEditedMarks = (editor: Editor | null) => {
  if (!editor) return;
  try {
    editor.chain().selectAll().unsetMark("editedMark").blur().run();
  } catch {
    // no-op if editedMark is not registered in this editor instance
  }
};
