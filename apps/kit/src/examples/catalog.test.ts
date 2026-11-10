import { describe, expect, test } from "vitest";

import { snippet } from "../bench/snippet.ts";
import { loadExampleSets } from "./catalog.ts";

const sets = await loadExampleSets();
const examples = Object.entries(sets).flatMap(([key, set]) =>
  set.examples.map((entry) => [`${key} › ${entry.name}`, set.source, entry.name] as const),
);

describe("examples", () => {
  // A renamed example function would otherwise show an empty code panel without failing anything.
  test.each(examples)("%s has its code cut from the source", (_, source, name) => {
    const code = snippet(source, name);

    expect(code).toMatch(/</);
    expect(code).not.toMatch(/^export /);
  });

  test("a JSX-only example shows just its JSX, dedented", () => {
    const code = snippet(sets["actions"]?.source ?? "", "ButtonStates");

    expect(code.startsWith('<div className="flex flex-wrap items-center gap-3">')).toBe(true);
  });

  test("an example with state shows its whole function", () => {
    expect(snippet(sets["forms"]?.source ?? "", "Segmented")).toMatch(
      /^function Segmented\(\) \{\n  const/,
    );
  });
});
