import { Mark, mergeAttributes } from "@tiptap/core";

export interface AIHighlightOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiHighlight: {
      /**
       * Set an AI highlight mark
       */
      setAIHighlight: (attributes?: {
        score?: number;
        bgColor?: string;
      }) => ReturnType;
      /**
       * Toggle an AI highlight mark
       */
      toggleAIHighlight: (attributes?: {
        score?: number;
        bgColor?: string;
      }) => ReturnType;
      /**
       * Unset an AI highlight mark
       */
      unsetAIHighlight: () => ReturnType;
    };
  }
}

export const AIHighlight = Mark.create<AIHighlightOptions>({
  name: "aiHighlight",

  inclusive: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      score: {
        default: null,
        parseHTML: element => element.getAttribute("data-score"),
        renderHTML: attributes => {
          if (!attributes.score) {
            return {};
          }
          return {
            "data-score": attributes.score,
          };
        },
      },
      bgColor: {
        default: null,
        parseHTML: element => element.getAttribute("data-bg-color"),
        renderHTML: attributes => {
          if (!attributes.bgColor) {
            return {};
          }
          return {
            "data-bg-color": attributes.bgColor,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mark[data-ai-highlight]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // The score is passed directly in HTMLAttributes
    const score = HTMLAttributes.score
      ? parseFloat(String(HTMLAttributes.score))
      : 0;
    // Scale opacity: score is 0-100, map to a range of 0.2-0.8
    const opacity = Math.min(0.8, 0.2 + (score / 100) * 0.6);

    // Use the bgColor if provided, otherwise fallback to the old color
    const backgroundColor = HTMLAttributes.bgColor
      ? `${HTMLAttributes.bgColor}`
      : `rgba(239, 68, 68, ${opacity})`;

    return [
      "mark",
      mergeAttributes(
        this.options.HTMLAttributes,
        // Pass original attributes, which includes the data-score from addAttributes' renderHTML
        HTMLAttributes,
        {
          "data-ai-highlight": "",
          class: "ai-highlight",
          style: `background-color: ${backgroundColor}; color: inherit; padding: 1px 2px; border-radius: 2px; position: relative;`,
        },
      ),
      0,
    ];
  },

  addCommands() {
    return {
      setAIHighlight:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      toggleAIHighlight:
        attributes =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetAIHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
