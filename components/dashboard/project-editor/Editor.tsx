import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { MessageModal } from "@/common";
import {
  Bold,
  Italic,
  Code2,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo2,
  Redo2,
  Text,
  Minus,
  X,
  Braces,
  Search,
  ChevronUp,
  ChevronDown,
  History,
  RemoveFormatting,
  Eraser,
  Loader2,
} from "lucide-react";
import count from "text-count";
import readingTime from "reading-time";
import { useClaims, useProject } from "@/context";
import { useAutoSave, useDebounce, useProjects } from "@/hooks";
import { API_BASE_URL } from "@/constants";
import { apiClient } from "@/utils";
import { AIHighlight } from "./extensions/aiHighlight";
import { EditedMark } from "./extensions/EditedMark";
import { StaleHighlightExtension } from "./extensions/StaleHighlightExtension";
import { Tooltip } from "./Tooltip";
import { DefaultFooter } from "./footers";
import { usePathname } from "next/navigation";

/* ── Helpers ─────────────────────────────────────────────────────── */

const getModKey = () =>
  typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent)
    ? "⌘"
    : "Ctrl";

function formatIssueType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/* ── Snapshot helpers ────────────────────────────────────────────── */

interface Snapshot {
  timestamp: number;
  content: string;
  label: string;
}

const MAX_SNAPSHOTS = 5;

function snapshotKey(projectId: string) {
  return `editor-snapshots-${projectId}`;
}

function getSnapshots(projectId: string): Snapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(snapshotKey(projectId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSnapshot(projectId: string, content: string, label: string) {
  const snaps = getSnapshots(projectId);
  snaps.unshift({ timestamp: Date.now(), content, label });
  if (snaps.length > MAX_SNAPSHOTS) snaps.length = MAX_SNAPSHOTS;
  sessionStorage.setItem(snapshotKey(projectId), JSON.stringify(snaps));
  return snaps;
}

/* ── Search helpers ──────────────────────────────────────────────── */

function findSearchMatches(
  editor: Editor,
  term: string,
): Array<{ from: number; to: number }> {
  if (!term) return [];
  const matches: Array<{ from: number; to: number }> = [];
  const lowerTerm = term.toLowerCase();

  editor.state.doc.descendants((node, pos) => {
    if (node.isText) {
      const text = node.text!.toLowerCase();
      let start = 0;
      while (start < text.length) {
        const idx = text.indexOf(lowerTerm, start);
        if (idx === -1) break;
        matches.push({ from: pos + idx, to: pos + idx + term.length });
        start = idx + 1;
      }
    }
    return true;
  });

  return matches;
}

/* ── Extensions ──────────────────────────────────────────────────── */

const extensions = [
  TextStyleKit,
  StarterKit,
  AIHighlight,
  EditedMark,
  StaleHighlightExtension,
  Highlight.configure({
    multicolor: true,
  }).extend({
    inclusive: false,

    addAttributes() {
      return {
        class: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute("class"),
          renderHTML: (attributes: Record<string, string>) => {
            if (!attributes.class) return {};
            return { class: attributes.class };
          },
        },
        "data-issue-type": {
          default: null,
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-issue-type"),
          renderHTML: (attributes: Record<string, string>) => {
            if (!attributes["data-issue-type"]) return {};
            return { "data-issue-type": attributes["data-issue-type"] };
          },
        },
        "data-severity": {
          default: null,
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-severity"),
          renderHTML: (attributes: Record<string, string>) => {
            if (!attributes["data-severity"]) return {};
            return { "data-severity": attributes["data-severity"] };
          },
        },
        "data-confidence": {
          default: null,
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-confidence"),
          renderHTML: (attributes: Record<string, string>) => {
            if (!attributes["data-confidence"]) return {};
            return { "data-confidence": attributes["data-confidence"] };
          },
        },
        "data-score": {
          default: null,
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-score"),
          renderHTML: (attributes: Record<string, string>) => {
            if (!attributes["data-score"]) return {};
            return { "data-score": attributes["data-score"] };
          },
        },
      };
    },
  }),
];

/* ── SearchBar ───────────────────────────────────────────────────── */

function SearchBar({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Array<{ from: number; to: number }>>(
    [],
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const found = findSearchMatches(editor, searchTerm);
    setMatches(found);
    setCurrentIndex(0);
    if (found.length > 0) {
      editor.chain().setTextSelection(found[0]).scrollIntoView().run();
    }
  }, [searchTerm, editor]);

  const goToMatch = useCallback(
    (index: number) => {
      if (matches.length === 0) return;
      const i = ((index % matches.length) + matches.length) % matches.length;
      setCurrentIndex(i);
      editor.chain().setTextSelection(matches[i]).scrollIntoView().run();
    },
    [matches, editor],
  );

  const handleReplace = () => {
    if (matches.length === 0) return;
    const match = matches[currentIndex];
    editor.chain().setTextSelection(match).insertContent(replaceTerm).run();
    const found = findSearchMatches(editor, searchTerm);
    setMatches(found);
    setCurrentIndex(Math.min(currentIndex, Math.max(0, found.length - 1)));
  };

  const handleReplaceAll = () => {
    if (matches.length === 0) return;
    const sorted = [...matches].sort((a, b) => b.from - a.from);
    const tr = editor.state.tr;
    sorted.forEach(match => {
      tr.replaceWith(
        match.from,
        match.to,
        editor.state.schema.text(replaceTerm),
      );
    });
    editor.view.dispatch(tr);
    setMatches([]);
    setCurrentIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      e.preventDefault();
      goToMatch(e.shiftKey ? currentIndex - 1 : currentIndex + 1);
    }
  };

  return (
    <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50 p-2 shadow-sm">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="min-w-0 flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-sm outline-none focus:border-blue-400"
        />
        <span className="shrink-0 text-xs text-gray-400">
          {matches.length > 0
            ? `${currentIndex + 1} of ${matches.length}`
            : searchTerm
              ? "No results"
              : ""}
        </span>
        <button
          onClick={() => goToMatch(currentIndex - 1)}
          disabled={matches.length === 0}
          className="rounded p-1 hover:bg-gray-200 disabled:opacity-40"
          aria-label="Previous match"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => goToMatch(currentIndex + 1)}
          disabled={matches.length === 0}
          className="rounded p-1 hover:bg-gray-200 disabled:opacity-40"
          aria-label="Next match"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowReplace(!showReplace)}
          className={`rounded px-2 py-1 text-xs ${showReplace ? "bg-gray-200" : "hover:bg-gray-200"}`}
        >
          Replace
        </button>
        <button
          onClick={onClose}
          className="rounded p-1 hover:bg-gray-200"
          aria-label="Close search"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showReplace && (
        <div className="mt-2 flex items-center gap-2 pl-6">
          <input
            type="text"
            value={replaceTerm}
            onChange={e => setReplaceTerm(e.target.value)}
            placeholder="Replace with..."
            className="flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-sm outline-none focus:border-blue-400"
          />
          <button
            onClick={handleReplace}
            disabled={matches.length === 0}
            className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 disabled:opacity-40"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={matches.length === 0}
            className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 disabled:opacity-40"
          >
            All
          </button>
        </div>
      )}
    </div>
  );
}

