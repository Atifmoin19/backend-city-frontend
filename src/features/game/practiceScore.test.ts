import { describe, expect, it } from "vitest";

import { practiceScore } from "./useGamePlay";

const r = (passed: boolean) => ({
  name: "t",
  request: { method: "POST", path: "/" },
  expect_status: 201,
  status: 201,
  passed,
  body: null,
});

describe("practiceScore", () => {
  it("is null before any successful run", () => {
    expect(practiceScore(null)).toBeNull();
    expect(practiceScore({ ok: false, error: "boom", results: [] })).toBeNull();
  });

  it("is the percentage of requests handled as expected", () => {
    expect(practiceScore({ ok: true, error: null, results: [r(true), r(false), r(true)] })).toBe(
      67,
    );
  });
});
