import { join } from "node:path";

import { resolve } from "./resolve.ts";
import { readTokens, type Token } from "./tree.ts";

export type Dimension = { value: number; unit: "px" | "rem" | "em" };
export type Shadow = {
  color: string;
  offsetX: Dimension;
  offsetY: Dimension;
  blur: Dimension;
  spread: Dimension;
  inset?: boolean;
};

/** A shadow per theme: dark themes show layers with light edges where light themes cast shadows. */
export type Elevation = { name: string; light: Shadow[]; dark: Shadow[] };

/** A semantic colour with both themes resolved to hex, and its code names. */
export type SemanticColor = {
  /** Figma name, e.g. `text/primary`. */
  name: string;
  /** CSS custom property, e.g. `--ome-text-primary`. */
  variable: string;
  /** Tailwind / Uniwind colour name, e.g. `fg` (so `text-fg`, `bg-fg`). */
  utility: string;
  light: string;
  dark: string;
};

export type TextStyle = {
  /** Kebab name, e.g. `heading-m`. */
  name: string;
  figma: string;
  family: "display" | "sans" | "mono";
  size: number;
  weight: number;
  lineHeight: number;
  letterSpacing: number;
  uppercase: boolean;
};

/** Every token, resolved and grouped the way the emitters need them. */
export type Theme = {
  primitives: { name: string; hex: string }[];
  semantic: SemanticColor[];
  families: Record<"display" | "sans" | "mono", string[]>;
  text: TextStyle[];
  space: { name: string; px: number }[];
  radius: { name: string; px: number }[];
  control: { name: string; px: number }[];
  elevation: Elevation[];
  duration: { name: string; ms: number }[];
  easing: { name: string; curve: [number, number, number, number] }[];
  sceneSteps: number;
  layout: Record<string, unknown>;
};

const leaf = (token: Token, prefix: string) => token.path.slice(prefix.length + 1);
const ome = (token: Token) => (token.extensions["network.ome"] ?? {}) as Record<string, unknown>;

export function loadTheme(directory = join(import.meta.dirname, "../../tokens")): Theme {
  const tokens = readTokens(directory);
  const byPath = new Map(tokens.map((token) => [token.path, token]));
  const value = <T>(token: Token) => resolve(token.value, byPath) as T;
  const under = (prefix: string) => tokens.filter((token) => token.path.startsWith(`${prefix}.`));

  const semantic = under("semantic").map((token) => {
    const name = leaf(token, "semantic").replace(".", "/");
    const extension = ome(token);

    return {
      name,
      variable: `--ome-${name.replace("/", "-")}`,
      utility: String(extension.utility),
      light: String(value(token)),
      dark: String(resolve(extension.dark, byPath)),
    };
  });

  const families = Object.fromEntries(
    under("font.family").map((token) => [leaf(token, "font.family"), value<string[]>(token)]),
  ) as Theme["families"];

  const text = under("text").map((token) => {
    const style = token.value as Record<string, unknown>;
    const family = String(style.fontFamily).replace(
      /^\{font\.family\.(\w+)\}$/,
      "$1",
    ) as TextStyle["family"];
    const extension = ome(token);

    return {
      name: leaf(token, "text"),
      figma: String(extension.figma),
      family,
      size: (style.fontSize as Dimension).value,
      weight: Number(style.fontWeight),
      lineHeight: Number(style.lineHeight),
      letterSpacing: (style.letterSpacing as Dimension).value,
      uppercase: extension.textTransform === "uppercase",
    };
  });

  const pixels = (prefix: string) =>
    under(prefix).map((token) => ({
      name: leaf(token, prefix),
      px: value<Dimension>(token).value,
    }));

  return {
    primitives: under("color")
      .filter((token) => !token.path.startsWith("color.core."))
      .map((token) => ({
        name: leaf(token, "color").replace(".", "/"),
        hex: String(value(token)),
      })),
    semantic,
    families,
    text,
    space: pixels("space"),
    radius: pixels("radius"),
    control: pixels("control"),
    elevation: under("elevation").map((token) => {
      const light = value<Shadow[]>(token);
      const dark = ome(token).dark as Shadow[] | undefined;
      return { name: leaf(token, "elevation"), light, dark: dark ?? light };
    }),
    duration: under("duration").map((token) => ({
      name: leaf(token, "duration"),
      ms: value<Dimension>(token).value,
    })),
    easing: under("easing").map((token) => ({
      name: leaf(token, "easing"),
      curve: value<[number, number, number, number]>(token),
    })),
    sceneSteps: value<number>(byPath.get("steps.scene") as Token),
    layout: nest(under("layout"), "layout", value),
  };
}

// Layout tokens become a plain nested object of numbers (pixels or counts) for code.
function nest(
  tokens: Token[],
  prefix: string,
  value: <T>(token: Token) => T,
): Record<string, unknown> {
  const root: Record<string, unknown> = {};

  for (const token of tokens) {
    const keys = token.path.slice(prefix.length + 1).split(".");
    const last = keys.pop() as string;
    let cursor = root;
    for (const key of keys) {
      cursor = (cursor[key] ??= {}) as Record<string, unknown>;
    }
    const raw = value<Dimension | number>(token);
    cursor[last] = typeof raw === "number" ? raw : raw.value;
  }

  return root;
}
