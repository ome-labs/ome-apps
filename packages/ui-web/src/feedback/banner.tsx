import type { ReactNode } from "react";

import { Icon, type IconName } from "@ome-labs/icons/web";
import type { ColorName } from "@ome-labs/tokens";

import { Button } from "../actions/button.tsx";
import { cn } from "../styling/class-names.ts";
import { toneClasses } from "../styling/tones.ts";

const kinds = {
  alarm: { tone: "danger", icon: "alert-circle", colour: "danger" },
  warning: { tone: "warning", icon: "alert-triangle", colour: "warning" },
  info: { tone: "neutral", icon: "info", colour: "neutral" },
  success: { tone: "success", icon: "check-circle", colour: "success" },
} as const satisfies Record<
  string,
  { tone: keyof typeof toneClasses; icon: IconName; colour: ColorName }
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
        "flex items-center gap-3 rounded-[10px] px-4 py-3",
        tone.fill,
        kind === "alarm" && "border border-danger",
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
