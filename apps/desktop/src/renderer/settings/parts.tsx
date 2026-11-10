// The building blocks of the settings page: a section card and the rows inside it.
import type { ReactNode } from "react";

/** One settings page: its title, what it's about, and its rows in a card. */
export function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex flex-col">
      <header className="mb-4 flex flex-col gap-1">
        <h1 id={`${id}-title`} className="type-heading-l text-fg">
          {title}
        </h1>
        {description ? <p className="type-body-s text-fg-muted">{description}</p> : null}
      </header>
      <div className="flex flex-col rounded-lg bg-surface px-5 shadow-1">{children}</div>
    </section>
  );
}

/** One setting: what it is on the left, its value or control on the right; `below` spans the row under both. */
export function Row({
  title,
  description,
  children,
  below,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  below?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line-subtle py-4 last:border-b-0">
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="type-label-m text-fg">{title}</span>
          {description ? <span className="type-body-s text-fg-muted">{description}</span> : null}
        </div>
        {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
      </div>
      {below}
    </div>
  );
}

/** A read-only value in a row, in the mono face when it's compared character by character. */
export function Value({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return (
    <span
      className={mono ? "truncate type-mono-s text-fg-muted" : "truncate type-body-s text-fg-muted"}
    >
      {children}
    </span>
  );
}
