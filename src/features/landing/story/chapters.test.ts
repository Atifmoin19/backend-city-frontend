import { describe, expect, it } from "vitest";

import { STAGE_COUNT } from "../city3d/cityScene";

import { CHAPTERS } from "./chapters";

describe("scroll story", () => {
  it("has exactly one camera stop per chapter", () => {
    expect(CHAPTERS.length).toBe(STAGE_COUNT);
  });

  it("tours the whole frontend surface before diving into the backend", () => {
    const ids = CHAPTERS.map((c) => c.id);
    expect(ids.indexOf("components")).toBeLessThan(ids.indexOf("backend"));
    expect(CHAPTERS.filter((c) => c.status === "soon").length).toBeGreaterThanOrEqual(5);
  });
});
