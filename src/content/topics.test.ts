import { describe, expect, it } from "vitest";

import { TOPICS, withLiveGames } from "./topics";

const tower = TOPICS.find((t) => t.slug === "how-requests-travel")!;

describe("live game lists", () => {
  it("keeps the static lists when the server hasn't answered", () => {
    expect(withLiveGames(TOPICS, undefined)).toBe(TOPICS);
  });

  it("drops a hidden game, adds a new one, and keeps hand-written blurbs", () => {
    const live = withLiveGames(TOPICS, [
      {
        topic: tower.slug,
        games: [
          { slug: "signal-codes", title: "Signal Codes", objective: "x", is_checkpoint: false },
          {
            slug: "header-hunt",
            title: "Header Hunt",
            objective: "Find the header.",
            is_checkpoint: false,
          },
          { slug: "tower-relay", title: "Tower Relay", objective: "y", is_checkpoint: true },
        ],
      },
    ]).find((t) => t.slug === tower.slug)!;
    expect(live.practice.map((g) => g.slug)).toEqual(["signal-codes", "header-hunt"]);
    expect(live.practice[0]!.blurb).toBe(tower.practice[0]!.blurb);
    expect(live.practice[1]!.blurb).toBe("Find the header.");
    expect(live.checkpoint?.slug).toBe("tower-relay");
  });

  it("a topic whose checkpoint is hidden has none", () => {
    const live = withLiveGames(TOPICS, [{ topic: tower.slug, games: [] }]).find(
      (t) => t.slug === tower.slug,
    )!;
    expect(live.practice).toEqual([]);
    expect(live.checkpoint).toBeUndefined();
  });
});
