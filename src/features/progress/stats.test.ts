import { describe, expect, it } from "vitest";

import { EMPTY_RECORD, type TopicRecord } from "./records";
import { cityStats, nextMission } from "./stats";

const rec = (r: Partial<TopicRecord>): TopicRecord => ({ ...EMPTY_RECORD, ...r });

describe("city progress", () => {
  it("a new learner has nothing cleared and starts at the Academy briefing", () => {
    expect(cityStats({}).districtsCleared).toBe(0);
    expect(nextMission({})?.href).toBe("/learn/academy-python");
  });

  it("walks briefing, then each practice game, then the checkpoint", () => {
    const records = {
      "python-for-js": rec({ lessonDone: true, complete: true }),
      "how-requests-travel": rec({ lessonDone: true }),
    };
    expect(cityStats(records).districtsCleared).toBe(1);
    expect(nextMission(records)?.href).toBe("/play/signal-codes?mode=practice");

    records["how-requests-travel"] = rec({ lessonDone: true, practiceDone: ["signal-codes"] });
    expect(nextMission(records)?.href).toBe("/play/method-lanes?mode=practice");

    records["how-requests-travel"] = rec({
      lessonDone: true,
      practiceDone: ["signal-codes", "method-lanes"],
      practicePassed: true,
    });
    expect(nextMission(records)?.href).toBe("/play/tower-relay?mode=checkpoint");
  });

  it("counts stars from checkpoints", () => {
    const records = { "validate-signups": rec({ checkpoint: { score: 96, stars: 3 } }) };
    expect(cityStats(records).stars).toBe(3);
  });
});
