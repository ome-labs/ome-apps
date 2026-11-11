import type { ReactNode } from "react";

import { Collapsible } from "@base-ui/react/collapsible";
import type { Review } from "@ome-labs/api";
import {
  canApprove,
  feeLine,
  formatFee,
  proposalMemo,
  proposalSummary,
  reviewChecks,
  shortProposalId,
  voteProgress,
} from "@ome-labs/format";
import { Icon } from "@ome-labs/icons/web";

import { Button } from "../actions/button.tsx";
import { MemberAvatar } from "../identity/member-avatar.tsx";
import { cn } from "../styling/class-names.ts";
import { Address } from "../values/address.tsx";
import { Amount } from "../values/amount.tsx";
import { Hash } from "../values/hash.tsx";
import { AuthwitList, CallList, EffectsList } from "./call-list.tsx";
import { CheckRow } from "./check-row.tsx";

export type ReviewPanelProps = {
  review: Review;
  onApprove?: () => void | undefined;
  onReject?: () => void | undefined;
  /** Replaces the vote buttons, e.g. "Approve on your phone" when a paired phone holds this member's key. */
  actions?: ReactNode | undefined;
  className?: string | undefined;
};

/**
 * Page 34: clear signing. The sections follow `ome approve` in the CLI: what happens, the calls as rebuilt,
 * the checks, the votes so far, and what the signature covers. A failed check disables Approve; Reject stays.
 */
export function ReviewPanel({ review, onApprove, onReject, actions, className }: ReviewPanelProps) {
  const { proposal } = review;
  const checks = reviewChecks(review);
  const approvable = canApprove(review);
  const progress = voteProgress(proposal);

  return (
    <section
      aria-label={`Review proposal ${shortProposalId(proposal.id)}`}
      className={cn("flex flex-col gap-6", className)}
    >
      <Section title="What happens">
        <WhatHappens review={review} />
      </Section>

      {proposal.calls.length > 0 ? (
        <Section title={`Calls, as rebuilt · ${proposal.calls.length}`}>
          <CallList calls={proposal.calls} />
        </Section>
      ) : null}

      {proposal.authwits.length > 0 ? (
        <Section title={`Authwits granted · ${proposal.authwits.length}`}>
          <AuthwitList authwits={proposal.authwits} />
        </Section>
      ) : null}

      {review.simulation.effects ? (
        <Section title="Effects, from the simulation">
          <EffectsList effects={review.simulation.effects} />
        </Section>
      ) : null}

      <Section title="Checks">
        <ul className="flex flex-col">
          {checks.map((check) => (
            <CheckRow key={check.id} state={check.state} label={check.label} />
          ))}
        </ul>
      </Section>

      <Section title={`Votes so far · ${progress.label}`}>
        {proposal.votes.length === 0 ? (
          <p className="type-body-s text-fg-subtle">No votes yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {proposal.votes
              .map((vote) => ({ vote, approved: vote.approve }))
              .map(({ vote, approved }) => (
                <li
                  key={`${approved}-${vote.slot}`}
                  className="flex items-center gap-2 type-body-s text-fg"
                >
                  <MemberAvatar name={vote.name} index={vote.index} size="sm" />
                  <span>{vote.name}</span>
                  <span className={approved ? "text-success" : "text-danger"}>
                    {approved ? "approved" : "rejected"}
                  </span>
                  {vote.reason ? (
                    <span className="truncate text-fg-muted">“{vote.reason}”</span>
                  ) : null}
                  {vote.valid ? null : (
                    <span className="text-danger">signature doesn't verify</span>
                  )}
                </li>
              ))}
          </ul>
        )}
      </Section>

      <Collapsible.Root className="rounded-md bg-surface shadow-1">
        <Collapsible.Trigger className="focus-ring group flex w-full items-center justify-between rounded-md px-3 py-2.5 type-label-m text-fg transition-colors duration-fast ease-standard hover:bg-hover">
          What you sign
          <Icon
            name="chevron-down"
            size={16}
            className="text-fg-subtle transition-transform duration-fast ease-standard group-data-[panel-open]:rotate-180"
          />
        </Collapsible.Trigger>
        <Collapsible.Panel className="flex flex-col gap-2 border-t border-line-subtle px-3 py-2.5">
          <Hash value={review.signs.message} noun="message" full />
          <code className="type-mono-s text-fg-muted [overflow-wrap:anywhere]">
            {review.signs.formula}
          </code>
        </Collapsible.Panel>
      </Collapsible.Root>

      {actions ?? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {approvable ? null : (
            <span className="mr-auto type-caption text-danger">
              A check failed, so this can't be approved. You can still reject it.
            </span>
          )}
          <Button variant="ghost" onClick={onReject}>
            Reject…
          </Button>
          <Button variant="primary" icon="signature" disabled={!approvable} onClick={onApprove}>
            Approve
          </Button>
        </div>
      )}
    </section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="type-overline text-fg-subtle">{title}</h3>
      {children}
    </div>
  );
}

function WhatHappens({ review }: { review: Review }) {
  const { intent, token } = review.proposal;
  const memo = proposalMemo(intent);
  const fee = review.simulation.fee;
  const footer = (
    <>
      {memo ? <p className="type-body-s text-fg-muted">Memo: {memo}</p> : null}
      <p className="type-body-s text-fg-muted">
        Fee: {fee ? `about ${formatFee(fee)}, at most ${formatFee({ fee: fee.maxFee })}. ` : ""}
        {feeLine}
      </p>
    </>
  );

  if (intent.kind !== "transfer") {
    const sentence =
      intent.kind === "cancel"
        ? `${proposalSummary(review.proposal)}, so it can never execute.`
        : intent.kind === "calls"
          ? intent.calls.length === 1 && intent.calls[0]?.fn === "rotate_membership"
            ? "Change the vault's members and thresholds, as the memo says. Your daemon approves it only if it is exactly the change your keeper took part in."
            : `${proposalSummary(review.proposal)} from the vault.`
          : intent.kind === "unknown"
            ? `${proposalSummary(review.proposal)}. Its calls below are what you sign.`
            : review.action || proposalSummary(review.proposal);

    return (
      <div className="flex flex-col gap-2">
        <p className="type-body-m text-fg">{sentence}</p>
        {footer}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 type-body-m text-fg">
        Pay
        {token ? (
          <Amount amount={intent.amount} token={token} size="sm" />
        ) : (
          <span className="type-mono-m">{intent.amount} base units</span>
        )}
        to
        <Address address={intent.to} label={review.recipient} flagAlias />
      </p>
      {token ? (
        <p className="type-mono-s text-fg-subtle">{BigInt(intent.amount).toString()} base units</p>
      ) : null}
      {footer}
    </div>
  );
}
