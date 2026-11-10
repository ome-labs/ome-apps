import type { TokenInfo } from "@ome-labs/api";

import { cn } from "../styling/class-names.ts";

const sizes = {
  sm: "size-5 text-[8px]",
  md: "size-7 text-[10px]",
  lg: "size-10 text-[13px]",
} as const;

export type TokenMonogramProps = {
  token: Pick<TokenInfo, "symbol">;
  size?: keyof typeof sizes | undefined;
  className?: string | undefined;
};

/**
 * A token's mark. Tokens carry no logo (the guide forbids pulling one from a token list), so every token gets
 * the same neutral circle with the first two characters of its symbol.
 */
export function TokenMonogram({ token, size = "md", className }: TokenMonogramProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-accent-subtle font-mono font-medium text-accent-fg",
        // A coin's face: lighter at the top, rimmed in its own ink. The wash is fainter in dark, where white
        // over the deep tint would turn it grey.
        "bg-linear-to-b from-brand-white/60 to-brand-white/0 inset-ring inset-ring-current/20 dark:from-brand-white/10",
        sizes[size],
        className,
      )}
    >
      {[...token.symbol].slice(0, 2).join("").toUpperCase()}
    </span>
  );
}
