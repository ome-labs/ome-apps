import { useMemo } from "react";

import { tokens } from "@ome-labs/tokens";

import { cn } from "../styling/class-names.ts";

// Page 30: four fills that read in both themes, so they come from primitives rather than theme roles.
const palette = [
  { background: tokens.color.primitive["lake/600"], color: tokens.color.primitive["ink/0"] },
  { background: tokens.color.primitive["ink/700"], color: tokens.color.primitive["ink/0"] },
  { background: tokens.color.primitive["sun/200"], color: tokens.color.primitive["ink/900"] },
  { background: tokens.color.primitive["lake/200"], color: tokens.color.primitive["ink/900"] },
];

const sizes = {
  sm: "size-5 text-[10px]",
  md: "size-7 text-xs",
  lg: "size-10 text-[15px]",
} as const;

export type MemberAvatarProps = {
  name: string;
  /** The member's index in the vault (1, 2, 3…), which picks a fill that stays the same on every screen. */
  index: number;
  size?: keyof typeof sizes | undefined;
  className?: string | undefined;
};

/** A member's initial. Decorative: the name always appears beside it. */
export function MemberAvatar({ name, index, size = "md", className }: MemberAvatarProps) {
  const style = useMemo(() => palette[(index - 1 + palette.length) % palette.length], [index]);

  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium",
        sizes[size],
        className,
      )}
    >
      {[...name.trim()][0]?.toUpperCase() ?? "?"}
    </span>
  );
}
