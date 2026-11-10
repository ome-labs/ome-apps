import { useMemo } from "react";

import { Example, type ExampleEntry } from "./example.tsx";
import { Page } from "./page.tsx";
import { snippet } from "./snippet.ts";

export type ExampleSet = {
  title: string;
  description: string;
  examples: ExampleEntry[];
};

/** A set with its file's source text, which the snippets are cut from. */
export type LoadedExampleSet = ExampleSet & { source: string };

/** A component page: every example of one ui-web domain, two to a row on wide screens. */
export function ExamplesPage({ set }: { set: LoadedExampleSet }) {
  const codes = useMemo(() => set.examples.map((entry) => snippet(set.source, entry.name)), [set]);

  return (
    <Page title={set.title} description={set.description}>
      <div className="@container">
        <div className="grid items-start gap-x-6 gap-y-12 @[880px]:grid-cols-2">
          {set.examples.map((entry, index) => (
            <Example key={entry.name} entry={entry} code={codes[index] ?? ""} />
          ))}
        </div>
      </div>
    </Page>
  );
}