/* ── HighlightPopover ────────────────────────────────────────────── */

function HighlightPopover({
  editorContainerRef,
}: {
  editorContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [popover, setPopover] = useState<{
    visible: boolean;
    x: number;
    y: number;
    type: "ai" | "citation" | "plagiarism" | "alignment";
    score?: string;
    severity?: string;
    issueType?: string;
    confidence?: string;
  }>({ visible: false, x: 0, y: 0, type: "ai" });

  const hoveredRef = useRef<Element | null>(null);

  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // EditedMarkTooltip has exclusive priority on edited spans — suppress this popover.
      if (target.closest("[data-edited]")) {
        if (hoveredRef.current !== null) {
          hoveredRef.current = null;
          setPopover(prev =>
            prev.visible ? { ...prev, visible: false } : prev,
          );
        }
        return;
      }

      const aiEl = target.closest(".ai-highlight");
      const citationEl = target.closest(
        '[class*="citation-issue"]',
      ) as HTMLElement | null;
      const plagiarismEl = target.closest(
        ".plagiarism-issue-high",
      ) as HTMLElement | null;
      const alignmentEl = target.closest(
        '[class*="alignment-issue"]',
      ) as HTMLElement | null;
      const highlight = aiEl || citationEl || plagiarismEl || alignmentEl;

      if (highlight === hoveredRef.current) return;
      hoveredRef.current = highlight;

      if (aiEl) {
        const rect = aiEl.getBoundingClientRect();
        setPopover({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
          type: "ai",
          score: aiEl.getAttribute("data-score") || "",
        });
        return;
      }

      if (plagiarismEl) {
        const rect = plagiarismEl.getBoundingClientRect();
        setPopover({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
          type: "plagiarism",
          score: plagiarismEl.getAttribute("data-score") || "",
          issueType: "Plagiarism",
        });
        return;
      }

      if (alignmentEl) {
        const rect = alignmentEl.getBoundingClientRect();
        const className = alignmentEl.className;
        const severity = className.includes("high")
          ? "High"
          : className.includes("medium")
            ? "Medium"
            : className.includes("low")
              ? "Low"
              : "Unknown";
        setPopover({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
          type: "alignment",
          severity,
          issueType: "Alignment",
          confidence: alignmentEl.getAttribute("data-confidence") || "",
        });
        return;
      }

      if (citationEl) {
        const rect = citationEl.getBoundingClientRect();
        const className = citationEl.className;
        const severity = className.includes("high")
          ? "High"
          : className.includes("medium")
            ? "Medium"
            : className.includes("low")
              ? "Low"
              : "Unknown";
        setPopover({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
          type: "citation",
          severity,
          issueType:
            citationEl.getAttribute("data-issue-type") || "Citation Issue",
          confidence: citationEl.getAttribute("data-confidence") || "",
        });
        return;
      }

      setPopover(prev => (prev.visible ? { ...prev, visible: false } : prev));
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      const stillInside =
        related?.closest(".ai-highlight") ||
        related?.closest('[class*="citation-issue"]') ||
        related?.closest(".plagiarism-issue-high") ||
        related?.closest('[class*="alignment-issue"]');
      if (!stillInside) {
        hoveredRef.current = null;
        setPopover(prev => (prev.visible ? { ...prev, visible: false } : prev));
      }
    };

    // Touch support: treat tap on highlights like hover
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const highlight =
        target.closest(".ai-highlight") ||
        target.closest('[class*="citation-issue"]') ||
        target.closest(".plagiarism-issue-high") ||
        target.closest('[class*="alignment-issue"]');
      if (highlight) {
        // Trigger the same logic as mouseover
        handleMouseOver(e as unknown as MouseEvent);
      } else {
        // Tap outside highlight dismisses popover
        hoveredRef.current = null;
        setPopover(prev => (prev.visible ? { ...prev, visible: false } : prev));
      }
    };

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
      container.removeEventListener("touchstart", handleTouchStart);
    };
  }, [editorContainerRef]);

  if (!popover.visible) return null;

  const severityColor =
    popover.severity === "High"
      ? "text-red-600"
      : popover.severity === "Medium"
        ? "text-amber-600"
        : "text-blue-600";

  return (
    <div
      className="pointer-events-none fixed z-50 max-w-[90vw] rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg"
      style={{
        left: Math.max(8, Math.min(popover.x, window.innerWidth - 8)),
        top: popover.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      {popover.type === "ai" ? (
        <div className="space-y-0.5">
          <div className="font-semibold text-red-600">AI Detection</div>
          <div className="text-gray-600">
            Score: {Math.round(Number(popover.score))}% probability
          </div>
        </div>
      ) : popover.type === "plagiarism" ? (
        <div className="space-y-0.5">
          <div className="font-semibold text-rose-600">Plagiarism</div>
          <div className="text-gray-600">
            {popover.score ? `${popover.score}% match` : "Match detected"}
          </div>
        </div>
      ) : (
        <div className="space-y-0.5">
          <div className={`font-semibold ${severityColor}`}>
            {formatIssueType(popover.issueType || "")}
          </div>
          {popover.severity && (
            <div className="text-gray-600">Severity: {popover.severity}</div>
          )}
          {popover.confidence && (
            <div className="text-gray-600">
              Confidence: {Math.round(Number(popover.confidence) * 100)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── EditedMarkTooltip ───────────────────────────────────────────── */

function EditedMarkTooltip({
  editorContainerRef,
}: {
  editorContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    originalText: string;
  }>({ visible: false, x: 0, y: 0, originalText: "" });

  const hoveredRef = useRef<Element | null>(null);

  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editedEl = target.closest("[data-edited]") as HTMLElement | null;
      if (editedEl === hoveredRef.current) return;
      hoveredRef.current = editedEl;

      if (editedEl) {
        const originalText = editedEl.getAttribute("data-original-text");
        if (!originalText) return;
        const rect = editedEl.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
          originalText,
        });
        return;
      }
      setTooltip(prev => (prev.visible ? { ...prev, visible: false } : prev));
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (!related?.closest("[data-edited]")) {
        hoveredRef.current = null;
        setTooltip(prev => (prev.visible ? { ...prev, visible: false } : prev));
      }
    };

    // Touch support: tap on edited marks shows tooltip, tap elsewhere dismisses
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const editedEl = target.closest("[data-edited]") as HTMLElement | null;
      if (editedEl) {
        handleMouseOver(e as unknown as MouseEvent);
      } else {
        hoveredRef.current = null;
        setTooltip(prev => (prev.visible ? { ...prev, visible: false } : prev));
      }
    };

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
      container.removeEventListener("touchstart", handleTouchStart);
    };
  }, [editorContainerRef]);

  if (!tooltip.visible) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 max-w-[90vw] rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg sm:max-w-xs"
      style={{
        left: Math.max(8, Math.min(tooltip.x, window.innerWidth - 8)),
        top: tooltip.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="space-y-0.5">
        <div className="font-semibold text-gray-400">Original flagged text</div>
        <div className="text-gray-700 italic">
          &ldquo;{tooltip.originalText}&rdquo;
        </div>
      </div>
    </div>
  );
}

/* ── MenuBar ─────────────────────────────────────────────────────── */

function MenuBar({ editor }: { editor: Editor }) {
  const mod = getModKey();
  const editorState = useEditorState({
    editor,
    selector: ctx => {
      if (!ctx.editor) {
        return {
          isBold: false,
          canBold: false,
          isItalic: false,
          canItalic: false,
          isCode: false,
          canCode: false,
          isParagraph: false,
          isHeading1: false,
          isHeading2: false,
          isHeading3: false,
          isBulletList: false,
          isOrderedList: false,
          isCodeBlock: false,
          isBlockquote: false,
          canUndo: false,
          canRedo: false,
        };
      }
      return {
        isBold: ctx.editor.isActive("bold"),
        canBold: ctx.editor.can().chain().focus().toggleBold().run(),
        isItalic: ctx.editor.isActive("italic"),
        canItalic: ctx.editor.can().chain().focus().toggleItalic().run(),
        isCode: ctx.editor.isActive("code"),
        canCode: ctx.editor.can().chain().focus().toggleCode().run(),
        isParagraph: ctx.editor.isActive("paragraph"),
        isHeading1: ctx.editor.isActive("heading", { level: 1 }),
        isHeading2: ctx.editor.isActive("heading", { level: 2 }),
        isHeading3: ctx.editor.isActive("heading", { level: 3 }),
        isBulletList: ctx.editor.isActive("bulletList"),
        isOrderedList: ctx.editor.isActive("orderedList"),
        isCodeBlock: ctx.editor.isActive("codeBlock"),
        isBlockquote: ctx.editor.isActive("blockquote"),
        canUndo: ctx.editor.can().chain().focus().undo().run(),
        canRedo: ctx.editor.can().chain().focus().redo().run(),
      };
    },
  });

  if (!editor) return null;

  const btn =
    "px-2 py-1 rounded text-sm font-medium border border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center";
  const active = "bg-gray-200 text-gray-800";
  const divider = <div className="mx-0.5 h-6 w-px self-center bg-gray-200" />;

  return (
    <div className="mb-4 rounded-md border border-gray-200 bg-white p-2 shadow-sm">
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {/* Text formatting */}
        <Tooltip text={`Bold (${mod}+B)`}>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editorState.canBold}
            className={`${btn} ${editorState.isBold ? active : ""}`}
            aria-label="Bold"
          >
            <Bold size={18} />
          </button>
        </Tooltip>
        <Tooltip text={`Italic (${mod}+I)`}>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editorState.canItalic}
            className={`${btn} ${editorState.isItalic ? active : ""}`}
            aria-label="Italic"
          >
            <Italic size={18} />
          </button>
        </Tooltip>
        <Tooltip text={`Inline Code (${mod}+E)`}>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editorState.canCode}
            className={`${btn} ${editorState.isCode ? active : ""}`}
            aria-label="Inline Code"
          >
            <Code2 size={18} />
          </button>
        </Tooltip>

        {divider}

        {/* Block styles */}
        <Tooltip text="Normal Text">
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`${btn} ${editorState.isParagraph ? active : ""}`}
            aria-label="Paragraph"
          >
            <Text size={18} />
          </button>
        </Tooltip>
        <Tooltip text={`Heading 1 (${mod}+Alt+1)`}>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`${btn} ${editorState.isHeading1 ? active : ""}`}
            aria-label="Heading 1"
          >
            <Heading1 size={18} />
          </button>
        </Tooltip>
        <Tooltip text={`Heading 2 (${mod}+Alt+2)`}>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`${btn} ${editorState.isHeading2 ? active : ""}`}
            aria-label="Heading 2"
          >
            <Heading2 size={18} />
          </button>
        </Tooltip>
        <Tooltip text={`Heading 3 (${mod}+Alt+3)`}>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`${btn} ${editorState.isHeading3 ? active : ""}`}
            aria-label="Heading 3"
          >
            <Heading3 size={18} />
          </button>
        </Tooltip>

        {divider}

        {/* Lists & blocks */}
        <Tooltip text={`Bullet List (${mod}+Shift+8)`}>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${btn} ${editorState.isBulletList ? active : ""}`}
            aria-label="Bullet List"
          >
            <List size={18} />
          </button>
        </Tooltip>
        <Tooltip text={`Ordered List (${mod}+Shift+7)`}>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${btn} ${editorState.isOrderedList ? active : ""}`}
            aria-label="Ordered List"
          >
            <ListOrdered size={18} />
          </button>
        </Tooltip>
        <Tooltip text={`Blockquote (${mod}+Shift+B)`}>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`${btn} ${editorState.isBlockquote ? active : ""}`}
            aria-label="Blockquote"
          >
            <Quote size={18} />
          </button>
        </Tooltip>
        <Tooltip text={`Code Block (${mod}+Alt+C)`}>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`${btn} ${editorState.isCodeBlock ? active : ""}`}
            aria-label="Code Block"
          >
            <Braces size={18} />
          </button>
        </Tooltip>

        {divider}

        {/* Inserts */}
        <Tooltip text="Horizontal Rule">
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={btn}
            aria-label="Horizontal Rule"
          >
            <Minus size={18} />
          </button>
        </Tooltip>

        {divider}

        {/* History */}
        <Tooltip text={`Undo (${mod}+Z)`}>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editorState.canUndo}
            className={`${btn} ${!editorState.canUndo ? "cursor-not-allowed opacity-50" : ""}`}
            aria-label="Undo"
          >
            <Undo2 size={18} />
          </button>
        </Tooltip>
        <Tooltip text={`Redo (${mod}+Shift+Z)`}>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editorState.canRedo}
            className={`${btn} ${!editorState.canRedo ? "cursor-not-allowed opacity-50" : ""}`}
            aria-label="Redo"
          >
            <Redo2 size={18} />
          </button>
        </Tooltip>

        {divider}

        {/* Clear */}
        <Tooltip text="Clear Marks">
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            className={btn}
            aria-label="Clear Marks"
          >
            <Eraser size={18} />
          </button>
        </Tooltip>
        <Tooltip text="Clear Formatting">
          <button
            onClick={() => editor.chain().focus().clearNodes().run()}
            className={btn}
            aria-label="Clear Format"
          >
            <RemoveFormatting size={18} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

