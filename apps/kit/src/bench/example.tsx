import { useState, type ComponentType } from "react";

import { Button, cn } from "@ome-labs/ui-web";

import { CopyAction } from "./copy-action.tsx";
import { slug } from "./slug.ts";

export type ExampleEntry = {
  /** The example function's name in its file; the snippet is cut from the source by it. */
  name: string;
  title: string;
  description?: string;
  Component: ComponentType;
  /** Wide examples (tables, the app shell) take the full row. */
  wide?: boolean;
};

/** One example: the live component on a surface, then the code that renders it. */
export function Example({ entry, code }: { entry: ExampleEntry; code: string }) {
  const [showCode, setShowCode] = useState(true);
  const id = slug(entry.title);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "flex min-w-0 scroll-mt-20 flex-col gap-2",
        entry.wide && "@[880px]:col-span-2",
      )}
    >
      <div className="flex flex-col gap-0.5 px-1">
        <h2 id={`${id}-title`} className="type-heading-s text-fg">
          {entry.title}
        </h2>
        {entry.description ? (
          <p className="type-body-s text-fg-muted">{entry.description}</p>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-surface shadow-1">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-6 overflow-x-auto p-6 tablet:p-8">
          <entry.Component />
        </div>
        <div className="flex items-center gap-2 border-t border-line-subtle bg-surface px-3 py-1.5">
          <Button size="sm" variant="ghost" icon="code" onClick={() => setShowCode(!showCode)}>
            {showCode ? "Hide code" : "Show code"}
          </Button>
          <span className="flex-1" />
          <CopyAction value={code} label="Copy code" toastLabel={`Copied ${entry.title}`} />
        </div>
        {showCode ? (
          <pre className="max-h-80 overflow-auto border-t border-line-subtle bg-sunken px-5 py-4 type-mono-s text-fg-muted [font-variant-ligatures:none]">
            <code>{code}</code>
          </pre>
        ) : null}
      </div>
    </section>
  );
}
