import type { DaemonParams } from "@ome-labs/api";

import type { RendererMethod } from "../../bridge/contract.ts";
import { useOme } from "../data/ome.ts";
import type { Page } from "./pages.ts";

/** A page that isn't built yet: what it is, where it's specified, and the data it will show. */
export function Placeholder({ page, route }: { page: Page; route: { vault: string; id: string } }) {
  const preview = page.preview?.(route);

  return (
    <section className="mx-auto max-w-4xl space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold">{page.title}</h1>
        <p className="mt-1 text-sm text-neutral-500">UI guide §{page.section} · not built yet</p>
      </header>

      <div>
        <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Daemon methods
        </h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {page.methods.map((method) => (
            <li key={method} className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-xs">
              {method}
            </li>
          ))}
        </ul>
      </div>

      {preview && (
        <Preview method={preview.method} params={preview.params as DaemonParams<RendererMethod>} />
      )}
    </section>
  );
}

function Preview({
  method,
  params,
}: {
  method: RendererMethod;
  params: DaemonParams<RendererMethod>;
}) {
  const result = useOme(method, params);

  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">{method}</h2>
      <pre className="mt-2 max-h-[60vh] overflow-auto rounded border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs">
        {result.isPending
          ? "Loading…"
          : result.isError
            ? `${(result.error as Error & { kind?: string }).kind ?? "error"}: ${result.error.message}`
            : JSON.stringify(result.data, null, 2)}
      </pre>
    </div>
  );
}
