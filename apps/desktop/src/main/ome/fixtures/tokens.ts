// The tokens the sample vault tracks, as they change in a session: added, stopped, a test token deployed. Balances
// read the way the daemon's do in each scenario: a keeper down leaves private balances unreadable, a node down fails
// them.
import type {
  BalanceState,
  DaemonEvent,
  Hex32,
  PaymentRequest,
  PaymentRequestParams,
  ReceivingStatus,
  TokenBalance,
  TokenDeployment,
  TokenInfo,
} from "@ome-labs/api";

import { OmeError } from "../client.ts";
import { AMM, NODE_URL, OMET, USDC, VAULT, sampleHex } from "./sample.ts";
import type { Scenario } from "./scenarios.ts";
import { tokens as base } from "./vault.ts";

const ADDRESS = /^0x[0-9a-f]{64}$/u;
const NETWORK = "aztec:31337:1337000001";

/** Tokens the fixtures can add by address: the two the vault starts with, and JADE for trying an add. */
const KNOWN: TokenInfo[] = [
  OMET,
  USDC,
  {
    address: sampleHex("jade.token"),
    name: "Jade",
    symbol: "JADE",
    decimals: 18,
    standard: true,
  },
];

export class FixtureTokens {
  #tracked: TokenBalance[] = base();
  #tests = 0;
  readonly #emit: (event: DaemonEvent) => void;

  constructor(emit: (event: DaemonEvent) => void) {
    this.#emit = emit;
  }

  /** The balances as the scenario lets the daemon read them. */
  list(scenario: Scenario): TokenBalance[] {
    return this.#tracked.map((entry) => ({
      ...entry,
      private: this.#private(entry.private, scenario),
    }));
  }

  #private(state: BalanceState, scenario: Scenario): BalanceState {
    if (scenario === "keeper-failed") return { state: "unreadable", answered: 0, needed: 2 };
    if (scenario === "node-unreachable")
      return { state: "failed", message: `fetch failed: connect ECONNREFUSED ${NODE_URL}` };
    return state;
  }

  add(token: Hex32, deployment: TokenDeployment | undefined): TokenInfo {
    const address = token.toLowerCase();
    if (!ADDRESS.test(address))
      throw new OmeError("invalid", "a token address is 0x and 64 hex characters");
    if (address === AMM)
      throw new OmeError("invalid", `${address} is not a token: it has no balance_of_private`);
    const known =
      KNOWN.find((t) => t.address === address) ??
      (deployment
        ? {
            address: address as Hex32,
            name: deployment.name,
            symbol: deployment.symbol,
            decimals: deployment.decimals,
            standard: true,
          }
        : undefined);
    if (!known)
      throw new OmeError(
        "invalid",
        `the node has no published contract at ${address}; pass its deployment (salt, deployer, admin, name, symbol, decimals)`,
      );
    this.#tracked = [
      ...this.#tracked.filter((entry) => entry.token.address !== address),
      {
        token: known,
        private: { state: "known", amount: known.symbol === "JADE" ? "1000" : "0" },
        public: { state: "known", amount: "0" },
      },
    ];
    this.#emit({ type: "tokenAdded", vault: VAULT, token: known });
    return known;
  }

  remove(token: Hex32): TokenInfo[] {
    const address = token.toLowerCase();
    this.#tracked = this.#tracked.filter((entry) => entry.token.address !== address);
    this.#emit({ type: "tokenRemoved", vault: VAULT, token: address as Hex32 });
    return this.#tracked.map((entry) => entry.token);
  }

  /** A new Ome Test token with 1,000 minted to the vault, as the daemon deploys on a local network. */
  deployTest(scenario: Scenario): TokenInfo {
    if (scenario === "node-unreachable")
      throw new OmeError("unreachable", "The Aztec node isn't answering.");
    this.#tests += 1;
    const token: TokenInfo = {
      address: sampleHex(`test-token.${this.#tests}`),
      name: "Ome Test",
      symbol: "OMET",
      decimals: 18,
      standard: true,
    };
    this.#tracked = [
      ...this.#tracked,
      {
        token,
        private: { state: "known", amount: "1000000000000000000000" },
        public: { state: "known", amount: "0" },
      },
    ];
    this.#emit({ type: "tokenAdded", vault: VAULT, token });
    this.#emit({ type: "balanceChanged", vault: VAULT, token: token.address });
    return token;
  }

  receiving(lastReceivedAt: number | null): ReceivingStatus {
    return { handshakes: true, senders: 3, lastReceivedAt };
  }

  /** An `ome-pay:` link for the vault, the token and amount in it when given. */
  request({ token, amount, memo }: PaymentRequestParams): PaymentRequest {
    const info = token
      ? this.#tracked.find((entry) => entry.token.address === token.toLowerCase())?.token
      : null;
    if (token && !info) throw new OmeError("invalid", "the vault doesn't track that token");
    if (amount !== undefined && !/^\d+$/u.test(amount))
      throw new OmeError("invalid", "an amount is a whole number of base units");
    if (memo && [...memo].length > 280)
      throw new OmeError("invalid", "a memo is at most 280 characters");
    const query = new URLSearchParams({ v: "0", network: NETWORK });
    if (info) query.set("token", info.address);
    if (amount) query.set("amount", amount);
    if (memo) query.set("memo", memo);
    return {
      uri: `ome-pay:${VAULT}?${query.toString()}`,
      vault: VAULT,
      network: NETWORK,
      token: info ?? null,
      amount: amount ?? null,
      memo: memo ?? null,
    };
  }
}
