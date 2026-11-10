import { ActivityRow, ProposalTable } from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";
import { activity, aliceAccount, daveAlias, now, proposals } from "../sample/story.ts";

export function Proposals() {
  return (
    <ProposalTable
      proposals={[
        proposals.designWork,
        proposals.tooLarge,
        { ...proposals.auditDeposit, status: "executed" },
      ]}
      recipients={{ [proposals.auditDeposit.id]: daveAlias }}
      hrefFor={(proposal) => `#${proposal.id}`}
      now={now}
    />
  );
}

export function Activity() {
  return (
    <ul
      aria-label="Activity"
      className="w-full divide-y divide-line-subtle rounded-lg border border-line-subtle bg-surface"
    >
      {activity.map((entry) => (
        <ActivityRow
          key={`${entry.kind}-${entry.at}`}
          entry={entry}
          now={now}
          names={{ [aliceAccount]: "Alice" }}
        />
      ))}
    </ul>
  );
}

export const data: ExampleSet = {
  title: "Data",
  description:
    "Rows lead with what decides the member's next move: the status and the votes still missing.",
  examples: [
    { name: "Proposals", title: "Proposal table", Component: Proposals, wide: true },
    { name: "Activity", title: "Activity", Component: Activity, wide: true },
  ],
};
