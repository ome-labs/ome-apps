import type { ReactNode } from "react";

import { Illustration, type IllustrationId } from "@ome-labs/brand/web";

import { cn } from "../styling/class-names.ts";

export type EmptyStateProps = {
  illustration?: IllustrationId | undefined;
  title: string;
  children?: ReactNode | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
};

/** Page 39's empty state: a small scene, what's missing, and the one thing to do about it. */
export function EmptyState({ illustration, title, children, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-7 text-center", className)}>
      {/* The title says what the scene shows, so the image is decorative here. */}
      {illustration ? (
        <Illustration id={illustration} alt="" className="h-[120px] w-48 rounded-md object-cover" />
      ) : null}
      <h3 className="type-heading-s text-fg">{title}</h3>
      {children ? <div className="max-w-[360px] type-body-s text-fg-muted">{children}</div> : null}
      {action}
    </div>
  );
}
