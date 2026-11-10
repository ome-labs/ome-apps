import { HexValue, type HexValueProps } from "./hex-value.tsx";

export type HashProps = Omit<HexValueProps, "noun"> & { noun?: string | undefined };

/** A transaction hash or id, with copy. No explorer link: Ome has no explorer integration. */
export function Hash({ noun = "hash", ...props }: HashProps) {
  return <HexValue noun={noun} {...props} />;
}
