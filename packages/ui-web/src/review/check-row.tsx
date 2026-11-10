import type { CheckState } from "@ome-labs/format";
import { Icon, type IconName } from "@ome-labs/icons/web";
import type { ColorName } from "@ome-labs/tokens";

import { cn } from "../styling/class-names.ts";

const marks: Record<CheckState, { icon: IconName; tone: ColorName; word: string }> = {
  pass: { icon: "check-circle", tone: "success", word: "Passed" },
  warning: { icon: "alert-triangle", tone: "warning", word: "Warning" },
  fail: { icon: "x-circle", tone: "danger", word: "Failed" },
};

export type CheckRowProps = {
  state: CheckState;
  label: string;
  className?: string | undefined;
};

/** Page 34's check: the result as an icon and a word for screen readers, then what was checked. */
export function CheckRow({ state, label, className }: CheckRowProps) {
  const mark = marks[state];

  return (
    <li className={cn("flex items-center gap-2.5 py-2 type-body-s text-fg", className)}>
      <Icon name={mark.icon} size={16} tone={mark.tone} label={mark.word} />
      {label}
    </li>
  );
}
