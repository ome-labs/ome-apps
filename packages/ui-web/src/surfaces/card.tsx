import type { ComponentProps, ReactNode } from "react";

import { cn } from "../styling/class-names.ts";

/** Page 39's card: the surface every group of content sits on. */
export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-line-subtle bg-surface p-5",
        className,
      )}
      {...props}
    />
  );
}

export type CardHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode | undefined;
  /** A button or chip at the right. */
  action?: ReactNode | undefined;
  className?: string | undefined;
};

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex flex-col gap-0.5">
        <h2 className="type-heading-s text-fg">{title}</h2>
        {subtitle ? <p className="type-caption text-fg-subtle">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

/** A label and value row with a hairline under it, for details such as a vault's settings. */
export function DetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-line-subtle py-2.5 last:border-b-0",
        className,
      )}
    >
      <dt className="type-body-s text-fg-muted">{label}</dt>
      <dd className="min-w-0 type-body-s text-fg">{children}</dd>
    </div>
  );
}
