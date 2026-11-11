// A membership change as it runs on this member's daemon: its five steps, the proposal to approve once it exists,
// and how it ended. The same view serves the planner, the members who take part, and a newcomer.
import { useMemo } from "react";

import type { Hex32, RotationState } from "@ome-labs/api";
import { planChanges, rotationStepLabel, shapeLine, shortProposalId } from "@ome-labs/format";
import { Banner, Button, StatusBadge, StepList, StepRow } from "@ome-labs/ui-web";

import { useOme } from "../data/ome.ts";

/** The latest state of a rotation, refreshed by its `rotation` events. */
export function useRotation(vault: Hex32, initial: RotationState): RotationState {
  const live = useOme("membership.get", { vault, id: initial.plan.id });
  return live.data ?? initial;
}

export function RotationProgress({
  vault,
  rotation: initial,
  joining,
  onDone,
}: {
  vault: Hex32;
  rotation: RotationState;
  /** This member is a newcomer: the members approve, and there is no proposal for them to vote on. */
  joining?: boolean | undefined;
  onDone?: (() => void) | undefined;
}) {
  const rotation = useRotation(vault, initial);
  const changes = useMemo(() => planChanges(rotation.plan), [rotation.plan]);
  const failed = rotation.error !== null;
  const approving = rotation.steps.find((step) => step.id === "approve")?.status === "active";
  const proposalHref = rotation.proposal
    ? `#/vaults/${vault}/proposals/${rotation.proposal}`
    : undefined;

  const openProposal = useMemo(
    () =>
      proposalHref
        ? { label: "Open the proposal", onClick: () => (location.hash = proposalHref.slice(1)) }
        : undefined,
    [proposalHref],
  );

  return (
    <section className="flex flex-col rounded-lg bg-surface px-6 shadow-1">
      <header className="flex items-start justify-between gap-4 border-b border-line-subtle py-4">
        <div className="flex flex-col gap-1">
          <h2 className="type-heading-s text-fg">
            {rotation.done && !failed
              ? joining
                ? "You're a member"
                : "The members changed"
              : joining
                ? "Joining the vault"
                : "Changing members"}
          </h2>
          <p className="type-body-s text-fg-muted">
            {changes.length > 0 ? changes.join(" · ") : shapeLine(rotation.plan.next)}
          </p>
        </div>
        <StatusBadge kind="step" status={failed ? "failed" : rotation.done ? "done" : "active"} />
      </header>
      <StepList label="Membership change" className="py-2">
        {rotation.steps.map((step) => (
          <StepRow
            key={step.id}
            status={step.status}
            label={rotationStepLabel(step.id)}
            detail={
              step.id === "propose" && step.status === "done" && rotation.proposal
                ? `Proposal ${shortProposalId(rotation.proposal)}`
                : step.status === "failed"
                  ? (rotation.error ?? undefined)
                  : (step.detail ?? undefined)
            }
          />
        ))}
      </StepList>
      <div className="flex flex-col gap-3 border-t border-line-subtle py-4">
        {failed ? <Banner kind="alarm">{rotation.error}</Banner> : null}
        {approving && proposalHref && !joining ? (
          <Banner kind="info" action={openProposal}>
            The change is a proposal like any other: {rotation.plan.next.threshold} members approve
            it, then any member executes it. Your daemon checks it does exactly the change your
            keeper took part in before you sign.
          </Banner>
        ) : null}
        {rotation.done && !failed ? (
          <div className="flex items-center justify-between gap-4">
            <p className="type-body-s text-fg-muted">
              The vault now has {shapeLine(rotation.plan.next)}. Removed members can't read anything
              that arrives from now on.
            </p>
            {onDone ? <Button onClick={onDone}>Done</Button> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
