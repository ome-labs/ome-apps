import { StepList, StepRow } from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";

export function Founding() {
  return (
    <StepList label="Founding" className="w-full max-w-[420px]">
      <StepRow status="done" label="Agree on the plan" time="4.1 s" />
      <StepRow
        status="active"
        label="Generate the shared key"
        detail="round 2 of 3"
        time="0.52 s"
      />
      <StepRow status="pending" label="Derive the vault" />
      <StepRow status="pending" label="Register with your keeper" />
      <StepRow status="pending" label="Deploy the vault" detail="the host deploys" />
      <StepRow status="pending" label="Verify on chain" />
    </StepList>
  );
}

export function Execution() {
  return (
    <StepList label="Execution" className="w-full max-w-[420px]">
      <StepRow status="done" label="Rebuilding" time="0.21 s" />
      <StepRow
        status="active"
        label="Proving"
        detail="This can take a while with real proofs."
        time="38 s"
      />
      <StepRow status="pending" label="Sending" />
      <StepRow status="pending" label="Mined" />
    </StepList>
  );
}

export function Failed() {
  return (
    <StepList label="Founding" className="w-full max-w-[420px]">
      <StepRow status="done" label="Agree on the plan" time="4.1 s" />
      <StepRow
        status="failed"
        label="Generate the shared key"
        detail="Keeper 3 did not answer"
        time="30 s"
      />
    </StepList>
  );
}

export const steps: ExampleSet = {
  title: "Steps",
  description: "Long operations show each step with its status and how long it took.",
  examples: [
    { name: "Founding", title: "Founding, part way", Component: Founding },
    { name: "Execution", title: "Execution", Component: Execution },
    { name: "Failed", title: "A failed step", Component: Failed },
  ],
};
