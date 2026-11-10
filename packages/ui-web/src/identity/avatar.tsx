import { useMemo } from "react";

import { AvatarArt, type AvatarId } from "@ome-labs/brand/web";
import { tokens } from "@ome-labs/tokens";

import { cn } from "../styling/class-names.ts";

/** What an avatar shows: one of the kit's drawings, an image the member chose, or (without either) their initial. */
export type AvatarSource = { kind: "art"; id: AvatarId } | { kind: "image"; url: string };

export type AvatarProps = {
  /** Whose avatar: the initial when there's no source, and the fill it gets. */
  name: string;
  source?: AvatarSource | undefined;
  /** Profiles are round; vaults are rounded squares. */
  shape?: "circle" | "square" | undefined;
  /** Size in pixels. */
  size?: number | undefined;
  className?: string | undefined;
};

const fills = [
  { backgroundColor: tokens.color.primitive["lake/600"], color: tokens.color.primitive["ink/0"] },
  { backgroundColor: tokens.color.primitive["ink/700"], color: tokens.color.primitive["ink/0"] },
  { backgroundColor: tokens.color.primitive["sun/200"], color: tokens.color.primitive["ink/900"] },
  { backgroundColor: tokens.color.primitive["lake/200"], color: tokens.color.primitive["ink/900"] },
];

/** The same name always gets the same fill. */
function fillFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  return fills[hash % fills.length];
}

/**
 * A profile's or a vault's picture: a kit avatar, an image, or the initial on a steady fill. Decorative: the name
 * always appears beside it.
 */
export function Avatar({ name, source, shape = "circle", size = 28, className }: AvatarProps) {
  const box = useMemo(() => ({ width: size, height: size }), [size]);
  const initial = useMemo(
    () => ({ ...box, ...fillFor(name), fontSize: Math.round(size * 0.42) }),
    [box, name, size],
  );
  const frame = cn(
    "inline-flex shrink-0 items-center justify-center overflow-hidden",
    shape === "circle" ? "rounded-full" : size >= 48 ? "rounded-xl" : "rounded-md",
    // A hairline inside the edge, so pale art and fills hold their shape on white.
    "inset-ring inset-ring-brand-night/10",
    className,
  );

  if (source?.kind === "art") {
    return (
      <span aria-hidden className={frame} style={box}>
        <AvatarArt id={source.id} size={size} alt="" />
      </span>
    );
  }
  if (source?.kind === "image") {
    return (
      <span aria-hidden className={frame} style={box}>
        <img
          src={source.url}
          width={size}
          height={size}
          alt=""
          className="size-full object-cover"
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn(frame, "font-medium bg-linear-to-b from-brand-white/20 to-brand-white/0")}
      style={initial}
    >
      {[...name.trim()][0]?.toUpperCase() ?? "?"}
    </span>
  );
}
