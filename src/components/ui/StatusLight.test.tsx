import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusLight } from "./StatusLight";

describe("StatusLight", () => {
  it("always renders text next to the color (never color alone)", () => {
    render(<StatusLight status="bounce" />);
    expect(screen.getByText("Bounced")).toBeInTheDocument();
  });

  it("keeps an accessible label in icon-only mode", () => {
    render(
      <StatusLight status="crash" iconOnly>
        500 crashed
      </StatusLight>,
    );
    expect(screen.getByText("500 crashed")).toHaveClass("sr-only");
  });
});
