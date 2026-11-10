// The UI guide's sample story comes from `@ome-labs/format/sample`, the one copy the kits' stories also use. This file
// adds what a running daemon would have on top: well-formed ids for the values the story leaves out.
import { createHash } from "node:crypto";

import type { Hex32, Point } from "@ome-labs/api";
import { aliases, omet, proposals, treasury } from "@ome-labs/format/sample";

export { omet as OMET };

export const VAULT = treasury.address;

export const ACCOUNTS = {
  alice: "0x51d85d773ad9865e0173d205de87e4dcb016caa9755277583b6815f8aa640d31",
  bob: aliases.bob,
  dave: aliases.dave,
} as const;

export const PROPOSALS = {
  audit: proposals.auditDeposit.id,
  design: proposals.designWork.id,
  large: proposals.tooLarge.id,
} as const;

/** The transfer that funded the vault with 1,000 OMET. */
export const FUNDING_TX = "0xf1ac958104443f60cd437bf3c758411c6e2e01c5f70194d83735020805015338";

/** The vault's members, in index order. Alice is this profile. */
export const MEMBERS = [
  { index: 1, name: "Alice", key: "alice", you: true },
  { index: 2, name: "Bob", key: "bob", you: false },
  { index: 3, name: "Carol", key: "carol", you: false },
] as const;

export const NODE_URL = "http://localhost:8080";

/** A stable, correctly shaped 32-byte hex value for a label, for ids the story doesn't fix. */
export function sampleHex(label: string): Hex32 {
  return `0x${createHash("sha256").update(label).digest("hex")}`;
}

export function samplePoint(label: string): Point {
  return { x: sampleHex(`${label}.x`), y: sampleHex(`${label}.y`) };
}

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** A stable, correctly shaped libp2p peer id (`12D3KooW` + 44 base58 characters) for a label. */
export function samplePeerId(label: string): string {
  const bytes = createHash("sha256").update(`peer:${label}`).digest();
  const tail = Array.from(
    { length: 44 },
    (_, i) => BASE58[(bytes[i % bytes.length] ?? 0) % BASE58.length],
  ).join("");
  return `12D3KooW${tail}`;
}

/** The canonical SponsoredFPC on the local network and Testnet, which pays every transaction. */
export const FEE_PAYER = sampleHex("sponsored-fpc");
