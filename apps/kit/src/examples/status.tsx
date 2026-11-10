import { proposalStatuses } from "@ome-labs/format";
import { StatusBadge, Tag } from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";

export function ProposalStatuses() {
  return (
    <div className="flex flex-wrap gap-2">
      {proposalStatuses.map((status) => (
        <StatusBadge key={status} kind="proposal" status={status} />
      ))}
    </div>
  );
}

export function ServiceStatuses() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {(["stopped", "starting", "running", "restarting", "failed"] as const).map((status) => (
          <StatusBadge key={status} kind="service" status={status} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(["pending", "active", "done", "failed"] as const).map((status) => (
          <StatusBadge key={status} kind="step" status={status} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(["connected", "relayed", "offline"] as const).map((status) => (
          <StatusBadge key={status} kind="connection" status={status} />
        ))}
      </div>
    </div>
  );
}

export function Tags() {
  return (
    <div className="flex flex-wrap gap-2">
      <Tag>alias, unverified</Tag>
      <Tag tone="accent">You</Tag>
      <Tag tone="danger">2 rejected</Tag>
      <Tag tone="warning">Testnet</Tag>
      <Tag tone="success">epoch 1</Tag>
    </div>
  );
}

export const status: ExampleSet = {
  title: "Status",
  description:
    "Badges take the daemon's own status values, so a status can't show with the wrong label or tone.",
  examples: [
    { name: "ProposalStatuses", title: "Proposal statuses", Component: ProposalStatuses },
    {
      name: "ServiceStatuses",
      title: "Keeper, step and connection statuses",
      Component: ServiceStatuses,
    },
    { name: "Tags", title: "Tags", Component: Tags },
  ],
};
