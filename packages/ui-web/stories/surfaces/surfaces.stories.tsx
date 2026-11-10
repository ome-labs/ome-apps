import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../src/actions/button.tsx";
import { Card, CardHeader, DetailRow } from "../../src/surfaces/card.tsx";
import { EmptyState } from "../../src/surfaces/empty-state.tsx";
import { Scene } from "../../src/surfaces/scene.tsx";
import { ThresholdChip } from "../../src/thresholds/threshold-chip.tsx";
import { Address } from "../../src/values/address.tsx";
import { treasury } from "../sample.ts";

const meta = { title: "Surfaces/Cards, empty states, scenes" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const VaultCard: Story = {
  render: () => (
    <Card className="w-[480px]">
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
  ),
};

export const Empty: Story = {
  render: () => (
    <Card className="w-[480px]">
      <EmptyState illustration="no-proposals" title="Nothing waiting for you." />
    </Card>
  ),
};

export const NoTokens: Story = {
  render: () => (
    <Card className="w-[480px]">
      <EmptyState
        illustration="no-tokens"
        title="No tokens tracked yet"
        action={<Button icon="plus">Add token</Button>}
      >
        Ome shows balances only for tokens you add by contract address.
      </EmptyState>
    </Card>
  ),
};

const steps = ["review", "proving", "sending", "executed"] as const;

function ExecuteScene() {
  const [step, setStep] = useState(0);

  return (
    <div className="flex w-[480px] flex-col gap-3">
      <Scene id={steps[step] ?? "review"} className="aspect-[8/5] rounded-lg" />
      <Button onClick={() => setStep((step + 1) % steps.length)}>Next step</Button>
    </div>
  );
}

/** Page 18's dither dissolve between the execute sequence's scenes. */
export const DitherDissolve: Story = { render: () => <ExecuteScene /> };
