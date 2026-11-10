import type { ReactNode } from "react";

import { cn } from "@ome-labs/ui-web";

import { slug } from "./slug.ts";

/** A kit page: a serif title that names the topic, a sentence on how to use the page, then sections. */
export function Page({
  title,
  description,
  actions,
  className,
  children,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[1120px] flex-col gap-14 px-4 pt-10 pb-24 tablet:px-10",
        className,
      )}
    >
      <header className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h1 className="type-display-m text-fg">{title}</h1>
          {description ? (
            <p className="max-w-[640px] type-body-m text-pretty text-fg-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      <div className="flex flex-col gap-16">{children}</div>
    </div>
  );
}

/** A titled part of a page, linkable by its heading. */
export function Section({
  title,
  description,
  aside,
  className,
  children,
}: {
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const id = slug(title);

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-20 flex-col gap-5">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2 border-b border-line-subtle pb-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 id={`${id}-title`} className="group/heading type-heading-m text-fg">
            <a href={`#${id}`} className="focus-ring rounded-xs">
              {title}
              <span
                aria-hidden
                className="ml-2 text-fg-disabled opacity-0 transition-opacity duration-fast group-hover/heading:opacity-100"
              >
                #
              </span>
            </a>
          </h2>
          {description ? (
            <p className="max-w-[720px] type-body-s text-fg-muted">{description}</p>
          ) : null}
        </div>
        {aside}
      </div>
      <div className={className}>{children}</div>
    </section>
  );
}

/** A labelled tile that holds one specimen. */
export function Specimen({
  label,
  className,
  children,
}: {
  label?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div
        className={cn(
          "flex min-h-24 flex-wrap items-center gap-3 rounded-xl bg-surface p-5 shadow-1",
          className,
        )}
      >
        {children}
      </div>
      {label ? <div className="px-1 type-mono-s text-fg-subtle">{label}</div> : null}
    </div>
  );
}

/** The filter bar above a gallery; it stays under the header while the gallery scrolls. */
export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-[52px] z-10 -mx-4 flex flex-wrap items-center gap-3 border-b border-line-subtle bg-canvas/90 px-4 py-3 backdrop-blur-md tablet:-mx-10 tablet:px-10">
      {children}
    </div>
  );
}
