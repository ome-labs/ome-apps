import { approvalsLabel, toReadLabel } from "@ome-labs/format";
import { Icon } from "@ome-labs/icons/web";

import { cn } from "../styling/class-names.ts";

export type ThresholdChipProps = {
  kind: "spend" | "read";
  threshold: number;
  members: number;
  className?: string | undefined;
};

/** Page 32's chip: "2 of 3 approvals" with a signature, "2 of 3 to read" with an eye. */
export function ThresholdChip({ kind, threshold, members, className }: ThresholdChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-1 pr-2.5 pl-2 type-label-s text-fg whitespace-nowrap",
        className,
      )}
    >
      <Icon
        name={kind === "spend" ? "signature" : "eye"}
        size={16}
        tone="accent-fg"
        className="size-3.5"
      />
      {kind === "spend" ? approvalsLabel(threshold, members) : toReadLabel(threshold, members)}
    </span>
  );
}
