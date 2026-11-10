import { useId, useMemo } from "react";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Icon, type IconName } from "@ome-labs/icons/web";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "../styling/class-names.ts";

export type SegmentedControlOption<Value extends string> = {
  value: Value;
  label: string;
  /** Shown before the label, or alone (the label then names it for screen readers and the tooltip). */
  icon?: IconName | undefined;
};

export type SegmentedControlProps<Value extends string> = {
  options: SegmentedControlOption<Value>[];
  /** `sm` is the compact size for toolbars and corners. */
  size?: "sm" | "md" | undefined;
  /** Show only the icons, for a row of well-known choices such as the theme. */
  iconsOnly?: boolean | undefined;
  value: Value;
  onValueChange: (value: Value) => void;
  "aria-label": string;
  className?: string | undefined;
};

/** The thumb glides to the new choice: quick, with a touch of settle, never a bounce. */
const glide = { type: "spring", duration: 0.32, bounce: 0.12 } as const;
const instant = { duration: 0 } as const;

/**
 * Page 27's segmented control: one of a few short choices, such as the network or how long to stay unlocked. The
 * segments share the track's width equally; give it `w-fit` to keep it as narrow as its labels. The chosen segment
 * is a brand-tinted thumb that slides across the track when the choice changes.
 */
export function SegmentedControl<Value extends string>({
  options,
  value,
  onValueChange,
  size = "md",
  iconsOnly = false,
  className,
  ...props
}: SegmentedControlProps<Value>) {
  const pressed = useMemo(() => [value], [value]);
  // One thumb per control, so two controls on a page never trade thumbs.
  const thumb = useId();
  const reduced = useReducedMotion();

  return (
    <ToggleGroup
      value={pressed}
      // A segmented control always has a choice, so pressing the selected segment again keeps it.
      onValueChange={(next) => {
        const [picked] = next;
        if (picked) onValueChange(picked as Value);
      }}
      aria-label={props["aria-label"]}
      className={cn(
        "grid auto-cols-fr grid-flow-col rounded-lg bg-sunken shadow-field",
        size === "sm" ? "gap-0.5 p-0.5" : "gap-1 p-1",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Toggle
            key={option.value}
            value={option.value}
            aria-label={iconsOnly ? option.label : undefined}
            title={iconsOnly ? option.label : undefined}
            className={cn(
              "focus-ring relative flex items-center justify-center gap-1.5 rounded-md whitespace-nowrap",
              size === "sm" ? "h-7 px-2 type-label-s" : "h-8 px-3 type-label-m",
              "transition-[color] duration-fast ease-standard",
              selected ? "text-accent-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {selected ? (
              <motion.span
                layoutId={thumb}
                transition={reduced ? instant : glide}
                aria-hidden
                // The accent's text colour as a hairline: dark in light mode, light in dark mode, so the thumb's
                // edge reads on either track.
                className="absolute inset-0 rounded-md bg-accent-subtle shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-accent-fg)_30%,transparent)]"
              />
            ) : null}
            {option.icon ? (
              <Icon
                name={option.icon}
                size={16}
                className={cn("relative", size === "sm" && "size-3.5")}
              />
            ) : null}
            {iconsOnly ? null : <span className="relative">{option.label}</span>}
          </Toggle>
        );
      })}
    </ToggleGroup>
  );
}
