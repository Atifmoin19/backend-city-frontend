import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InlineCode } from "./InlineCode";

describe("InlineCode", () => {
  it("renders code spans and key terms", () => {
    render(<InlineCode text="The **client** calls `fetch()`." />);
    expect(screen.getByText("client").tagName).toBe("STRONG");
    expect(screen.getByText("fetch()").tagName).toBe("CODE");
  });
});
