import { describe, expect, it } from "vitest";

import { EMPTY_RECORD } from "@/features/progress/records";

import { activeDistrict, neighbor, progressFrom, restorationFrom } from "./progress";

describe("world map navigation", () => {
  it("left/right follow the road in level order", () => {
    expect(neighbor("signal-tower", "right")).toBe("router-station");
    expect(neighbor("signal-tower", "left")).toBe("academy");
    expect(neighbor("skyline", "right")).toBe("skyline");
  });

  it("up/down jump to the nearest district on screen", () => {
    expect(neighbor("gatehouse", "down")).toBe("data-vaults");
    expect(neighbor("skyline", "up")).toBe("skyline");
  });

  it("a brand-new learner has nothing cleared and starts at the first open district", () => {
    const p = progressFrom({});
    expect(Object.values(p).filter((s) => s === "done")).toHaveLength(0);
    expect(activeDistrict(p).key).toBe("academy");
    expect(p["data-vaults"]).toBe("locked");
  });

  it("a passed checkpoint clears the district", () => {
    expect(
      progressFrom({ "validate-signups": { ...EMPTY_RECORD, complete: true } }).gatehouse,
    ).toBe("done");
  });
});

describe("restoration", () => {
  it("lights a district by the share of its steps done", () => {
    expect(restorationFrom({})["signal-tower"]).toBe(0);
    // briefing + 1 of 2 practice games, checkpoint not yet: 2 of 4 steps
    const half = restorationFrom({
      "how-requests-travel": { ...EMPTY_RECORD, lessonDone: true, practiceDone: ["signal-codes"] },
    });
    expect(half["signal-tower"]).toBe(0.5);
    expect(half["data-vaults"]).toBeUndefined(); // not open yet
  });
});
