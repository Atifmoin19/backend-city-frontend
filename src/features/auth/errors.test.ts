import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/errors";

import { mapAuthError } from "./errors";

describe("mapAuthError", () => {
  it("routes email_taken to the email field", () => {
    expect(mapAuthError(new ApiError(409, "email_taken", "x"))[0]?.field).toBe("email");
  });

  it("maps validation details onto fields", () => {
    const err = new ApiError(422, "validation_error", "bad", [
      { loc: ["body", "password"], msg: "too short", type: "x" },
    ]);
    expect(mapAuthError(err)).toEqual([{ field: "password", message: "too short" }]);
  });

  it("explains cold starts instead of showing a raw 503", () => {
    expect(mapAuthError(new ApiError(503, "http_error", "x"))[0]?.message).toMatch(/waking up/);
  });
});
