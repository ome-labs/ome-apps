import type { ReactNode } from "react";

/** A page of the flow: its title and lead, then the stage itself. */
export function FlowPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="type-heading-xl text-fg">{title}</h1>
        <p className="type-body-m text-fg-muted">{lead}</p>
      </header>
      {/* The stage's columns follow the page's width, not the window's: the sidebar takes part of it. */}
      <div className="@container">{children}</div>
    </div>
  );
}
