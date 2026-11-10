import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { registry } from "./registry.ts";
import { Icon, iconNames } from "./web.tsx";

describe("registry", () => {
  test("holds the kit's 85 icons", () => {
    expect(iconNames).toHaveLength(85);
  });

  test.each(iconNames)("%s resolves to a Hugeicons icon that renders", (name) => {
    const { container } = render(<Icon name={name} />);

    expect(registry[name].length).toBeGreaterThan(0);
    expect(
      container.querySelectorAll("svg path, svg circle, svg rect, svg line, svg polyline").length,
    ).toBeGreaterThan(0);
  });

  test("no two names map to the same icon", () => {
    const icons = iconNames.map((name) => registry[name]);

    expect(new Set(icons).size).toBe(icons.length);
  });
});

describe("Icon", () => {
  test("is decorative unless it has a label", () => {
    const decorative = render(<Icon name="vault" />).container.querySelector("svg");
    const labelled = render(<Icon name="vault" label="Vault" />).container.querySelector("svg");

    expect(decorative?.getAttribute("aria-hidden")).toBe("true");
    expect(labelled?.getAttribute("role")).toBe("img");
    expect(labelled?.getAttribute("aria-label")).toBe("Vault");
  });

  test("draws with the kit's stroke and takes a token colour", () => {
    const svg = render(<Icon name="lock" size={16} tone="accent-fg" />).container.querySelector(
      "svg",
    );

    expect(svg?.getAttribute("width")).toBe("16");
    expect(svg?.innerHTML).toContain('stroke-width="1.5"');
    expect(svg?.outerHTML).toContain("var(--ome-accent-text)");
  });
});
