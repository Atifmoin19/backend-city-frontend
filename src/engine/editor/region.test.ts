import { describe, expect, it } from "vitest";

import { extractSnippet, findRegion } from "./region";

const REGION = { start_marker: "# >>> EDIT START", end_marker: "# <<< EDIT END" };
const DOC = "class A:\n    # >>> EDIT START\n    x: int\n    # <<< EDIT END\n\nprint(1)\n";

describe("editable region", () => {
  it("finds the lines between the markers", () => {
    const b = findRegion(DOC, REGION)!;
    expect(DOC.slice(b.from, b.to)).toBe("    x: int\n");
  });

  it("extracts the snippet the backend will grade", () => {
    expect(extractSnippet(DOC, REGION)).toBe("    x: int\n");
  });

  it("returns null when markers are missing", () => {
    expect(findRegion("x = 1", REGION)).toBeNull();
  });
});
