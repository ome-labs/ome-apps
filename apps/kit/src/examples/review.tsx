import { Button, CheckRow, ReviewPanel } from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";
import { omet, reviewOfAuditDeposit, reviewOfSwap } from "../sample/story.ts";

export function Passing() {
  return <ReviewPanel review={reviewOfAuditDeposit} />;
}

export function ContractCalls() {
  return <ReviewPanel review={reviewOfSwap} />;
}

export function OlderConfig() {
  return (
    <ReviewPanel
      review={{
        ...reviewOfAuditDeposit,
        checks: { ...reviewOfAuditDeposit.checks, configCurrent: false },
        proposal: { ...reviewOfAuditDeposit.proposal, currentConfigVersion: 2 },
      }}
    />
  );
}

export function SimulationFailed() {
  return (
    <ReviewPanel
      review={{
        ...reviewOfAuditDeposit,
        simulation: {
          ok: false,
          gas: null,
          error: {
            failure: { kind: "insufficientBalance", token: null, contract: omet.address },
            message: "Assertion failed: Balance too low 'subtracted > 0'",
          },
          effects: null,
          fee: null,
        },
      }}
    />
  );
}

export function OnPhone() {
  return (
    <ReviewPanel
      review={reviewOfAuditDeposit}
      actions={
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="type-body-s text-fg-muted">Approve on your phone (iPhone of Bob)</span>
          <Button icon="phone">Send to phone again</Button>
        </div>
      }
    />
  );
}

export function Checks() {
  return (
    <ul className="w-full max-w-[420px]">
      <CheckRow state="pass" label="Payload rebuilt and matches" />
      <CheckRow state="warning" label="Recipient label is an unverified alias" />
      <CheckRow state="fail" label="Made under an older config" />
    </ul>
  );
}

export const review: ExampleSet = {
  title: "Review",
  description:
    "Bob reviews proposal 3eb2 after Alice approved. Every check must pass before Approve is enabled; Reject always works.",
  examples: [
    { name: "Checks", title: "Check rows", Component: Checks },
    {
      name: "Passing",
      title: "Everything checks out",
      description: "The recipient is an unverified alias, so it carries a warning.",
      Component: Passing,
      wide: true,
    },
    {
      name: "ContractCalls",
      title: "A swap with an authwit",
      description:
        "Contract calls show each decoded argument, the authwit the AMM uses to pull the OMET, and the balances the simulation moves.",
      Component: ContractCalls,
      wide: true,
    },
    {
      name: "OlderConfig",
      title: "Made under an older config",
      description: "Members changed after it was proposed, so it can't be approved.",
      Component: OlderConfig,
      wide: true,
    },
    {
      name: "SimulationFailed",
      title: "Simulation failed",
      Component: SimulationFailed,
      wide: true,
    },
    { name: "OnPhone", title: "Approving on a phone", Component: OnPhone, wide: true },
  ],
};
