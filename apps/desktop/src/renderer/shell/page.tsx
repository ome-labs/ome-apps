import type { ReactNode } from "react";

import { Button } from "@ome-labs/ui-web";

/** A page: its title, a lead under it and the page's own actions beside it, then the page itself. */
export function Page({
  title,
  lead,
  actions,
  back,
  children,
}: {
  title: string;
  lead?: ReactNode | undefined;
  actions?: ReactNode | undefined;
  /** Where the page came from, above its title: a list the page is one item of. */
  back?: { label: string; onClick: () => void } | undefined;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-7">
      {back ? (
        <Button
          variant="ghost"
          size="sm"
          icon="arrow-left"
          className="-mb-4 self-start"
          onClick={back.onClick}
        >
          {back.label}
        </Button>
      ) : null}
      <header className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="type-heading-xl text-fg">{title}</h1>
          {lead ? <div className="type-body-m text-fg-muted">{lead}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>
      {/* The page's columns follow its own width, not the window's: the sidebar takes part of it. */}
      <div className="@container">{children}</div>
    </div>
  );
}
