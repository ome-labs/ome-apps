import type { ReactNode } from "react";

import { cn } from "../styling/class-names.ts";

export type AppShellProps = {
  topBar: ReactNode;
  sidebar?: ReactNode | undefined;
  /** A banner that belongs above the page, such as a keeper alarm. */
  banner?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
};

/** Page 22's regions: top bar 52, sidebar 240, content up to 960 wide with 40 of padding. */
export function AppShell({ topBar, sidebar, banner, children, className }: AppShellProps) {
  return (
    <div className={cn("flex h-dvh min-h-0 flex-col bg-canvas text-fg", className)}>
      {topBar}
      <div className="flex min-h-0 flex-1">
        {sidebar}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[1040px] flex-col gap-6 px-10 pt-7 pb-10">
            {banner}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export type PageHeaderProps = {
  title: string;
  eyebrow?: string | undefined;
  description?: ReactNode | undefined;
  actions?: ReactNode | undefined;
  className?: string | undefined;
};

/** The heading block at the top of a page, with its main actions at the right. */
export function PageHeader({ title, eyebrow, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-6", className)}>
      <div className="flex max-w-[620px] flex-col gap-1.5">
        {eyebrow ? <span className="type-overline text-fg-subtle">{eyebrow}</span> : null}
        <h1 className="type-heading-xl text-fg">{title}</h1>
        {description ? <div className="type-body-s text-fg-muted">{description}</div> : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </header>
  );
}
