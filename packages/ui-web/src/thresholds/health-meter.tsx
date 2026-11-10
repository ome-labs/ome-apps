import type { ReadingHealth } from "@ome-labs/format";

import { cn } from "../styling/class-names.ts";
import { toneClasses } from "../styling/tones.ts";

export type HealthMeterProps = {
  /** From `readingHealth` in `@ome-labs/format`. */
  health: ReadingHealth;
  className?: string | undefined;
};

/** Page 32's meter for "Can this vault still read?": one segment per member, filled for each keeper answering. */
export function HealthMeter({ health, className }: HealthMeterProps) {
  const tone = toneClasses[health.tone];
  // Fixed segments: their position is their identity.
  const segments = Array.from({ length: health.members }, (_, position) => ({
    key: `keeper-${position + 1}`,
    filled: position < health.answering,
  }));

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span aria-hidden className="flex gap-1">
        {segments.map(({ key, filled }) => (
          <span key={key} className={cn("h-2 w-7 rounded-full", filled ? tone.dot : "bg-line")} />
        ))}
      </span>
      <span className={cn("type-label-s", tone.text)}>{health.label}</span>
    </span>
  );
}
