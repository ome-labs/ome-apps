import { readingHealth } from "@ome-labs/format";
import {
  Address,
  Amount,
  Hash,
  HealthMeter,
  MemberAvatar,
  StatusBadge,
  Tag,
  ThresholdChip,
  TokenMonogram,
  VoteProgress,
} from "@ome-labs/ui-native";
import { View } from "react-native";

import { aliases, daveAlias, omet, peers, proposals, treasury } from "./sample.ts";
import { Specimen } from "./specimen.tsx";

export function Values() {
  return (
    <>
      <Specimen title="Statuses">
        <View className="flex-row flex-wrap gap-2">
          {(
            ["collecting", "ready", "blocked", "executed", "cancelled", "expired", "stale"] as const
          ).map((status) => (
            <StatusBadge key={status} kind="proposal" status={status} />
          ))}
        </View>
        <View className="flex-row flex-wrap gap-2">
          <StatusBadge kind="service" status="running" />
          <StatusBadge kind="service" status="restarting" />
          <StatusBadge kind="connection" status="relayed" />
          <Tag>alias, unverified</Tag>
          <Tag tone="accent">You</Tag>
        </View>
      </Specimen>
      <Specimen title="Members and tokens">
        <View className="flex-row items-center gap-3">
          {peers.map((member) => (
            <MemberAvatar key={member.index} name={member.name} index={member.index} />
          ))}
          <TokenMonogram token={omet} size="lg" />
        </View>
      </Specimen>
      <Specimen title="Addresses (tap to expand)">
        <Address address={treasury.address} />
        <Address address={aliases.dave} label={daveAlias} flagAlias />
        <Hash
          value="0x1ddb736662524cc456ff38ad57cd64ceb0fbd4251d8ed55f27dbb76c5dbdd23c"
          noun="transaction"
        />
      </Specimen>
      <Specimen title="Amounts">
        <Amount amount="1000000000000000000000" token={omet} size="lg" />
        <Amount amount="250000000000000000000" token={omet} baseUnits />
        <Amount amount="1" token={omet} size="sm" />
      </Specimen>
      <Specimen title="Thresholds">
        <View className="flex-row flex-wrap gap-2">
          <ThresholdChip kind="spend" threshold={2} members={3} />
          <ThresholdChip kind="read" threshold={2} members={3} />
        </View>
        <VoteProgress proposal={proposals.designWork} />
        <VoteProgress proposal={proposals.tooLarge} />
        <HealthMeter health={readingHealth({ peers, serving: true, viewingThreshold: 2 })} />
        <HealthMeter health={readingHealth({ peers, serving: false, viewingThreshold: 2 })} />
      </Specimen>
    </>
  );
}
