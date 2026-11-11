// The UI guide's sample story comes from `@ome-labs/format/sample`, the one copy the kits' stories also use. This file
// adds what a running daemon would have on top: well-formed ids for the values the story leaves out.
import type { Hex32, Point, TokenInfo } from "@ome-labs/api";
import { accounts, aliases, omet, proposals, treasury } from "@ome-labs/format/sample";

export { omet as OMET };

export const VAULT = treasury.address;

export const ACCOUNTS = {
  alice: accounts.alice,
  bob: accounts.bob,
  carol: accounts.carol,
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

/**
 * 32 stable bytes for a label: FNV-1a with a different seed per 4-byte word. Sample ids need only be well shaped and
 * stable, and plain arithmetic keeps the fixtures running in a browser as well as in Node.
 */
function sampleBytes(label: string): number[] {
  const bytes: number[] = [];
  for (let word = 0; word < 8; word++) {
    let hash = (0x811c9dc5 ^ Math.imul(word + 1, 0x9e3779b1)) >>> 0;
    for (const char of `${word}:${label}`)
      hash = Math.imul(hash ^ char.charCodeAt(0), 0x01000193) >>> 0;
    bytes.push(hash >>> 24, (hash >>> 16) & 0xff, (hash >>> 8) & 0xff, hash & 0xff);
  }
  return bytes;
}

/** A stable, correctly shaped 32-byte hex value for a label, for ids the story doesn't fix. */
export function sampleHex(label: string): Hex32 {
  return `0x${sampleBytes(label)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function samplePoint(label: string): Point {
  return { x: sampleHex(`${label}.x`), y: sampleHex(`${label}.y`) };
}

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** A stable, correctly shaped libp2p peer id (`12D3KooW` + 44 base58 characters) for a label. */
export function samplePeerId(label: string): string {
  const bytes = sampleBytes(`peer:${label}`);
  const tail = Array.from(
    { length: 44 },
    (_, i) => BASE58[(bytes[i % bytes.length] ?? 0) % BASE58.length],
  ).join("");
  return `12D3KooW${tail}`;
}

/** The canonical SponsoredFPC on the local network and Testnet, which pays every transaction. */
export const FEE_PAYER = sampleHex("sponsored-fpc");

/** A second token the vault tracks, for swaps. */
export const USDC: TokenInfo = {
  address: sampleHex("usdc.token"),
  name: "USD Coin",
  symbol: "USDC",
  decimals: 6,
  standard: true,
};

/** An AMM pool of OMET and USDC that `aztec-wallet` deployed as `amm`; the member hasn't registered it yet. */
export const AMM = sampleHex("amm.contract");
