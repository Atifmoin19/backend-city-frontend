import { describe, expect, it } from "vitest";

import { cityStats, nextMission } from "./stats";

describe("city progress", () => {
  it("a new learner has nothing cleared and starts at the Academy briefing", () => {
    expect(cityStats({}).districtsCleared).toBe(0);
    expect(nextMission({})?.href).toBe("/learn/academy-python");
  });

  it("lesson-only topics complete with the briefing; game topics need the checkpoint", () => {
    const records = {
      "python-for-js": { lessonDone: true },
      "how-requests-travel": { lessonDone: true },
      "validate-signups": { lessonDone: true, practicePassed: true },
    };
    expect(cityStats(records).districtsCleared).toBe(2);
    expect(nextMission(records)?.step).toBe("checkpoint");
  });

  it("counts stars from checkpoints", () => {
    expect(cityStats({ "validate-signups": { checkpoint: { score: 96, stars: 3 } } }).stars).toBe(
      3,
    );
  });
});
