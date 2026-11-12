import type { ReactNode } from "react";

import { cn } from "@ome-labs/ui-web";

import { HourChip } from "./hour-chip.tsx";

type HeadBlockProps = {
  hour: string;
  label: string;
  /** The heading; wrap its second phrase in <em> for the italic, sunlit half. */
  title: ReactNode;
  sub?: ReactNode;
  id: string;
  align?: "center" | "start";
  /** Display size: `l` for section heads, `m` beside a panel. */
  size?: "l" | "m";
  className?: string | undefined;
};

/** A section's head: its hour, a serif heading and a line of body, over a soft dark pool for contrast. */
export function HeadBlock({
  hour,
  label,
  title,
  sub,
  id,
  align = "center",
  size = "l",
  className,
}: HeadBlockProps) {
  const centred = align === "center";

  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 md:gap-5",
        centred ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <span
        aria-hidden
        className="scrim pointer-events-none absolute -inset-x-24 -inset-y-16 -z-10 md:-inset-x-48 md:-inset-y-28"
      />
      <HourChip hour={hour} label={label} />
      <h2
        id={id}
        className={cn(
          "sky-text font-display tracking-[-0.01em] text-balance text-white [&_em]:sun-text",
          // The line height follows the size: tailwind-merge drops a leading that comes before a text size.
          size === "l"
            ? "text-[clamp(2.75rem,6.4vw,5.5rem)] leading-[0.98]"
            : "text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.98]",
          centred ? "max-w-[1000px]" : "max-w-[520px]",
        )}
      >
        {title}
      </h2>
      {sub ? (
        <p
          className={cn(
            "sky-text text-base leading-[1.55] text-pretty text-white/95 md:text-[19px]",
            centred ? "max-w-[760px]" : "max-w-[500px]",
          )}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}