/* ── Snapshot dropdown ───────────────────────────────────────────── */

function SnapshotDropdown({
  snapshots,
  onRestore,
  onClose,
}: {
  snapshots: Snapshot[];
  onRestore: (content: string) => void;
  onClose: () => void;
}) {
  if (snapshots.length === 0) return null;

  return (
    <div className="absolute top-full right-0 z-40 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
      <div className="border-b border-gray-100 px-3 py-2 text-xs font-semibold text-gray-500">
        Snapshots ({snapshots.length})
      </div>
      {snapshots.map((snap, i) => (
        <button
          key={snap.timestamp}
          onClick={() => {
            onRestore(snap.content);
            onClose();
          }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
        >
          <History className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <div className="flex-1 truncate">
            <span className="text-gray-700">{snap.label}</span>
            <span className="ml-2 text-xs text-gray-400">
              {new Date(snap.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {i === 0 && (
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">
              Latest
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ── EditorSection ───────────────────────────────────────────────── */

const EditorSection = React.forwardRef<
  { editor: Editor | null },
  {
    projectId: string;
    content: string;
    setContent: React.Dispatch<React.SetStateAction<string>>;
    projectName?: string;
    focusMode?: boolean;
    onFocusModeChange?: (mode: boolean) => void;
    showSearch?: boolean;
    onShowSearchChange?: (show: boolean) => void;
    onEditorReady?: () => void;
  }
>(
  (
    {
      projectId,
      content,
      setContent,
      projectName,
      focusMode = false,
      onFocusModeChange,
      showSearch = false,
      onShowSearchChange,
      onEditorReady,
    },
    ref,
  ) => {
    const { token } = useClaims();
    const { currentProject, setCurrentProject } = useProject();

    const { handleRefetch: refetchProjects } = useProjects();

    const [lastSaved, setLastSaved] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [errorModal, setErrorModal] = useState<{
      open: boolean;
      title: string;
      message: string;
    }>({ open: false, title: "", message: "" });

    // New editor feature states
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [showSnapshots, setShowSnapshots] = useState(false);
    const [restoreConfirm, setRestoreConfirm] = useState<{
      open: boolean;
      content: string;
    }>({ open: false, content: "" });

    const pathname = usePathname();
    // Track if component is unmounting to hide BubbleMenu
    const isUnmountingRef = useRef(false);

    // Track whether the latest content change came from the editor itself
    // so we don't sync it back and cause the cursor to jump.
    const isInternalUpdateRef = useRef(false);
    const latestContentRef = useRef(content);
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const editorHasFocusRef = useRef(false);
    const isRestoringRef = useRef(false);
    const isEditorInitializingRef = useRef(true);

    useEffect(() => {
      latestContentRef.current = content;
    }, [content]);

    useEffect(() => {
      const ref = syncTimeoutRef;
      return () => {
        if (ref.current) {
          clearTimeout(ref.current);
        }
      };
    }, []);

    // Stable ref so the recheck handler always calls the latest saveDraft
    const saveDraftRef = useRef<() => Promise<string | null>>(async () => null);
    const debouncedSaveRef = useRef<() => Promise<string | null> | void>(
      () => {},
    );

    // Word and char count
    const wordCount = count.wordCount(content);
    const charCount = count.charCount(content);
    const readingTimeEstimate = readingTime(content).text;

    const editor = useEditor({
      extensions,
      autofocus: false,
      immediatelyRender: false,
      content,
      onCreate: ({ editor }) => {
        // Ensure content is synced before marking editor as ready
        if (content && !editor.getText()) {
          editor.commands.setContent(content);
        }
        // Mark editor as initialized so we can now trigger debounce on updates
        setTimeout(() => {
          isEditorInitializingRef.current = false;
        }, 100);
        onEditorReady?.();
      },
      onUpdate: ({ editor: e }) => {
        const nextHtml = e.getHTML();
        if (nextHtml === latestContentRef.current) return;
        // Skip debounce if editor is still initializing
        if (isEditorInitializingRef.current) {
          return;
        }
        // Store the latest content but NEVER update React state while typing
        // This is the critical fix to prevent cursor disappearing
        isInternalUpdateRef.current = true;
        latestContentRef.current = nextHtml;
        // Trigger debounced auto-save on each update (only on user input, not on mount)
        if (debouncedSaveRef.current) {
          debouncedSaveRef.current();
        }
      },
      onFocus: () => {
        // Track that editor has focus to prevent external syncs
        editorHasFocusRef.current = true;
      },
      onBlur: ({ editor: e }) => {
        // Track that editor lost focus
        editorHasFocusRef.current = false;
        // Sync content to parent ONLY when editor loses focus
        const nextHtml = e.getHTML();
        if (nextHtml !== content) {
          setContent(nextHtml);
        }
      },
    });

    // Editor DOM element reference
    const editorRef = useRef<HTMLDivElement | null>(null);

    // Load snapshots from sessionStorage
    useEffect(() => {
      setSnapshots(getSnapshots(projectId));
    }, [projectId]);

    // Save snapshot and persist to backend before integrity checks
    useEffect(() => {
      const handleBeforeCheck = () => {
        const currentContent = editor?.getHTML() || latestContentRef.current;
        const snaps = saveSnapshot(
          projectId,
          currentContent,
          "Before check run",
        );
        setSnapshots(snaps);
        saveDraftRef.current();
      };

      window.addEventListener("integrity:recheck", handleBeforeCheck);
      return () => {
        window.removeEventListener("integrity:recheck", handleBeforeCheck);
      };
    }, [projectId, editor]);

    // Keyboard shortcuts (Ctrl+F, Escape)
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        const mod = e.metaKey || e.ctrlKey;

        if (mod && e.key === "f") {
          e.preventDefault();
          onShowSearchChange?.(!showSearch);
        }

        if (e.key === "Escape") {
          if (showSearch) {
            onShowSearchChange?.(false);
          } else if (focusMode) {
            onFocusModeChange?.(false);
          }
        }
      };

      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, [showSearch, focusMode, onFocusModeChange, onShowSearchChange]);

    React.useImperativeHandle(ref, () => ({
      editor,
    }));

    // Update editor content from external sources (API).
    // CRITICAL: Only sync when editor is NOT focused to prevent interrupting user input.
    useEffect(() => {
      if (!editor || content === undefined) return;

      // Never sync while editor has focus - this prevents cursor disappearing
      if (editorHasFocusRef.current) {
        return;
      }

      const currentContent = editor.getHTML();
      if (currentContent !== content) {
        editor.commands.setContent(content || "");
      }
    }, [editor, content]);

    // Save draft
    const saveDraft = async (): Promise<string | null> => {
      if (!token || !projectId) return null;
      if (isSaving) return null;

      setIsSaving(true);

      try {
        const currentContent = editor?.getHTML() || latestContentRef.current;

        // Save content to project context
        await apiClient.put(`${API_BASE_URL}/v2/projects/${projectId}`, {
          content: currentContent,
        });
        // Update current project in context
        if (currentProject) {
          setCurrentProject({
            ...currentProject,
            content: currentContent,
          });
        }
        refetchProjects();

        setLastSaved(new Date().toLocaleString());
        return projectId;
      } catch (err: unknown) {
        let errorMessage = "Failed to save draft";
        if (typeof err === "object" && err !== null && "message" in err) {
          errorMessage = (err as { message?: string }).message || errorMessage;
        }
        setErrorModal({
          open: true,
          title: "Error Saving Draft",
          message: errorMessage,
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    };
    // Save draft silently (only to snapshot, no API calls)
    const autoSaveDraftSilently = async (): Promise<string | null> => {
      if (!projectId) return null;
      if (isSaving) return null;
      // Skip auto-save if restoring from snapshot
      if (isRestoringRef.current) {
        return null;
      }

      setIsSaving(true);

      try {
        const currentContent = editor?.getHTML() || latestContentRef.current;

        // Save to snapshot only

        const snaps = saveSnapshot(
          projectId,
          currentContent,
          "Auto-save snapshot",
        );
        setSnapshots(snaps);

        setLastSaved(new Date().toLocaleString());
        return projectId;
      } catch (err: unknown) {
        // Silently log error without showing modal
        console.error("[Editor] Auto-save snapshot failed:", err);
        return null;
      } finally {
        setIsSaving(false);
      }
    };

    saveDraftRef.current = saveDraft;

    // // Auto-save
    const { hasUnsavedChanges } = useAutoSave({
      content,
      projectId,
      onSave: saveDraft,
      enabled: !!token && !!projectId,
    });

    // Debounced silent auto-save - triggers after user stops typing for 2 seconds
    const { trigger: debouncedSilentSave } = useDebounce(
      autoSaveDraftSilently,
      {
        delay: 1000,
      },
    );

    // Update ref for use in editor callbacks
    useEffect(() => {
      debouncedSaveRef.current = debouncedSilentSave;
    }, [debouncedSilentSave]);

    // // Warn on unload
    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasUnsavedChanges) {
          e.preventDefault();
          e.returnValue = "";
          return "";
        }
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }, [hasUnsavedChanges]);

    // useEffect(() => {
    //   return () => {
    //     if (isInternalUpdateRef.current) {
    //       // you will need to fire an alert warning telling the user that he has an unsaved text, he may loose it if he did not save it
    //       console.info("this is ", isInternalUpdateRef);
    //     }
    //   };
    // }, [pathname]);

    useEffect(() => {
      return () => {
        if (isInternalUpdateRef.current) {
          saveDraft();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);
    // Restore snapshot
    const handleRestore = useCallback((snapContent: string) => {
      isRestoringRef.current = true;
      setRestoreConfirm({ open: true, content: snapContent });
    }, []);

    const confirmRestore = () => {
      if (editor) {
        editor.commands.setContent(restoreConfirm.content);
        latestContentRef.current = restoreConfirm.content;
        setContent(restoreConfirm.content);
      }
      setRestoreConfirm({ open: false, content: "" });
      // Re-enable auto-save after restore completes
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 500);
    };

    const controlBtnClass =
      "rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600";

    return (
      <div>
        {/* Toolbar */}
        {editor && <MenuBar editor={editor} />}

        {/* Controls row */}
        <div className="mb-1 flex items-center justify-end gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-0.5">
            {snapshots.length > 0 && (
              <div className="relative">
                <Tooltip text="Version Snapshots">
                  <button
                    onClick={() => setShowSnapshots(prev => !prev)}
                    className={controlBtnClass}
                    aria-label="Version snapshots"
                  >
                    <History className="h-4 w-4" />
                  </button>
                </Tooltip>
                {showSnapshots && (
                  <SnapshotDropdown
                    snapshots={snapshots}
                    onRestore={handleRestore}
                    onClose={() => setShowSnapshots(false)}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search bar */}
        {showSearch && editor && (
          <SearchBar
            editor={editor}
            onClose={() => onShowSearchChange?.(false)}
          />
        )}

        {/* BubbleMenu */}
        {editor && !isUnmountingRef.current && (
          <BubbleMenu
            editor={editor}
            shouldShow={({ editor, state }) => {
              // Don't show if component is unmounting
              if (isUnmountingRef.current) {
                return false;
              }
              // Don't show if editor is being destroyed or view is null
              if (!editor.view || editor.isDestroyed) {
                return false;
              }
              // Only show when there's a selection
              return !state.selection.empty;
            }}
          >
            <div
              className="z-40 flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
              onMouseDown={e => e.preventDefault()}
            >
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().toggleBold().run();
                  // Re-focus editor after click to ensure typing continues
                  setTimeout(() => editor.view.focus(), 0);
                }}
                className={`rounded px-2 py-1 text-sm hover:bg-gray-100 ${editor.isActive("bold") ? "bg-gray-200 font-bold" : ""}`}
                aria-label="Bold"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().toggleItalic().run();
                  setTimeout(() => editor.view.focus(), 0);
                }}
                className={`rounded px-2 py-1 text-sm hover:bg-gray-100 ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
                aria-label="Italic"
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().toggleCode().run();
                  setTimeout(() => editor.view.focus(), 0);
                }}
                className={`rounded px-2 py-1 text-sm hover:bg-gray-100 ${editor.isActive("code") ? "bg-gray-200" : ""}`}
                aria-label="Inline Code"
              >
                <Code2 size={16} />
              </button>
            </div>
          </BubbleMenu>
        )}

        {/* Editor content area — dynamic height */}
        <div className="min-h-[300px] rounded-lg border border-gray-200 p-4">
          <div ref={editorRef} className="h-full w-full">
            <EditorContent
              editor={editor}
              className="tiptap-editor h-full w-full overflow-hidden"
            />
          </div>
          <HighlightPopover editorContainerRef={editorRef} />
          <EditedMarkTooltip editorContainerRef={editorRef} />
        </div>

        {/* Stats bar (hidden in focus mode via grid collapse to avoid layout shift) */}
        <div
          className={`mt-5 grid transition-[grid-template-rows] duration-200 ${focusMode ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap justify-between gap-2 rounded-lg bg-[#ECECF080] px-4 py-2.5 text-sm text-gray-400">
              <p className="flex flex-wrap justify-between gap-5">
                {lastSaved && !isSaving && (
                  <span
                    className={`text-xs transition-opacity duration-300 ${isSaving ? "opacity-0" : "opacity-100"}`}
                  >
                    Last Saved: {lastSaved}
                  </span>
                )}
                {isSaving && (
                  <span
                    className={`flex items-center gap-1 transition-opacity duration-300 ${isSaving ? "opacity-100" : "opacity-0"}`}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                )}
                <span>Words: {wordCount}</span>{" "}
                <span>Characters: {charCount}</span>
                <span>{readingTimeEstimate}</span>
              </p>
              <p className="hidden sm:block">
                Use {getModKey()}+B, {getModKey()}+I for quick formatting
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DefaultFooter
          projectId={projectId}
          _content={content}
          isSaving={isSaving}
          onSaveDraft={saveDraft}
          projectName={projectName}
          lastSaved={lastSaved}
        />

        {/* Error modal */}
        <MessageModal
          isOpen={errorModal.open}
          title={errorModal.title}
          message={errorModal.message}
          submitText="Close"
          onSubmit={() => setErrorModal({ ...errorModal, open: false })}
          icon={<X className="h-8 w-8 text-red-500" />}
          iconStyle="bg-red-100 border-red-50"
        />

        {/* Snapshot restore confirmation */}
        <MessageModal
          isOpen={restoreConfirm.open}
          title="Restore Snapshot"
          message="This will replace your current editor content with the snapshot version. Any unsaved changes will be lost."
          submitText="Restore"
          onSubmit={confirmRestore}
          cancelText="Cancel"
          onCancel={() => setRestoreConfirm({ open: false, content: "" })}
          icon={<History className="h-8 w-8 text-blue-500" />}
          iconStyle="bg-blue-100 border-blue-50"
        />
      </div>
    );
  },
);

EditorSection.displayName = "EditorSection";

export default EditorSection;
