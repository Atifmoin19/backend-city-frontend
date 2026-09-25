import { describe, expect, it } from "vitest";

import { activeDistrict, neighbor, progressFrom } from "./progress";

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
    expect(activeDistrict(p).key).toBe("gatehouse");
    expect(p["signal-tower"]).toBe("locked");
  });

  it("a passed checkpoint clears the district", () => {
    expect(
      progressFrom({ "validate-signups": { checkpoint: { score: 90, stars: 2 } } }).gatehouse,
    ).toBe("done");
  });
});
