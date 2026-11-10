import type { ReactNode } from "react";

import { cn } from "../styling/class-names.ts";

export type StepListProps = {
  /** Names the process for screen readers: "Founding", "Execution". */
  label: string;
  children: ReactNode;
  className?: string | undefined;
};

/** Page 33's step list (founding, execute, membership change): `StepRow`s in order, with hairlines between. */
export function StepList({ label, children, className }: StepListProps) {
  return (
    <ol aria-label={label} className={cn("flex flex-col divide-y divide-line-subtle", className)}>
      {children}
    </ol>
  );
}
