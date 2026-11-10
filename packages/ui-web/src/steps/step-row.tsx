import type { ReactNode } from "react";

import type { StepStatus } from "@ome-labs/api";
import { stepStatus } from "@ome-labs/format";
import { Icon, type IconName } from "@ome-labs/icons/web";

import { cn } from "../styling/class-names.ts";
import { toneClasses } from "../styling/tones.ts";

const icons: Record<StepStatus, IconName> = {
  pending: "clock",
  active: "loader",
  done: "check",
  failed: "x",
};

export type StepRowProps = {
  status: StepStatus;
  label: string;
  /** "round 2 of 3", "waiting for the host", or the failure message. */
  detail?: ReactNode | undefined;
  /** Elapsed time, already formatted ("0.52 s"). The kit shows real time, never a percentage. */
  time?: string | undefined;
  className?: string | undefined;
};

/** Page 33's step: a status badge, the step and its detail, and its time. */
export function StepRow({ status, label, detail, time, className }: StepRowProps) {
  const tone = toneClasses[stepStatus(status).tone];

  return (
    <li
      aria-current={status === "active" ? "step" : undefined}
      className={cn("flex items-center gap-3 py-2.5", className)}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full inset-ring inset-ring-current/15",
          tone.fill,
          tone.text,
          status === "active" && "inset-ring-accent shadow-1",
        )}
      >
        <Icon
          name={icons[status]}
          size={16}
          className={cn("size-3.5", status === "active" && "motion-safe:animate-spin")}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("type-label-m", status === "pending" ? "text-fg-subtle" : "text-fg")}>
          {label}
          <span className="sr-only">, {stepStatus(status).label}</span>
        </span>
        {detail ? (
          <span
            className={cn("type-caption", status === "failed" ? "text-danger" : "text-fg-subtle")}
          >
            {detail}
          </span>
        ) : null}
      </span>
      <span className="type-mono-s text-fg-subtle tabular-nums">
        {time ?? (status === "pending" ? "—" : "")}
      </span>
    </li>
  );
}
