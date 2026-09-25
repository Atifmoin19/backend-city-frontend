/** Locate the editable region between the edit markers inside a document. */

export interface Region {
  start_marker: string;
  end_marker: string;
}

export interface RegionBounds {
  /** Offset right after the start-marker line (first editable char). */
  from: number;
  /** Offset at the start of the end-marker line. */
  to: number;
}

export function findRegion(doc: string, region: Region): RegionBounds | null {
  const lines = doc.split("\n");
  let offset = 0;
  let from = -1;
  for (const line of lines) {
    const trimmed = line.trim();
    if (from < 0 && trimmed === region.start_marker) {
      from = offset + line.length + 1;
    } else if (from >= 0 && trimmed === region.end_marker) {
      return { from, to: offset };
    }
    offset += line.length + 1;
  }
  return null;
}

/** The learner's snippet: text between the markers (what the backend grades). */
export function extractSnippet(doc: string, region: Region): string {
  const b = findRegion(doc, region);
  return b ? doc.slice(b.from, b.to) : "";
}
