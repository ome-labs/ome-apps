import type { ReactNode } from "react";

/** A page: its title, a lead under it and the page's own actions beside it, then the page itself. */
export function Page({
  title,
  lead,
  actions,
  children,
}: {
  title: string;
  lead?: string | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-7">
      <header className="flex items-end justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="type-heading-xl text-fg">{title}</h1>
          {lead ? <p className="type-body-m text-fg-muted">{lead}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>
      {/* The page's columns follow its own width, not the window's: the sidebar takes part of it. */}
      <div className="@container">{children}</div>
    </div>
  );
}
