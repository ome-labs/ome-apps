import type { ReactNode } from "react";

import { cn } from "@ome-labs/ui-web";

import { ActionRow } from "./action-button.tsx";

/** A gallery tile for a downloadable asset: the asset on its stage, then its name and actions. */
export function AssetTile({
  name,
  caption,
  actions,
  stageClassName,
  className,
  children,
}: {
  name: ReactNode;
  caption?: ReactNode;
  actions: ReactNode;
  stageClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/tile flex min-w-0 flex-col overflow-hidden rounded-xl bg-surface shadow-1 transition-shadow duration-base ease-standard hover:shadow-2",
        className,
      )}
    >
      <div className={cn("flex min-h-36 flex-1 items-center justify-center p-6", stageClassName)}>
        {children}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 border-t border-line-subtle px-3 py-2">
        <div className="flex min-w-32 flex-1 flex-col">
          <span className="truncate type-label-m text-fg">{name}</span>
          {caption ? <span className="truncate type-mono-s text-fg-subtle">{caption}</span> : null}
        </div>
        <ActionRow>{actions}</ActionRow>
      </div>
    </div>
  );
}
