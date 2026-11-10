import { HexValue, type HexValueProps } from "./hex-value.tsx";

export type HashProps = Omit<HexValueProps, "noun"> & {
  /** "transaction", "proposal id", "outer hash"… */
  noun?: string | undefined;
};

/** A transaction hash or id. No explorer link: the guide says Ome has no explorer integration. */
export function Hash({ noun = "hash", ...props }: HashProps) {
  return <HexValue noun={noun} {...props} />;
}
