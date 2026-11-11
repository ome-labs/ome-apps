// The sample vault's history: two months of payments from a few senders in OMET and USDC, mixed with its proposals,
// served in pages the way the daemon pages them (newest first, a cursor of the last entry's time and id). Erin was a
// member until she was removed 30 days ago, so the senders who paid before that are exposed to her.
import type {
  ActivityEntry,
  ActivityPage,
  ActivityParams,
  Counterparty,
  CounterpartyPage,
  DaemonEvent,
  Hex32,
  PageParams,
  ProposalView,
  TokenInfo,
} from "@ome-labs/api";

import { ACCOUNTS, FUNDING_TX, OMET, USDC, VAULT, sampleHex } from "./sample.ts";

const DAY = 86_400;
/** When Erin was removed: senders who paid before then can still be recognised by her. */
const REMOVED_DAYS_AGO = 30;

type Received = Extract<ActivityEntry, { kind: "received" }>;

/** Who pays the sample vault, with the aztec-wallet alias the member has for some of them. */
const SENDERS: {
  address: Hex32;
  label: string | null;
  every: number;
  token: TokenInfo;
  amount: bigint;
}[] = [
  { address: ACCOUNTS.alice, label: "alice", every: 9, token: OMET, amount: 250n * 10n ** 18n },
  { address: ACCOUNTS.dave, label: "dave", every: 4, token: USDC, amount: 1_200n * 10n ** 6n },
  {
    address: sampleHex("sender.grants"),
    label: null,
    every: 13,
    token: OMET,
    amount: 5_000n * 10n ** 18n,
  },
  {
    address: sampleHex("sender.payroll"),
    label: "payroll",
    every: 2,
    token: USDC,
    amount: 85n * 10n ** 6n,
  },
  {
    address: sampleHex("sender.newcomer"),
    label: null,
    every: 7,
    token: OMET,
    amount: 42n * 10n ** 18n,
  },
];

/** A cursor for the entry at `at` with `id`, as the daemon encodes its own. */
const cursor = (at: number, id: string) => `${at}:${id}`;

function paged<T>(
  items: T[],
  key: (item: T) => string,
  limit = 50,
  before?: string,
): { items: T[]; next: string | null } {
  const start = before === undefined ? 0 : items.findIndex((item) => key(item) === before) + 1;
  const page = items.slice(start, start + Math.min(Math.max(limit, 1), 500));
  const last = page.at(-1);
  return { items: page, next: last && start + page.length < items.length ? key(last) : null };
}

const entryId = (entry: ActivityEntry) =>
  entry.kind === "received" ? entry.txHash : entry.proposal.id;

export class FixtureHistory {
  #received: Received[];
  #count = 0;
  readonly #emit: (event: DaemonEvent) => void;

  constructor(now: number, emit: (event: DaemonEvent) => void) {
    this.#emit = emit;
    const received: Received[] = [
      {
        kind: "received",
        at: now - 110 * 60,
        token: OMET,
        from: ACCOUNTS.alice,
        amount: "1000000000000000000000",
        txHash: FUNDING_TX,
        block: 1_182,
      },
    ];
    // The newcomer only started paying after Erin left, so it isn't exposed.
    for (const sender of SENDERS) {
      const firstDay = sender.label === null && sender.amount === 42n * 10n ** 18n ? 20 : 60;
      for (let ago = firstDay; ago >= 1; ago -= sender.every) {
        const at = now - ago * DAY - ((sender.every * 3_607) % DAY);
        received.push({
          kind: "received",
          at,
          token: sender.token,
          from: sender.address,
          amount: sender.amount.toString(),
          txHash: sampleHex(`tx.${sender.address}.${ago}`),
          block: 1_182 - ago * 12,
        });
      }
    }
    this.#received = received.toSorted((a, b) => b.at - a.at);
  }

  /** The proposals and payments, newest first, filtered and paged like `vault.activity`. */
  activity(
    proposals: ProposalView[],
    { kinds, token, limit, before }: ActivityParams,
  ): ActivityPage {
    const all: ActivityEntry[] = [
      ...proposals.map((proposal): ActivityEntry => ({
        kind: "proposal",
        at: proposal.createdAt,
        proposal,
      })),
      ...this.#received,
    ]
      .filter((entry) => !kinds || kinds.includes(entry.kind))
      .filter((entry) => {
        if (!token) return true;
        const about =
          entry.kind === "received" ? entry.token.address : entry.proposal.token?.address;
        return about === token.toLowerCase();
      })
      .toSorted((a, b) => b.at - a.at || entryId(a).localeCompare(entryId(b)));
    return paged(all, (entry) => cursor(entry.at, entryId(entry)), limit, before);
  }

  /** Each sender once, latest payment first, with whether a removed member can still recognise them. */
  counterparties(now: number, { limit, before }: PageParams): CounterpartyPage {
    const bySender = new Map<Hex32, Counterparty>();
    for (const entry of this.#received) {
      const known = bySender.get(entry.from);
      const label = SENDERS.find((s) => s.address === entry.from)?.label ?? null;
      bySender.set(entry.from, {
        address: entry.from,
        label: known?.label ?? label,
        received: (known?.received ?? 0) + 1,
        firstAt: Math.min(known?.firstAt ?? entry.at, entry.at),
        lastAt: Math.max(known?.lastAt ?? entry.at, entry.at),
        exposed: false,
      });
    }
    const removedAt = now - REMOVED_DAYS_AGO * DAY;
    const items = [...bySender.values()]
      .map((party) => Object.assign(party, { exposed: party.firstAt < removedAt }))
      .toSorted((a, b) => b.lastAt - a.lastAt);
    return paged(items, (party) => cursor(party.lastAt, party.address), limit, before);
  }

  /** A payment arriving now, with the events the daemon sends for it. */
  receive(now: number, token: TokenInfo = OMET, amount = "75000000000000000000"): Received {
    this.#count += 1;
    const entry: Received = {
      kind: "received",
      at: now,
      token,
      from: sampleHex("sender.newcomer"),
      amount,
      txHash: sampleHex(`tx.live.${this.#count}`),
      block: 1_200 + this.#count,
    };
    this.#received = [entry, ...this.#received];
    this.#emit({
      type: "received",
      vault: VAULT,
      token,
      amount,
      from: entry.from,
      txHash: entry.txHash,
    });
    this.#emit({ type: "balanceChanged", vault: VAULT, token: token.address });
    return entry;
  }

  /** When the sample vault last received a payment. */
  lastReceivedAt(): number | null {
    return this.#received[0]?.at ?? null;
  }
}
