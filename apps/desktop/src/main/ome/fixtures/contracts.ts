// The contracts the sample member can call: the vault's two tokens, and an OMET/USDC AMM that `aztec-wallet` deployed
// as `amm` and the member registers from its artifact. Functions carry the types the daemon reads from an artifact, so
// the composer's fields are built the same way they are against a real daemon.
import type {
  AbiType,
  AbiValue,
  AztecAlias,
  ContractFunction,
  ContractView,
  DecodedArg,
  DecodedCall,
  Hex32,
  IntentCall,
} from "@ome-labs/api";

import { OmeError } from "../client.ts";
import { ACCOUNTS, AMM, FEE_PAYER, OMET, USDC, VAULT, sampleHex } from "./sample.ts";

const ADDRESS: AbiType = {
  kind: "struct",
  path: "aztec::protocol_types::address::aztec_address::AztecAddress",
  fields: [{ name: "inner", type: { kind: "field" } }],
  known: "aztecAddress",
};
const U128: AbiType = { kind: "integer", signed: false, width: 128 };
const FIELD: AbiType = { kind: "field" };

const fn = (
  name: string,
  kind: ContractFunction["kind"],
  params: [string, AbiType][],
): ContractFunction => ({
  name,
  selector: sampleHex(`selector:${name}`).slice(0, 10),
  kind,
  isStatic: false,
  params: params.map(([param, type]) => ({ name: param, type })),
  returns: [],
});

const TOKEN_FUNCTIONS: ContractFunction[] = [
  fn("transfer_in_private", "private", [
    ["from", ADDRESS],
    ["to", ADDRESS],
    ["amount", U128],
    ["authwit_nonce", FIELD],
  ]),
  fn("transfer_to_public", "private", [
    ["from", ADDRESS],
    ["to", ADDRESS],
    ["amount", U128],
    ["authwit_nonce", FIELD],
  ]),
  fn("transfer_in_public", "public", [
    ["from", ADDRESS],
    ["to", ADDRESS],
    ["amount", U128],
    ["authwit_nonce", FIELD],
  ]),
  fn("transfer_to_private", "private", [
    ["to", ADDRESS],
    ["amount", U128],
  ]),
];

const AMM_FUNCTIONS: ContractFunction[] = [
  fn("swap_exact_tokens_for_tokens", "private", [
    ["token_in", ADDRESS],
    ["token_out", ADDRESS],
    ["amount_in", U128],
    ["amount_out_min", U128],
    ["authwit_nonce", FIELD],
  ]),
  fn("swap_tokens_for_exact_tokens", "private", [
    ["token_in", ADDRESS],
    ["token_out", ADDRESS],
    ["amount_out", U128],
    ["amount_in_max", U128],
    ["authwit_nonce", FIELD],
  ]),
  fn("add_liquidity", "private", [
    ["amount0_max", U128],
    ["amount1_max", U128],
    ["amount0_min", U128],
    ["amount1_min", U128],
    ["authwit_nonce", FIELD],
  ]),
  fn("remove_liquidity", "private", [
    ["liquidity", U128],
    ["amount0_min", U128],
    ["amount1_min", U128],
    ["authwit_nonce", FIELD],
  ]),
];

/** Where `aztec-wallet` wrote the AMM's artifact, as its `artifacts:` alias records it. */
export const AMM_ARTIFACT = "/Users/alice/aztec-packages/target/amm_contract-AMM.json";

/** `aztec-wallet`'s aliases: three accounts, the AMM it deployed with its artifact, and USDC. */
export function aztecAliases(): AztecAlias[] {
  return [
    { key: "accounts:alice", value: ACCOUNTS.alice },
    { key: "accounts:bob", value: ACCOUNTS.bob },
    { key: "accounts:dave", value: ACCOUNTS.dave },
    { key: "contracts:amm", value: AMM },
    { key: "artifacts:amm", value: AMM_ARTIFACT },
    { key: `artifacts:${AMM}`, value: AMM_ARTIFACT },
    { key: "artifacts:last", value: AMM_ARTIFACT },
    { key: "contracts:usdc", value: USDC.address },
  ];
}

type Known = { view: ContractView; functions: ContractFunction[] };

