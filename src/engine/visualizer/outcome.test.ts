import { describe, expect, it } from "vitest";

import { outcomeOf, verdictLine } from "./outcome";

const base = { name: "t", request: { method: "POST", path: "/signup" }, body: null };

describe("visualizer outcomes", () => {
  it("maps status classes to what the packet does", () => {
    expect(outcomeOf(201)).toBe("served");
    expect(outcomeOf(422)).toBe("bounced");
    expect(outcomeOf(500)).toBe("crashed");
  });

  it("explains a fake that slipped through", () => {
    expect(verdictLine({ ...base, status: 201, expect_status: 422, passed: false })).toBe(
      "201 · should have bounced",
    );
    expect(verdictLine({ ...base, status: 422, expect_status: 422, passed: true })).toBe("422");
  });
});
