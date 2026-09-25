import { EditorState, RangeSetBuilder, type Extension } from "@codemirror/state";
import {
  Decoration,
  ViewPlugin,
  type DecorationSet,
  type EditorView,
  type ViewUpdate,
} from "@codemirror/view";

import { findRegion, type Region } from "./region";

/** Only the text between the edit markers can change; everything else is read-only. */
export function lockedRegion(region: Region): Extension {
  const filter = EditorState.changeFilter.of((tr) => {
    const bounds = findRegion(tr.startState.doc.toString(), region);
    if (!bounds) return false;
    // suppress changes outside [from, to]
    return [0, bounds.from, bounds.to, tr.startState.doc.length];
  });

  const decorations = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = build(view, region);
      }
      update(u: ViewUpdate) {
        if (u.docChanged || u.viewportChanged) this.decorations = build(u.view, region);
      }
    },
    { decorations: (v) => v.decorations },
  );

  return [filter, decorations];
}

const editable = Decoration.line({ class: "bc-editable" });
const locked = Decoration.line({ class: "bc-locked" });
const marker = Decoration.line({ class: "bc-marker bc-locked" });

function build(view: EditorView, region: Region): DecorationSet {
  const doc = view.state.doc;
  const bounds = findRegion(doc.toString(), region);
  const builder = new RangeSetBuilder<Decoration>();
  for (let n = 1; n <= doc.lines; n++) {
    const line = doc.line(n);
    const text = line.text.trim();
    if (text === region.start_marker || text === region.end_marker)
      builder.add(line.from, line.from, marker);
    else if (bounds && line.from >= bounds.from && line.from < bounds.to)
      builder.add(line.from, line.from, editable);
    else builder.add(line.from, line.from, locked);
  }
  return builder.finish();
}
