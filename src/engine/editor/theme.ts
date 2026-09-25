import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

/**
 * Calm editor theme: solid background, high contrast, no glow, nothing animated.
 * Syntax colors are desaturated so the semantic neons stay meaningful elsewhere.
 */
export const calmTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--bc-editor)",
      color: "var(--bc-code-fg)",
      fontSize: "14px",
      height: "100%",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
      lineHeight: "1.7",
    },
    ".cm-content": { caretColor: "var(--bc-cyan)", padding: "12px 0" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--bc-cyan)", borderLeftWidth: "2px" },
    "&.cm-focused": { outline: "none" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "rgb(var(--bc-cyan-rgb) / 0.22) !important",
    },
    ".cm-gutters": {
      backgroundColor: "var(--bc-editor-gutter)",
      color: "var(--bc-code-gutter-fg)",
      border: "none",
      borderRight: "1px solid var(--bc-line)",
    },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--bc-text-2)" },
    ".cm-activeLine": { backgroundColor: "var(--bc-code-active)" },
    ".cm-line": { padding: "0 16px" },
    // editable region: lit rail + faint wash; locked code slightly dimmed
    ".bc-editable": {
      backgroundColor: "rgb(var(--bc-cyan-rgb) / 0.055)",
      boxShadow: "inset 2px 0 0 var(--bc-cyan)",
    },
    ".bc-locked": { opacity: "0.72" },
    ".bc-marker": { color: "var(--bc-code-comment) !important", fontStyle: "italic" },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  {
    tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword],
    color: "var(--bc-code-keyword)",
  },
  { tag: [t.string, t.special(t.string)], color: "var(--bc-code-string)" },
  { tag: [t.number, t.bool, t.null], color: "var(--bc-code-number)" },
  { tag: [t.comment, t.lineComment], color: "var(--bc-code-comment)", fontStyle: "italic" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "var(--bc-code-fn)" },
  { tag: [t.className, t.typeName], color: "var(--bc-code-class)" },
  { tag: [t.definition(t.variableName), t.propertyName], color: "var(--bc-code-def)" },
  { tag: [t.operator, t.punctuation], color: "var(--bc-code-op)" },
  { tag: t.meta, color: "var(--bc-code-meta)" },
]);

export const calmHighlight = syntaxHighlighting(highlight);
