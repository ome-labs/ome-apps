import type { BalanceState, TokenInfo } from "@ome-labs/api";

import { formatAmount } from "./amount.ts";
import type { Tone } from "./tone.ts";

export type BalanceDisplay = {
  /** The amount, or what stands in for it: "Can't read yet", "Couldn't read". */
  text: string;
  /** Why, under it: "1 of 2 keepers answered", the node's error. */
  detail: string | null;
  /** The exact base units, for a known amount. */
  baseUnits: string | null;
  tone: Tone;
};

/**
 * A balance as the daemon read it. A private balance needs enough of the members' keepers to answer, so it can be
 * unreadable for a while; that is a state to explain, not an error.
 */
export function balanceDisplay(
  state: BalanceState,
  token: Pick<TokenInfo, "decimals">,
): BalanceDisplay {
  switch (state.state) {
    case "known":
      return {
        text: formatAmount(state.amount, token.decimals),
        detail: null,
        baseUnits: state.amount,
        tone: "neutral",
      };
    case "unreadable":
      return {
        text: "Can't read yet",
        detail: `${state.answered} of ${state.needed} keepers answered`,
        baseUnits: null,
        tone: "warning",
      };
    case "failed":
      return { text: "Couldn't read", detail: state.message, baseUnits: null, tone: "danger" };
  }
}

/** Whether a balance is a known zero. */
export function isEmptyBalance(state: BalanceState): boolean {
  return state.state === "known" && BigInt(state.amount) === 0n;
}
