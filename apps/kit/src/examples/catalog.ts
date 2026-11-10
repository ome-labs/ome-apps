import type { ExampleSet, LoadedExampleSet } from "../bench/examples-page.tsx";

// Each domain's examples load with its page: together they hold every ui-web component, which the rest of the kit
// doesn't need up front. The file's own text comes along so each example can show the code that renders it.
const sources = import.meta.glob<string>(["./*.tsx", "!./*.test.tsx"], {
  query: "?raw",
  import: "default",
});

function withSource(file: string, load: () => Promise<ExampleSet>) {
  return async (): Promise<LoadedExampleSet> => {
    const readSource = sources[`./${file}.tsx`];
    if (!readSource) throw new Error(`No source for examples/${file}.tsx`);

    const [set, source] = await Promise.all([load(), readSource()]);
    return { ...set, source };
  };
}

/** Keyed by the last part of the route (`/components/<key>`), in the sidebar's order. */
export const exampleLoaders: Record<string, () => Promise<LoadedExampleSet>> = {
  actions: withSource("actions", async () => (await import("./actions.tsx")).actions),
  forms: withSource("forms", async () => (await import("./forms.tsx")).forms),
  navigation: withSource("navigation", async () => (await import("./navigation.tsx")).navigation),
  status: withSource("status", async () => (await import("./status.tsx")).status),
  identity: withSource("identity", async () => (await import("./identity.tsx")).identity),
  values: withSource("values", async () => (await import("./values.tsx")).values),
  thresholds: withSource("thresholds", async () => (await import("./thresholds.tsx")).thresholds),
  steps: withSource("steps", async () => (await import("./steps.tsx")).steps),
  review: withSource("review", async () => (await import("./review.tsx")).review),
  codes: withSource("codes", async () => (await import("./codes.tsx")).codes),
  feedback: withSource("feedback", async () => (await import("./feedback.tsx")).feedback),
  overlays: withSource("overlays", async () => (await import("./overlays.tsx")).overlays),
  data: withSource("data", async () => (await import("./data.tsx")).data),
  surfaces: withSource("surfaces", async () => (await import("./surfaces.tsx")).surfaces),
  shell: withSource("shell", async () => (await import("./shell.tsx")).shell),
};

/** Every example set, for search and the tests. */
export async function loadExampleSets() {
  const entries = await Promise.all(
    Object.entries(exampleLoaders).map(async ([key, load]) => [key, await load()] as const),
  );

  return Object.fromEntries(entries);
}
