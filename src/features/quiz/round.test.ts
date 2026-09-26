import { describe, expect, it } from "vitest";

import {
  dailyChallenge,
  dayKey,
  daySeed,
  placement,
  placementStart,
  QUIZZES,
} from "@/content/quizzes";

import { buildRound, bySkill, tally } from "./round";

describe("quiz rounds", () => {
  it("draws `draw` questions and keeps the right answer after shuffling", () => {
    for (const quiz of QUIZZES) {
      const round = buildRound(quiz, 7);
      expect(round).toHaveLength(Math.min(quiz.draw, quiz.items.length));
      for (const item of round) {
        const original = quiz.items.find((q) => q.prompt === item.prompt)!;
        expect(item.options[item.correct]).toEqual(original.options[original.correct]);
      }
    }
  });

  it("differs between seeds but repeats for the same seed", () => {
    const quiz = QUIZZES[0]!;
    const prompts = (seed: number) => buildRound(quiz, seed).map((q) => q.prompt);
    expect(prompts(1)).toEqual(prompts(1));
    expect(prompts(1)).not.toEqual(prompts(2));
  });

  it("counts combos as runs of right answers", () => {
    const r = (correct: boolean) => ({ picked: 0, correct });
    expect(tally([r(true), r(true), r(false), r(true), r(true), r(true)])).toEqual({
      score: 5,
      combo: 3,
      bestCombo: 3,
    });
  });

  it("suggests a start from the placement skills", () => {
    const round = buildRound(placement, 3);
    const all = round.map(() => ({ picked: 0, correct: true }));
    expect(placementStart(bySkill(round, all))).toBe("router-station");
    const none = round.map(() => ({ picked: 0, correct: false }));
    expect(placementStart(bySkill(round, none))).toBe("academy");
    expect(placementStart({ python: 4, http: 1 })).toBe("signal-tower");
  });

  it("has every placement question tagged with a skill", () => {
    expect(placement.items.every((q) => q.skill)).toBe(true);
  });
});

describe("daily challenge", () => {
  it("gives everyone the same five questions on a day, and new ones the next day", () => {
    const prompts = (day: string) => buildRound(dailyChallenge, daySeed(day)).map((q) => q.prompt);
    expect(prompts("2026-09-26")).toHaveLength(5);
    expect(prompts("2026-09-26")).toEqual(prompts("2026-09-26"));
    expect(prompts("2026-09-26")).not.toEqual(prompts("2026-09-27"));
    expect(dayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
