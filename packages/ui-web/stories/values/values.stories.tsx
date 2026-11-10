import type { Meta, StoryObj } from "@storybook/react-vite";

import { Address } from "../../src/values/address.tsx";
import { Amount } from "../../src/values/amount.tsx";
import { Hash } from "../../src/values/hash.tsx";
import { aliases, daveAlias, executedTx, omet, treasury } from "../sample.ts";

const meta = { title: "Values/Address, hash and amount" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Addresses: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Address address={treasury.address} />
      <Address address={aliases.dave} label={daveAlias} />
      <Address address={aliases.dave} label={daveAlias} flagAlias />
      <Address address={aliases.bob} label={{ label: "Bob", source: "member" }} />
      <Address address={treasury.address} full />
    </div>
  ),
};

export const Hashes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Hash value={executedTx} noun="transaction" />
      <Hash value={executedTx} noun="transaction" full />
    </div>
  ),
};

export const Amounts: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Amount amount="1000000000000000000000" token={omet} size="lg" />
      <Amount amount="250000000000000000000" token={omet} size="md" />
      <Amount amount="40000000000000000000" token={omet} size="sm" />
      <Amount amount="250000000000000000000" token={omet} baseUnits />
    </div>
  ),
};

/** Worst cases: one base unit, and the largest u128, are shown whole. */
export const ExtremeAmounts: Story = {
  render: () => (
    <div className="flex w-72 flex-col items-start gap-4">
      <Amount amount="1" token={omet} size="md" />
      <Amount amount="340282366920938463463374607431768211455" token={omet} size="lg" />
    </div>
  ),
};
