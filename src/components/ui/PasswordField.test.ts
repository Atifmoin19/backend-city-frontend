import { describe, expect, it } from "vitest";

import { passwordStrength } from "./PasswordField";

describe("passwordStrength", () => {
  it("scores length and variety", () => {
    expect(passwordStrength("")).toBe(0);
    expect(passwordStrength("short")).toBe(0);
    expect(passwordStrength("longenough")).toBe(1);
    expect(passwordStrength("Longer-Pass-12")).toBe(4);
  });
});
