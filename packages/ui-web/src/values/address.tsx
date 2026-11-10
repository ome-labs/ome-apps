import type { Recipient } from "@ome-labs/api";
import { aliasName } from "@ome-labs/format";

import { Tag } from "../status/tag.tsx";
import { cn } from "../styling/class-names.ts";
import { HexValue } from "./hex-value.tsx";

export type AddressProps = {
  address: string;
  /** Where a name for this address came from. Members are trusted; `aztec-wallet` aliases are not. */
  label?: Pick<Recipient, "label" | "source"> | null | undefined;
  /** Mark aliases as unverified. The guide requires it on review screens. */
  flagAlias?: boolean | undefined;
  full?: boolean | undefined;
  copy?: boolean | undefined;
  className?: string | undefined;
};

/** Page 31's address: a name when Ome has one, then the address, quieter when it follows a name. */
export function Address({ address, label, flagAlias, full, copy, className }: AddressProps) {
  const isAlias = label?.source === "aztecWallet";
  const name = label?.label ? (isAlias ? aliasName(label.label) : label.label) : null;

  return (
    <span
      className={cn("inline-flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5", className)}
    >
      {name ? <span className="truncate type-label-m text-fg">{name}</span> : null}
      {/* Review screens show the alias as aztec-wallet stores it, so the member can check it there. */}
      {name && isAlias && flagAlias ? (
        <>
          <span className="type-mono-s text-fg-muted">{label?.label}</span>
          <Tag>alias, unverified</Tag>
        </>
      ) : null}
      <HexValue
        value={address}
        noun="address"
        full={full}
        copy={copy}
        tone={name ? "quiet" : "default"}
      />
    </span>
  );
}
