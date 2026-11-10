import type { ReactNode } from "react";

import { Icon, type IconName } from "@ome-labs/icons/web";
import type { ColorName } from "@ome-labs/tokens";

import { Button } from "../actions/button.tsx";
import { cn } from "../styling/class-names.ts";
import { toneClasses } from "../styling/tones.ts";

// The edge is a hairline in the banner's own colour, so a tint reads as a shape on canvas and surface alike;
// an alarm's is solid, because it has to be noticed.
const kinds = {
  alarm: { tone: "danger", icon: "alert-circle", colour: "danger", edge: "inset-ring-danger" },
  warning: {
    tone: "warning",
    icon: "alert-triangle",
    colour: "warning",
    edge: "inset-ring-warning/25",
  },
  info: { tone: "neutral", icon: "info", colour: "neutral", edge: "inset-ring-neutral/20" },
  success: {
    tone: "success",
    icon: "check-circle",
    colour: "success",
    edge: "inset-ring-success/25",
  },
} as const satisfies Record<
  string,
  { tone: keyof typeof toneClasses; icon: IconName; colour: ColorName; edge: string }
>;

export type BannerProps = {
  kind: keyof typeof kinds;
  children: ReactNode;
  action?: { label: string; onClick: () => void } | undefined;
  className?: string | undefined;
};

/**
 * Page 36's banner, across the top of a vault. An alarm is the keeper refusing to act until a person looks, so
 * it is announced at once and outlined; the others are polite. Banners never animate after they appear.
 */
export function Banner({ kind, children, action, className }: BannerProps) {
  const style = kinds[kind];
  const tone = toneClasses[style.tone];

  return (
    <div
      role={kind === "alarm" ? "alert" : "status"}
      className={cn(
        "flex items-center gap-3 rounded-[10px] px-4 py-3 inset-ring",
        tone.fill,
        style.edge,
        className,
      )}
    >
      <Icon name={style.icon} size={20} tone={style.colour} />
      <div className="min-w-0 flex-1 type-body-s text-fg">{children}</div>
      {action ? (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
