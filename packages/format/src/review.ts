import type { Gas, Review } from "@ome-labs/api";

import { formatCount } from "./count.ts";
import { failureText } from "./simulation.ts";

export type CheckState = "pass" | "fail" | "warning";

export type ReviewCheck = {
  id:
    | "rebuilt"
    | "config-current"
    | "not-expired"
    | "simulation"
    | "recipient-label"
    | "review-failure";
  state: CheckState;
  label: string;
};

/** The review's checks in the CLI's order, worded for the review screen. */
export function reviewChecks(
  review: Pick<Review, "checks" | "simulation" | "recipient">,
): ReviewCheck[] {
  const { checks, simulation, recipient } = review;

  const list: ReviewCheck[] = [
    {
      id: "rebuilt",
      state: checks.rebuilt ? "pass" : "fail",
      label: checks.rebuilt
        ? "Payload rebuilt and matches"
        : "Payload doesn't match what was rebuilt",
    },
    {
      id: "config-current",
      state: checks.configCurrent ? "pass" : "fail",
      label: checks.configCurrent ? "Made under the current config" : "Made under an older config",
    },
    {
      id: "not-expired",
      state: checks.notExpired ? "pass" : "fail",
      label: checks.notExpired ? "Not expired" : "Expired",
    },
    // A failed simulation warns rather than blocks: the guide leaves the call to the member.
    {
      id: "simulation",
      state: simulation.ok ? "pass" : "warning",
      label: simulation.ok
        ? simulationLabel(simulation.gas)
        : `Simulation failed${simulation.error ? `: ${failureText(simulation.error.failure)}` : ""}`,
    },
  ];

  if (checks.failure) {
    list.push({ id: "review-failure", state: "fail", label: checks.failure.message });
  }

  if (recipient && recipient.source !== "member") {
    list.push({
      id: "recipient-label",
      state: "warning",
      label: recipient.label ? "Recipient label is an unverified alias" : "Recipient has no label",
    });
  }

  return list;
}

/** A failed check disables Approve; Reject stays available. Warnings never block. */
export function canApprove(review: Pick<Review, "checks">): boolean {
  const { checks } = review;

  return checks.rebuilt && checks.configCurrent && checks.notExpired && !checks.failure;
}

/** Fees are never paid from the vault: a sponsor or the member's own fee payer pays them. */
export const feeLine = "Paid by the fee payer, never from the vault.";

function simulationLabel(gas: Gas | null): string {
  if (!gas) return "Simulation ok";

  return `Simulation ok (${formatCount(gas.da)} DA gas, ${formatCount(gas.l2)} L2 gas)`;
}
