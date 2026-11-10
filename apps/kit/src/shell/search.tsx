import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { useNavigate } from "@tanstack/react-router";

import { Icon } from "@ome-labs/icons/web";
import { Dialog, TextInput, cn } from "@ome-labs/ui-web";

import { loadExampleEntries, matches, pageEntries, type SearchEntry } from "./search-entries.ts";

const limit = 40;

/** ⌘K: jump to a page or a component example. Arrow keys move, Enter opens. */
export function Search({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [examples, setExamples] = useState<SearchEntry[]>([]);
  const input = useRef<HTMLInputElement>(null);

  // Pages are searchable at once; the examples join the first time search opens.
  useEffect(() => {
    if (open && !examples.length) void loadExampleEntries().then(setExamples);
  }, [open, examples.length]);

  // The dialog focuses its close button first; search exists to be typed into, so the field takes focus once the
  // dialog has placed its own.
  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => input.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const results = useMemo(
    () =>
      (query.trim()
        ? [...pageEntries, ...examples].filter((entry) => matches(entry, query))
        : pageEntries
      ).slice(0, limit),
    [query, examples],
  );

  const go = (entry: SearchEntry) => {
    onOpenChange(false);
    setQuery("");
    setActive(0);
    void navigate({ to: entry.to, ...(entry.hash ? { hash: entry.hash } : {}) });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + step + results.length) % Math.max(results.length, 1));
    }

    if (event.key === "Enter") {
      const entry = results[active];
      if (entry) go(entry);
    }
  };

  return (
    <Dialog title="Search the kit" open={open} onOpenChange={onOpenChange} wide>
      <TextInput
        ref={input}
        type="search"
        aria-label="Search pages and examples"
        aria-describedby="kit-search-hint"
        placeholder="Colour, logo, review panel…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
      />
      <p id="kit-search-hint" className="-mt-2 type-caption text-fg-subtle">
        Up and down arrows move through the results; Enter opens the highlighted one.
      </p>
      {results.length ? (
        <ul
          aria-label="Results"
          className="-mx-2 flex max-h-[min(60vh,420px)] flex-col overflow-y-auto"
        >
          {results.map((entry, index) => (
            <li key={entry.id}>
              <button
                type="button"
                onPointerMove={() => setActive(index)}
                onClick={() => go(entry)}
                className={cn(
                  "focus-ring flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left",
                  index === active && "bg-hover",
                )}
              >
                <Icon name={entry.icon} size={16} className="shrink-0 text-fg-subtle" />
                <span className="type-label-m text-fg">{entry.title}</span>
                <span className="min-w-0 flex-1 truncate type-body-s text-fg-subtle">
                  {entry.detail}
                </span>
                <span className="shrink-0 type-caption text-fg-subtle">{entry.group}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-6 text-center type-body-s text-fg-muted">
          Nothing matches “{query}”. Try a component or a page name.
        </p>
      )}
    </Dialog>
  );
}
