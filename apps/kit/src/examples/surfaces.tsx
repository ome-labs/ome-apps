import { useState } from "react";

import {
  Address,
  Button,
  Card,
  CardHeader,
  DetailRow,
  EmptyState,
  Scene,
  ThresholdChip,
  toast,
} from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";
import { treasury } from "../sample/story.ts";

export function VaultCard() {
  return (
    <Card className="w-full max-w-[480px]">
      <CardHeader
        title={treasury.name}
        subtitle="Founded Nov 9, 2026"
        action={<ThresholdChip kind="spend" threshold={2} members={3} />}
      />
      <dl>
        <DetailRow label="Address">
          <Address address={treasury.address} />
        </DetailRow>
        <DetailRow label="Members to read">2 of 3</DetailRow>
        <DetailRow label="Config version">1</DetailRow>
      </dl>
    </Card>
  );
}

export function Empty() {
  return (
    <Card className="w-full max-w-[480px]">
      <EmptyState illustration="no-proposals" title="Nothing waiting for you." />
    </Card>
  );
}

export function NoTokens() {
  return (
    <Card className="w-full max-w-[480px]">
      <EmptyState
        illustration="no-tokens"
        title="No tokens tracked yet"
        action={
          <Button icon="plus" onClick={() => toast.info("Add token pressed")}>
            Add token
          </Button>
        }
      >
        Ome shows balances only for tokens you add by contract address.
      </EmptyState>
    </Card>
  );
}

const sceneSteps = ["review", "proving", "sending", "executed"] as const;

export function DitherDissolve() {
  const [step, setStep] = useState(0);

  return (
    <div className="flex w-full max-w-[480px] flex-col gap-3">
      <Scene id={sceneSteps[step] ?? "review"} className="aspect-[8/5] rounded-lg" />
      <Button onClick={() => setStep((step + 1) % sceneSteps.length)}>Next step</Button>
    </div>
  );
}

export const surfaces: ExampleSet = {
  title: "Surfaces",
  description:
    "Cards hold one group of content. Empty states say why they're empty and what fills them; scenes change with the dither dissolve.",
  examples: [
    { name: "VaultCard", title: "Card with details", Component: VaultCard },
    { name: "Empty", title: "Empty state", Component: Empty },
    { name: "NoTokens", title: "Empty state with an action", Component: NoTokens },
    {
      name: "DitherDissolve",
      title: "Dither dissolve",
      description: "The execute sequence's scenes; reduced motion swaps them without the dissolve.",
      Component: DitherDissolve,
    },
  ],
};
