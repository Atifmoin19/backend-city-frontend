import { describe, expect, it } from "vitest";

import { activeDistrict, DEMO_PROGRESS, neighbor } from "./progress";

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

  it("starts the learner on the active district", () => {
    expect(activeDistrict(DEMO_PROGRESS).key).toBe("gatehouse");
  });
});
