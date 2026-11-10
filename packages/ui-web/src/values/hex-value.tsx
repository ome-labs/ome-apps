import { fullHex, shortHex } from "@ome-labs/format";

import { Tooltip } from "../overlays/tooltip.tsx";
import { cn } from "../styling/class-names.ts";
import { CopyButton } from "./copy-button.tsx";

export type HexValueProps = {
  value: string;
  /** What the value is, for the copy button's name and the tooltip: "address", "transaction". */
  noun: string;
  /** Show all 64 digits, wrapped, instead of `0x103b…c2c0`: for review screens and Internals. */
  full?: boolean | undefined;
  copy?: boolean | undefined;
  tone?: "default" | "quiet" | undefined;
  className?: string | undefined;
};

/**
 * A 0x value as the guide writes it: short with the full value on hover and focus, and a copy button that
 * always copies all of it.
 */
export function HexValue({
  value,
  noun,
  full,
  copy = true,
  tone = "default",
  className,
}: HexValueProps) {
  const complete = fullHex(value);
  const colour = tone === "quiet" ? "text-fg-subtle" : "text-fg";

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1", className)}>
      {full ? (
        <span className={cn("type-mono-s [overflow-wrap:anywhere]", colour)}>{complete}</span>
      ) : (
        <Tooltip content={complete} mono>
          <span
            // Focusable so keyboard users can open the tooltip and read the full value.
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            aria-label={`${noun} ${complete}`}
            // A faint fill on hover says there is more to see (the full value in the tooltip).
            className={cn(
              "focus-ring -mx-0.5 rounded-xs px-0.5 type-mono-s whitespace-nowrap transition-colors duration-fast ease-standard hover:bg-hover",
              colour,
            )}
          >
            {shortHex(complete)}
          </span>
        </Tooltip>
      )}
      {copy ? <CopyButton value={complete} label={`Copy ${noun}`} /> : null}
    </span>
  );
}
