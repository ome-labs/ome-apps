import type { ProposalStatus, ServiceStatus, StepStatus } from "@ome-labs/api";
import {
  connectionStatus,
  proposalStatus,
  serviceStatus,
  stepStatus,
  type Connection,
} from "@ome-labs/format";

import { cn } from "../styling/class-names.ts";
import { toneClasses } from "../styling/tones.ts";

export type StatusBadgeProps = (
  | { kind: "proposal"; status: ProposalStatus }
  | { kind: "service"; status: ServiceStatus }
  | { kind: "step"; status: StepStatus }
  | { kind: "connection"; status: Connection }
) & { className?: string };

/**
 * Page 29's pill. It takes the daemon's status, not a label and a colour, so every screen words and colours a
 * status the same way. The meaning is the tooltip, for members who don't know what "Stale" means.
 */
export function StatusBadge(props: StatusBadgeProps) {
  const display = describe(props);
  const tone = toneClasses[display.tone];

  return (
    <span
      title={display.meaning}
      className={cn(
        // A hairline in the pill's own colour gives the tint a crisp edge on any surface, in both themes.
        "inline-flex items-center gap-1.5 rounded-full py-[3px] pr-[9px] pl-2 type-label-s whitespace-nowrap inset-ring inset-ring-current/15",
        tone.fill,
        tone.text,
        props.className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", tone.dot)} />
      {display.label}
    </span>
  );
}

function describe(props: StatusBadgeProps) {
  switch (props.kind) {
    case "proposal": {
      return proposalStatus(props.status);
    }
    case "service": {
      return serviceStatus(props.status);
    }
    case "step": {
      return stepStatus(props.status);
    }
    case "connection": {
      return connectionStatus(props.status);
    }
  }
}
