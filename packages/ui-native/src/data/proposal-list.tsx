import type { ReactElement } from "react";

import type { ProposalView, Recipient } from "@ome-labs/api";
import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import { ProposalRow } from "./proposal-row.tsx";

export type ProposalListProps = {
  proposals: ProposalView[];
  recipients?: Record<string, Recipient | null> | undefined;
  now: number;
  onOpen: (proposal: ProposalView) => void;
  /** Shown when there are none, e.g. an `EmptyState`. */
  empty?: ReactElement | undefined;
};

/** The proposals list on the phone, virtualised with FlashList so long histories scroll smoothly. */
export function ProposalList({ proposals, recipients, now, onOpen, empty }: ProposalListProps) {
  return (
    <FlashList
      data={proposals}
      keyExtractor={(proposal) => proposal.id}
      renderItem={({ item }) => (
        <ProposalRow
          proposal={item}
          recipient={recipients?.[item.id] ?? null}
          now={now}
          onPress={() => onOpen(item)}
        />
      )}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={empty}
    />
  );
}

// Inset to the rows' text, as iOS lists are, so the hairline reads as dividing rows rather than cutting the list.
function Separator() {
  return (
    <View className="bg-surface">
      <View className="ml-4 h-px bg-line-subtle" />
    </View>
  );
}
