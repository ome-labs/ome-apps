import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { EmptyState, StateArt } from "../src/index.ts";

describe("StateArt", () => {
  test("puts both drawings in the page, light and dark, for the stylesheet to choose", () => {
    const { container } = render(<StateArt id="no-proposals" size={120} />);
    const [light, dark] = [...container.querySelectorAll("img")];

    expect(light?.className).toContain("ome-art-light");
    expect(light?.getAttribute("src")).toContain("state-objects/light/no-proposals@1x.webp");
    expect(dark?.className).toContain("ome-art-dark");
    expect(dark?.getAttribute("src")).toContain("state-objects/dark/no-proposals@1x.webp");
    expect(
      Math.max(Number(light?.getAttribute("width")), Number(light?.getAttribute("height"))),
    ).toBe(120);
  });

  test("an empty state's object is decorative: its title says what is missing", () => {
    render(<EmptyState state="no-tokens" title="No tokens tracked yet" />);

    expect(screen.queryAllByRole("img")).toEqual([]);
    expect(screen.getByRole("heading", { name: "No tokens tracked yet" })).toBeTruthy();
  });
});
