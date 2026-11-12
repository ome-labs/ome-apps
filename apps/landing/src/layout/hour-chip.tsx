import { Icon } from "@ome-labs/icons/web";

import { isNight } from "../sky/palette.ts";

/** The hour a section shows, with its sun or moon, and the section's name. */
export function HourChip({ hour, label }: { hour: string; label?: string }) {
  const night = isNight(hour);

  return (
    <p className="glass-soft inline-flex w-fit items-center gap-2.5 rounded-full py-1.5 pr-3.5 pl-1.5 shadow-none">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/16 px-2.5 py-1">
        <Icon
          name={night ? "moon" : "sun"}
          size={16}
          className={night ? "text-haze-soft" : "text-amber"}
        />
        <time className="font-mono text-xs text-white">{hour}</time>
      </span>
      {label ? (
        <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-white/90 uppercase">
          {label}
        </span>
      ) : null}
    </p>
  );
}
