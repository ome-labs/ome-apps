import type { Gas, Review } from "@ome-labs/api";

export type CheckState = "pass" | "fail" | "warning";

export type ReviewCheck = {
  id: "rebuilt" | "config-current" | "not-expired" | "simulation" | "recipient-label";
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
        : `Simulation failed${simulation.error ? `: ${simulation.error}` : ""}`,
    },
  ];

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

  return checks.rebuilt && checks.configCurrent && checks.notExpired;
}

/** Fees are always sponsored; this is the only fee line Ome shows. */
export const feeLine = "Sponsored, not paid by the vault.";

function simulationLabel(gas: Gas | null): string {
  if (!gas) return "Simulation ok";

  const units = new Intl.NumberFormat("en");
  return `Simulation ok (${units.format(gas.da)} DA gas, ${units.format(gas.l2)} L2 gas)`;
}
