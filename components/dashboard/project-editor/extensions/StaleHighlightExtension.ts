import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ReplaceStep } from "@tiptap/pm/transform";
import type { Node as PMNode } from "@tiptap/pm/model";

const EDITED_META = "applyEditedMark";
const pluginKey = new PluginKey("editedMarkPlugin");

/**
 * Find the full contiguous span of an aiHighlight or highlight mark
 * in `doc` that contains (or is directly adjacent to) `insertPos`.
 *
 * Returns the range and the original plain text, or null if the position
 * is not inside / at the boundary of any highlight.
 */
function findHighlightMarkExtent(
  doc: PMNode,
  insertPos: number,
): { from: number; to: number; text: string } | null {
  try {
    const safePos = Math.max(1, Math.min(insertPos, doc.content.size - 1));
    const $pos = doc.resolve(safePos);

    // Determine the highlight mark type at the cursor.
    // Check both the node immediately before and after the cursor position.
    let markTypeName: string | null = null;
    for (const node of [$pos.nodeBefore, $pos.nodeAfter]) {
      if (!node?.isText) continue;
      const m = node.marks.find(
        m => m.type.name === "aiHighlight" || m.type.name === "highlight",
      );
      if (m) {
        markTypeName = m.type.name;
        break;
      }
    }
    if (!markTypeName) return null;

    const parent = $pos.parent;
    const parentStart = $pos.start();
    const hasTargetMark = (node: PMNode) =>
      node.marks.some(m => m.type.name === markTypeName);

    // Walk the parent block's children to find the contiguous range of
    // this mark type that includes insertPos.
    let offset = 0;
    let currentRangeStart: number | null = null;

    for (let i = 0; i < parent.childCount; i++) {
      const child = parent.child(i);
      const childFrom = parentStart + offset;

      if (hasTargetMark(child)) {
        if (currentRangeStart === null) currentRangeStart = childFrom;
      } else {
        if (currentRangeStart !== null) {
          // End of a contiguous marked range — check if insertPos is in it.
          if (insertPos >= currentRangeStart && insertPos <= childFrom) {
            const raw = doc.textBetween(currentRangeStart, childFrom, " ");
            const text = raw.length > 150 ? raw.slice(0, 150) + "…" : raw;
            return { from: currentRangeStart, to: childFrom, text };
          }
          currentRangeStart = null;
        }
      }

      offset += child.nodeSize;
    }

    // Handle the case where the mark extends to the end of the parent.
    if (currentRangeStart !== null) {
      const rangeEnd = parentStart + offset;
      if (insertPos >= currentRangeStart && insertPos <= rangeEnd) {
        const raw = doc.textBetween(currentRangeStart, rangeEnd, " ");
        const text = raw.length > 150 ? raw.slice(0, 150) + "…" : raw;
        return { from: currentRangeStart, to: rangeEnd, text };
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Watches for text insertions within highlighted regions and applies
 * EditedMark to the ENTIRE flagged span that was touched, so the user
 * can see at a glance which annotated regions they have edited.
 *
 * The mark carries the original flagged text as `data-original-text` so
 * hovering shows a tooltip with what the issue originally said.
 *
 * Original issue highlights on UNTOUCHED text are left completely unchanged.
 * EditedMark is cleared when a fresh integrity check runs.
 */
export const StaleHighlightExtension = Extension.create({
  name: "staleHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pluginKey,

        appendTransaction(transactions, oldState, newState) {
          // Only react to real insertions. Ignore deletions-only, mark-only,
          // selection-only, and our own emitted transactions.
          const hasInsertion = transactions.some(
            tr =>
              !tr.getMeta(EDITED_META) &&
              tr.steps.some(
                step => step instanceof ReplaceStep && step.slice.size > 0,
              ),
          );
          if (!hasInsertion) return null;

          const editedMarkType = newState.schema.marks.editedMark;
          if (!editedMarkType) return null;

          const newTr = newState.tr;
          newTr.setMeta(EDITED_META, true);
          // Don't create a separate undo step — EditedMark should undo together
          // with the text change that triggered it.
          newTr.setMeta("addToHistory", false);
          let changed = false;

          for (const tr of transactions) {
            if (tr.getMeta(EDITED_META)) continue;

            for (const step of tr.steps) {
              if (!(step instanceof ReplaceStep)) continue;
              if (step.slice.size === 0) continue;

              // If the insertion point already touches an EditedMark in the
              // OLD state, the user is typing inside an already-marked region.
              // inclusive: true on EditedMark automatically extends the mark
              // to new characters — no need to re-apply, and doing so would
              // overwrite the stored originalText with already-edited content.
              try {
                const safeInsert = Math.max(
                  1,
                  Math.min(step.from, oldState.doc.content.size - 1),
                );
                const $insert = oldState.doc.resolve(safeInsert);
                const alreadyEdited = [
                  $insert.nodeBefore,
                  $insert.nodeAfter,
                ].some(n => n?.marks.some(m => m.type.name === "editedMark"));
                if (alreadyEdited) continue;
              } catch {
                // fall through and attempt normally
              }

              // Find the full contiguous highlight span that contains the
              // insertion point in the OLD document.
              const extent = findHighlightMarkExtent(oldState.doc, step.from);
              if (!extent) continue;

              // Map the old-state span into new-state coordinates.
              // bias -1 for the start (stay before the insertion) and
              // bias +1 for the end (stay after) to include the new chars.
              const newFrom = tr.mapping.map(extent.from, -1);
              const newTo = tr.mapping.map(extent.to, 1);

              if (newFrom >= newTo) continue;
              if (newFrom < 1 || newTo > newState.doc.content.size) continue;

              newTr.addMark(
                newFrom,
                newTo,
                editedMarkType.create({ originalText: extent.text }),
              );
              changed = true;
            }
          }

          return changed ? newTr : null;
        },
      }),
    ];
  },
});
