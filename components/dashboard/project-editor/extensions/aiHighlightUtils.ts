import type { Editor } from "@tiptap/react";
import { getScoreColor } from "@/utils";
import { AI_THRESHOLD } from "@/constants";

interface SentenceScore {
  score: number;
  sentence: string;
}

interface TextNodeEntry {
  text: string;
  pmStart: number; // ProseMirror position of the start of this text node
  charStart: number; // character offset in the flat concatenated string
}

/**
 * Build a flat, whitespace-normalized index of the document text.
 *
 * The resulting `fullText` mirrors the normalization applied before sending text
 * to external APIs: `editor.getText().replace(/\s+/g, " ").trim()`.
 *
 * A `charMap` array provides O(1) mapping from any character position in
 * `fullText` back to the corresponding ProseMirror document position.
 *
 * Phase 1 – walks the ProseMirror tree to collect raw characters and their PM
 *   positions. Hard breaks and other non-text leaf nodes are emitted as a space
 *   so they participate in the subsequent collapse.
 * Phase 2 – collapses consecutive whitespace into single spaces and trims,
 *   exactly like the API normalization.
 */
export function buildTextIndex(editor: Editor): {
  fullText: string;
  entries: TextNodeEntry[];
  charMap: number[];
} {
  // Phase 1: raw text with per-character PM position mapping
  let rawText = "";
  const rawCharMap: number[] = [];

  editor.state.doc.descendants((node, pos, _parent, index) => {
    if (node.isBlock) {
      // Space between sibling blocks to mirror \n from getText()
      if (
        index > 0 &&
        rawText.length > 0 &&
        rawText[rawText.length - 1] !== " "
      ) {
        rawText += " ";
        rawCharMap.push(pos);
      }
      return true; // descend into children
    }
    if (node.isText) {
      const text = node.text!;
      for (let i = 0; i < text.length; i++) {
        rawText += text[i];
        rawCharMap.push(pos + i);
      }
    } else if (node.isLeaf) {
      // hardBreak, images, etc. — emit as whitespace so it gets collapsed
      rawText += " ";
      rawCharMap.push(pos);
    }
    return true;
  });

  // Phase 2: collapse whitespace (same as .replace(/\s+/g, " ").trim())
  let fullText = "";
  const charMap: number[] = [];
  let prevWasSpace = true; // treat start as space so leading whitespace is trimmed

  for (let i = 0; i < rawText.length; i++) {
    const isWs = /\s/.test(rawText[i]);
    if (isWs) {
      if (!prevWasSpace) {
        fullText += " ";
        charMap.push(rawCharMap[i]);
        prevWasSpace = true;
      }
    } else {
      fullText += rawText[i];
      charMap.push(rawCharMap[i]);
      prevWasSpace = false;
    }
  }

  // Trim trailing space
  if (fullText.endsWith(" ")) {
    fullText = fullText.slice(0, -1);
    charMap.pop();
  }

  // Build legacy entries for backward compatibility
  const entries: TextNodeEntry[] = [];

  return { fullText, entries, charMap };
}

/**
 * Map a character position in the normalized `fullText` to a ProseMirror
 * document position. When `charMap` is provided (from `buildTextIndex`) it is
 * used for O(1) lookup; otherwise falls back to the legacy entry-scanning path.
 */
export function charPosToPmPos(
  entries: TextNodeEntry[],
  charPos: number,
  charMap?: number[],
): number | null {
  if (charMap) {
    if (charPos >= 0 && charPos < charMap.length) {
      return charMap[charPos];
    }
    // charPos === length means "end of text" — one past the last character
    if (charPos === charMap.length && charMap.length > 0) {
      return charMap[charMap.length - 1] + 1;
    }
    return null;
  }
  // Legacy fallback
  for (const entry of entries) {
    const charEnd = entry.charStart + entry.text.length;
    if (charPos >= entry.charStart && charPos <= charEnd) {
      return entry.pmStart + (charPos - entry.charStart);
    }
  }
  return null;
}

export const applySentenceHighlights = (
  editor: Editor | null,
  sentenceScores: SentenceScore[],
  threshold: typeof AI_THRESHOLD,
) => {
  if (!editor || !sentenceScores) {
    return;
  }

  // Filter sentences that exceed the threshold
  const sentencesToHighlight = sentenceScores
    .filter(sentenceData => sentenceData.score > threshold)
    .map(sentenceData => ({
      sentence: sentenceData.sentence.trim(),
      score: sentenceData.score,
    }))
    .sort((a, b) => b.sentence.length - a.sentence.length); // longer first to avoid partial matches

  if (sentencesToHighlight.length === 0) {
    return;
  }

  // Build a flat text index across all text nodes (handles bold/italic splits and
  // sentences that cross paragraph boundaries)
  const { fullText, entries, charMap } = buildTextIndex(editor);

  // Find all matches in the flat text string
  const matches: Array<{ charFrom: number; charTo: number; score: number }> =
    [];

  sentencesToHighlight.forEach(({ sentence, score }) => {
    let searchStart = 0;
    while (searchStart < fullText.length) {
      const idx = fullText.indexOf(sentence, searchStart);
      if (idx === -1) break;

      const charTo = idx + sentence.length;

      const hasOverlap = matches.some(
        match =>
          (idx >= match.charFrom && idx < match.charTo) ||
          (charTo > match.charFrom && charTo <= match.charTo) ||
          (idx <= match.charFrom && charTo >= match.charTo),
      );

      if (!hasOverlap) {
        matches.push({ charFrom: idx, charTo, score });
      }

      searchStart = charTo;
    }
  });

  // Sort by position, then apply in reverse to avoid position shifts
  matches.sort((a, b) => a.charFrom - b.charFrom);

  for (let i = matches.length - 1; i >= 0; i--) {
    const { charFrom, charTo, score } = matches[i];

    const from = charPosToPmPos(entries, charFrom, charMap);
    const to = charPosToPmPos(entries, charTo, charMap);
    if (from === null || to === null) continue;

    const color = getScoreColor(score / 100);

    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    let bgColor;
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      bgColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
    } else {
      bgColor = color + "66";
    }

    editor
      .chain()
      .setTextSelection({ from, to })
      .setAIHighlight({ score, bgColor })
      .run();
  }

  // Deselect without scrolling
  editor.commands.blur();
};

export const clearAIHighlights = (editor: Editor | null) => {
  if (!editor) return;

  editor.commands.selectAll();
  try {
    editor.chain().unsetMark("editedMark").run();
  } catch {
    /* not registered */
  }
  editor.commands.unsetAIHighlight();
  editor.commands.blur();
};