const LABELS: Record<Hex32, string> = {
  [VAULT]: "Treasury",
  [ACCOUNTS.alice]: "Alice",
  [ACCOUNTS.bob]: "Bob",
  [ACCOUNTS.carol]: "Carol",
  [ACCOUNTS.dave]: "dave (alias)",
  [AMM]: "AMM",
  [OMET.address]: "OMET",
  [USDC.address]: "USDC",
};

const token = (address: Hex32): Known => ({
  view: {
    address,
    name: "Token",
    classId: sampleHex("token.class"),
    source: "token",
    functions: TOKEN_FUNCTIONS.length,
  },
  functions: TOKEN_FUNCTIONS,
});

export class FixtureContracts {
  #registered = false;

  #known(): Known[] {
    const known = [token(OMET.address), token(USDC.address)];
    if (this.#registered) {
      known.push({
        view: {
          address: AMM,
          name: "AMM",
          classId: sampleHex("amm.class"),
          source: "registered",
          functions: AMM_FUNCTIONS.length,
        },
        functions: AMM_FUNCTIONS,
      });
    }
    return known;
  }

  list(): ContractView[] {
    return this.#known().map((entry) => entry.view);
  }

  functions(address: Hex32, includeUtility: boolean): ContractFunction[] {
    const found = this.#known().find((entry) => entry.view.address === address);
    if (!found)
      throw new OmeError("not-found", `contract ${address} is not registered with this member`);
    return found.functions.filter((f) => includeUtility || f.kind !== "utility");
  }

  /** Only the AMM's artifact is on this sample computer; anything else isn't the code at its address. */
  register(address: Hex32): ContractView {
    if (address !== AMM)
      throw new OmeError("invalid", "this artifact isn't the code of that address");
    this.#registered = true;
    return this.list().find((view) => view.address === AMM) as ContractView;
  }

  remove(address: Hex32): void {
    if (address === AMM) this.#registered = false;
  }

  /** A call as the daemon decodes it, its arguments checked against the function like `proposals.preview`. */
  decode(call: IntentCall): DecodedCall {
    const to = call.to.toLowerCase() as Hex32;
    const found = this.#known().find((entry) => entry.view.address === to);
    if (!found) throw new OmeError("invalid", `contract ${to} is not registered with this member`);
    const f = found.functions.find((candidate) => candidate.name === call.fn);
    if (!f) throw new OmeError("invalid", `${found.view.name} has no function ${call.fn}`);
    if (call.args.length !== f.params.length)
      throw new OmeError(
        "invalid",
        `${f.name} takes ${f.params.length} arguments (${f.params.map((p) => p.name).join(", ")}); ${call.args.length} given`,
      );
    return {
      to,
      toLabel: LABELS[to] ?? null,
      fn: f.name,
      selector: f.selector,
      kind: f.kind,
      args: f.params.map((param, at) => arg(param.name, param.type, call.args[at] as AbiValue)),
      isStatic: false,
      decoded: true,
    };
  }

  /** The fee payer's call, first in every payload: the vault never pays. */
  feeCall(): DecodedCall {
    return {
      to: FEE_PAYER,
      toLabel: "SponsoredFPC",
      fn: "sponsor_unconditionally",
      selector: "0x7a1c0f3e",
      kind: "private",
      args: [],
      isStatic: false,
      decoded: true,
    };
  }
}

/** One argument, checked like the daemon's ABI encoder and labelled when it names someone the member knows. */
function arg(name: string, type: AbiType, value: AbiValue): DecodedArg {
  if (type.kind === "struct" && type.known === "aztecAddress") {
    const text = typeof value === "string" ? value.toLowerCase() : "";
    if (!/^0x[\da-f]{64}$/u.test(text))
      throw new OmeError("invalid", `${name} needs an Aztec address (0x and 64 hex digits)`);
    return { name, type, value: text, display: LABELS[text as Hex32] ?? null };
  }
  if (type.kind === "integer" || type.kind === "field") {
    if (typeof value !== "string" || !/^(0x[\da-f]+|\d+)$/iu.test(value))
      throw new OmeError("invalid", `${name} needs a whole number`);
    if (type.kind === "integer" && BigInt(value) >= 2n ** BigInt(type.width))
      throw new OmeError("invalid", `${name} is larger than a u${type.width}`);
    return { name, type, value, display: null };
  }
  return { name, type, value, display: null };
}
