// The sample data set of the desktop UI guide (`research/desktop/ui-guide.md` §4): one consistent story used by every
// screen. Ids marked there as samples are random but shaped like real ones.
import { createHash } from "node:crypto";

import type { Hex32, Point, TokenInfo } from "@ome-labs/api";

/** A stable, correctly shaped 32-byte hex value for a label, for ids the guide does not fix. */
export function sampleHex(label: string): Hex32 {
  return `0x${createHash("sha256").update(label).digest("hex")}`;
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

export function samplePoint(label: string): Point {
  return { x: sampleHex(`${label}.x`), y: sampleHex(`${label}.y`) };
}

export const VAULT = "0x103b470145425638c8644547f39d59f049462c4fbdbc73f32370e01dd681c2c0";

export const ACCOUNTS = {
  alice: "0x51d85d773ad9865e0173d205de87e4dcb016caa9755277583b6815f8aa640d31",
  bob: "0xf941c4735ce50ad8c02af5f5c93ddcff7b407e8280d5db69a176ab61cb7e12b3",
  carol: "0x486fc0f8b8bbd5ea40adb8982ff22385329eb463caca0b8df0e69cc5708318c9",
  dave: "0xf461280a4b44f5e076c9b6126eb5151d1f0b2e960584b9a076a2ef18206e688d",
} as const;

/** The local network's test token: what `tokens.deployTest` creates. */
export const OMET: TokenInfo = {
  address: "0x48db25675e60f5e24dbb1d20e8b8785778fb7916ccc90a5db56d0791df8f0e6e",
  name: "Ome Test",
  symbol: "OMET",
  decimals: 18,
};

/** 10^18: one whole OMET in base units. */
const UNIT = 10n ** 18n;

export function omet(whole: bigint): string {
  return String(whole * UNIT);
}

export const PROPOSALS = {
  audit: "0x3eb249d153a0261561843753619e852e85b986a62c8344a7c4152d55a7cae857",
  design: "0x335cae45e39eeefa41c875f9a0067945e02c595b78ff42f08831a4b9c3a89850",
  large: "0x868c7cc9d6420ae9832b4c24a4867bc3c1248f1072499fe4d42cf4bb49aeb092",
} as const;

export const TXS = {
  auditExecuted: "0x1ddb736662524cc456ff38ad57cd64ceb0fbd4251d8ed55f27dbb76c5dbdd23c",
  funded: "0xf1ac958104443f60cd437bf3c758411c6e2e01c5f70194d83735020805015338",
} as const;

/** The vault's members, in index order. Alice is this profile. */
export const MEMBERS = [
  { index: 1, name: "Alice", key: "alice", you: true },
  { index: 2, name: "Bob", key: "bob", you: false },
  { index: 3, name: "Carol", key: "carol", you: false },
] as const;

/** The canonical SponsoredFPC on the local network and Testnet, which pays every transaction. */
export const FEE_PAYER = sampleHex("sponsored-fpc");

export const NODE_URL = "http://localhost:8080";
