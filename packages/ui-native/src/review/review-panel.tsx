import { useMemo, useState, type ReactNode } from "react";

import type { Review } from "@ome-labs/api";
import { canApprove, feeLine, reviewChecks, shortProposalId, voteProgress } from "@ome-labs/format";
import { Pressable, View } from "react-native";

import { Button } from "../actions/button.tsx";
import { MemberAvatar } from "../identity/member-avatar.tsx";
import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";
import { Address } from "../values/address.tsx";
import { Amount } from "../values/amount.tsx";
import { Hash } from "../values/hash.tsx";
import { CheckRow } from "./check-row.tsx";

export type ReviewPanelProps = {
  review: Review;
  onApprove?: (() => void) | undefined;
  onReject?: (() => void) | undefined;
  className?: string | undefined;
};

/**
 * Page 34 on the phone, the signing device: what happens, the calls, the checks, the votes and what the signature
 * covers, in the CLI's order. A failed check disables Approve; Reject stays.
 */
export function ReviewPanel({ review, onApprove, onReject, className }: ReviewPanelProps) {
  const { proposal } = review;
  const checks = reviewChecks(review);
  const approvable = canApprove(review);
  const progress = voteProgress(proposal);
  const calls = proposal.calls.map((call, position) => ({ call, key: `call-${position + 1}` }));
  const votes = [
    ...proposal.approvals.map((vote) => ({ vote, approved: true, key: `approved-${vote.slot}` })),
    ...proposal.rejections.map((vote) => ({ vote, approved: false, key: `rejected-${vote.slot}` })),
  ];

  return (
    <View
      accessibilityLabel={`Review proposal ${shortProposalId(proposal.id)}`}
      className={cn("gap-6", className)}
    >
      <Section title="What happens">
        <WhatHappens review={review} />
      </Section>

      {calls.length > 0 ? (
        <Section title="Calls, as rebuilt">
          {calls.map(({ call, key }) => (
            <View key={key} className="gap-1 rounded-md bg-sunken px-3 py-2.5">
              <Text className="type-label-m">{call.toLabel ?? "Contract"}</Text>
              <Hash value={call.to} noun="contract" tone="quiet" />
              <Text className="type-mono-s text-fg-muted">{`${call.fn}(${call.args.join(", ")})${call.isStatic ? " · static" : ""}`}</Text>
            </View>
          ))}
        </Section>
      ) : null}

      <Section title="Checks">
        {checks.map((check) => (
          <CheckRow key={check.id} state={check.state} label={check.label} />
        ))}
      </Section>

      <Section title={`Votes so far · ${progress.label}`}>
        {votes.length === 0 ? (
          <Text className="type-body-s text-fg-subtle">No votes yet.</Text>
        ) : null}
        {votes.map(({ vote, approved, key }) => (
          <View key={key} className="flex-row items-center gap-2">
            <MemberAvatar name={vote.name} index={vote.index} size="sm" />
            <Text className="type-body-s">{vote.name}</Text>
            <Text className={cn("type-body-s", approved ? "text-success" : "text-danger")}>
              {approved ? "approved" : "rejected"}
            </Text>
            {vote.reason ? (
              <Text className="shrink type-body-s text-fg-muted">“{vote.reason}”</Text>
            ) : null}
          </View>
        ))}
      </Section>

      <WhatYouSign review={review} />

      <View className="gap-2">
        {approvable ? null : (
          <Text className="type-caption text-danger">
            A check failed, so this can't be approved. You can still reject it.
          </Text>
        )}
        <Button
          variant="primary"
          size="lg"
          icon="signature"
          disabled={!approvable}
          onPress={onApprove}
        >
          Approve
        </Button>
        <Button variant="ghost" size="lg" onPress={onReject}>
          Reject…
        </Button>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text accessibilityRole="header" className="type-overline text-fg-subtle">
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

function WhatHappens({ review }: { review: Review }) {
  const { intent, token } = review.proposal;

  if (intent.kind === "cancel")
    return (
      <Text>{`Cancel proposal ${shortProposalId(intent.cancels)}, so it can never execute.`}</Text>
    );
  if (intent.kind === "calls")
    return (
      <Text>{`Make ${intent.calls.length === 1 ? "1 contract call" : `${intent.calls.length} contract calls`} from the vault.`}</Text>
    );

  return (
    <View className="gap-2">
      <Text className="type-body-s text-fg-muted">Pay</Text>
      {token ? (
        <Amount amount={intent.amount} token={token} size="lg" baseUnits />
      ) : (
        <Text className="type-mono-m">{`${intent.amount} base units`}</Text>
      )}
      <Text className="type-body-s text-fg-muted">to</Text>
      <Address address={intent.to} label={review.recipient} flagAlias />
      {intent.memo ? (
        <Text className="type-body-s text-fg-muted">{`Memo: ${intent.memo}`}</Text>
      ) : null}
      <Text className="type-body-s text-fg-muted">{`Fee: ${feeLine}`}</Text>
    </View>
  );
}

function WhatYouSign({ review }: { review: Review }) {
  const [open, setOpen] = useState(false);
  const state = useMemo(() => ({ expanded: open }), [open]);

  return (
    <View className="rounded-md border border-line-subtle">
      <Pressable
        accessibilityRole="button"
        accessibilityState={state}
        onPress={() => setOpen(!open)}
        className="min-h-11 flex-row items-center justify-between px-3"
      >
        <Text className="type-label-m">What you sign</Text>
        <Text className="type-label-m text-fg-subtle">{open ? "Hide" : "Show"}</Text>
      </Pressable>
      {open ? (
        <View className="gap-2 border-t border-line-subtle px-3 py-2.5">
          <Hash value={review.signs.message} noun="message" full />
          <Text className="type-mono-s text-fg-muted">{review.signs.formula}</Text>
        </View>
      ) : null}
    </View>
  );
}
