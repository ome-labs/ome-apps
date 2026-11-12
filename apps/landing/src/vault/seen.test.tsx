import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Seen } from "./seen.tsx";

describe("Seen", () => {
  it("starts as the network sees the vault: private values are noise, public ones show", () => {
    render(<Seen />);

    expect(screen.getByRole("button", { name: "The network" })).toHaveProperty(
      "ariaPressed",
      "true",
    );
    expect(screen.getAllByText("encrypted")).toHaveLength(6);
    expect(screen.queryByText("12,400 USDC")).toBeNull();
    expect(screen.getByText("random-looking fields")).toBeDefined();
  });

  it("flips to what a member sees", async () => {
    render(<Seen />);
    fireEvent.click(screen.getByRole("button", { name: "A member" }));

    expect(await screen.findByText("12,400 USDC")).toBeDefined();
    expect(screen.getByRole("button", { name: "A member" })).toHaveProperty("ariaPressed", "true");
  });
});
