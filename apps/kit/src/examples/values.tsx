import { shortHex } from "@ome-labs/format";
import { Address, Amount, CopyButton, Hash } from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";
import { aliases, daveAlias, executedTx, omet, treasury } from "../sample/story.ts";

export function Addresses() {
  return (
    <div className="flex flex-col items-start gap-3">
      <Address address={treasury.address} />
      <Address address={aliases.dave} label={daveAlias} />
      <Address address={aliases.dave} label={daveAlias} flagAlias />
      <Address address={aliases.bob} label={{ label: "Bob", source: "member" }} />
      <Address address={treasury.address} full />
    </div>
  );
}

export function Hashes() {
  return (
    <div className="flex flex-col items-start gap-3">
      <Hash value={executedTx} noun="transaction" />
      <Hash value={executedTx} noun="transaction" full />
    </div>
  );
}

export function Amounts() {
  return (
    <div className="flex flex-col items-start gap-4">
      <Amount amount="1000000000000000000000" token={omet} size="lg" />
      <Amount amount="250000000000000000000" token={omet} size="md" />
      <Amount amount="40000000000000000000" token={omet} size="sm" />
      <Amount amount="250000000000000000000" token={omet} baseUnits />
    </div>
  );
}

export function ExtremeAmounts() {
  return (
    <div className="flex w-full max-w-72 flex-col items-start gap-4">
      <Amount amount="1" token={omet} size="md" />
      <Amount amount="340282366920938463463374607431768211455" token={omet} size="lg" />
    </div>
  );
}

export function Copy() {
  return (
    <span className="flex items-center gap-2 type-mono-s text-fg-muted">
      {shortHex(treasury.address)}
      <CopyButton value={treasury.address} label="Copy address" />
    </span>
  );
}

export const values: ExampleSet = {
  title: "Values",
  description:
    "Ids show as 0x103b…c2c0 with the full value one hover or focus away; amounts are formatted from base units with bigint and never rounded.",
  examples: [
    { name: "Addresses", title: "Addresses", Component: Addresses },
    { name: "Hashes", title: "Hashes", Component: Hashes },
    { name: "Amounts", title: "Amounts", Component: Amounts },
    {
      name: "ExtremeAmounts",
      title: "Worst cases",
      description: "One base unit, and the largest u128, shown whole.",
      Component: ExtremeAmounts,
    },
    {
      name: "Copy",
      title: "Copy button",
      description: "Copies the whole value, then says Copied.",
      Component: Copy,
    },
  ],
};
