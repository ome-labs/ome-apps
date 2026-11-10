import { describe, expect, test } from "vitest";

import { contrastRatio } from "./color/contrast.ts";
import { nativeCss } from "./emit/css-native.ts";
import { webCss } from "./emit/css-web.ts";
import { tokensObject } from "./emit/typescript.ts";
import { loadTheme } from "./source/theme.ts";

const theme = loadTheme();
const color = (utility: string, mode: "light" | "dark") => {
  const found = theme.semantic.find((entry) => entry.utility === utility);
  if (!found) {
    throw new Error(`no semantic colour ${utility}`);
  }
  return found[mode];
};

describe("semantic colours", () => {
  test("every role resolves to a hex colour in both themes", () => {
    for (const entry of theme.semantic) {
      expect(entry.light, entry.name).toMatch(/^#[\dA-F]{6}$/i);
      expect(entry.dark, entry.name).toMatch(/^#[\dA-F]{6}$/i);
    }
  });

  test("utility names are unique", () => {
    const names = theme.semantic.map((entry) => entry.utility);

    expect(new Set(names).size).toBe(names.length);
  });
});

// Figma page 07 and 23: body text is AA (4.5:1) in both themes; status and accent text keep AA on
// their own tinted backgrounds. Tertiary text only needs to hold on the plain surfaces.
const textOnSurface: [string, string, number][] = [
  ...["canvas", "surface", "raised", "sunken"].flatMap((surface): [string, string, number][] => [
    ["fg", surface, 4.5],
    ["fg-muted", surface, 4.5],
    ["fg-subtle", surface, 4.5],
    ["accent-fg", surface, 4.5],
  ]),
  ["fg", "hover", 4.5],
  ["fg", "selected", 4.5],
  ["on-accent", "accent", 4.5],
  ["on-accent", "danger-solid", 4.5],
  ["fg-inverse", "inverse", 4.5],
  ["success", "success-subtle", 4.5],
  ["warning", "warning-subtle", 4.5],
  ["danger", "danger-subtle", 4.5],
  ["info", "info-subtle", 4.5],
  ["neutral", "neutral-subtle", 4.5],
  ["accent-fg", "accent-subtle", 4.5],
];

describe.each(["light", "dark"] as const)("contrast in the %s theme", (mode) => {
  test.each(textOnSurface)("%s on %s is at least %s:1", (text, surface, minimum) => {
    expect(contrastRatio(color(text, mode), color(surface, mode))).toBeGreaterThanOrEqual(minimum);
  });
});

describe("generated output", () => {
  test("the web theme declares every role in both themes and maps it to a utility", () => {
    const css = webCss(theme);

    for (const entry of theme.semantic) {
      expect(css).toContain(`${entry.variable}: ${entry.light};`);
      expect(css).toContain(`${entry.variable}: ${entry.dark};`);
      expect(css).toContain(`--color-${entry.utility}: var(${entry.variable});`);
    }
  });

  test("the web theme matches the snapshot", () => {
    expect(webCss(theme)).toMatchSnapshot();
  });

  test("the native theme matches the snapshot", () => {
    expect(nativeCss(theme)).toMatchSnapshot();
  });

  test("the TypeScript object matches the snapshot", () => {
    expect(tokensObject(theme)).toMatchSnapshot();
  });
});
