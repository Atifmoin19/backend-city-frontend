"use client";

import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { indentUnit } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
} from "@codemirror/view";
import { useEffect, useRef } from "react";

import type { Region } from "./region";
import { lockedRegion } from "./lockedRegion";
import { calmHighlight, calmTheme } from "./theme";

interface CodeEditorProps {
  /** Full document; remounts the editor when this identity changes (new variant / reset). */
  initialDoc: string;
  region: Region;
  onChange: (doc: string) => void;
  onRun: () => void;
  onFocusChange?: (focused: boolean) => void;
  label: string;
}

export function CodeEditor({
  initialDoc,
  region,
  onChange,
  onRun,
  onFocusChange,
  label,
}: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onChange, onRun, onFocusChange });
  useEffect(() => {
    handlers.current = { onChange, onRun, onFocusChange };
  }, [onChange, onRun, onFocusChange]);

  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: initialDoc,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          history(),
          indentUnit.of("    "),
          EditorState.tabSize.of(4),
          python(),
          calmTheme,
          calmHighlight,
          lockedRegion(region),
          keymap.of([
            // Ctrl+Enter and Cmd+Enter both run, on every OS (ideology 9.2)
            { key: "Mod-Enter", run: () => (handlers.current.onRun(), true), preventDefault: true },
            {
              key: "Ctrl-Enter",
              run: () => (handlers.current.onRun(), true),
              preventDefault: true,
            },
            indentWithTab,
            ...defaultKeymap,
            ...historyKeymap,
          ]),
          EditorView.contentAttributes.of({ "aria-label": label }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) handlers.current.onChange(u.state.doc.toString());
            if (u.focusChanged) handlers.current.onFocusChange?.(u.view.hasFocus);
          }),
        ],
      }),
    });
    // Put the caret at the start of the editable region
    const doc = view.state.doc.toString();
    const at = doc.indexOf(region.start_marker);
    if (at >= 0) {
      const line = view.state.doc.lineAt(at);
      const next = Math.min(line.to + 1, view.state.doc.length);
      view.dispatch({ selection: { anchor: view.state.doc.lineAt(next).to } });
    }
    return () => view.destroy();
  }, [initialDoc, region, label]);

  return <div ref={host} className="h-full min-h-0 overflow-hidden [&_.cm-editor]:h-full" />;
}
