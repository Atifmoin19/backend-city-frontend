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
      color: "#dfe6f7",
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
      backgroundColor: "rgb(62 230 255 / 0.22) !important",
    },
    ".cm-gutters": {
      backgroundColor: "var(--bc-editor-gutter)",
      color: "#56638a",
      border: "none",
      borderRight: "1px solid var(--bc-line)",
    },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--bc-text-2)" },
    ".cm-activeLine": { backgroundColor: "rgb(255 255 255 / 0.025)" },
    ".cm-line": { padding: "0 16px" },
    // editable region: lit rail + faint wash; locked code slightly dimmed
    ".bc-editable": {
      backgroundColor: "rgb(62 230 255 / 0.055)",
      boxShadow: "inset 2px 0 0 var(--bc-cyan)",
    },
    ".bc-locked": { opacity: "0.72" },
    ".bc-marker": { color: "#6f7ca3 !important", fontStyle: "italic" },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: "#c7a6ff" },
  { tag: [t.string, t.special(t.string)], color: "#a8e6b8" },
  { tag: [t.number, t.bool, t.null], color: "#ffcf8a" },
  { tag: [t.comment, t.lineComment], color: "#6f7ca3", fontStyle: "italic" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#9fdcff" },
  { tag: [t.className, t.typeName], color: "#8fd3ff" },
  { tag: [t.definition(t.variableName), t.propertyName], color: "#e9eefb" },
  { tag: [t.operator, t.punctuation], color: "#aab5d3" },
  { tag: t.meta, color: "#ffb3c1" },
]);

export const calmHighlight = syntaxHighlighting(highlight);
