import { useCallback, useState } from "react";

import type { ExecutionPhase, ExecutionProgress, ProposalView } from "@ome-labs/api";
import type { SceneId } from "@ome-labs/brand/web";
import { Scene } from "@ome-labs/brand/web";
import { formatAbsoluteTime, formatExpiry, voteProgress } from "@ome-labs/format";
import { Banner, Button, Hash, StepList, StepRow, VoteProgress, cn } from "@ome-labs/ui-web";

const PHASES: { id: Exclude<ExecutionPhase, "failed">; label: string }[] = [
  { id: "rebuilding", label: "Rebuild the transaction" },
  { id: "proving", label: "Prove it on this device" },
  { id: "sending", label: "Send it to the network" },
  { id: "mined", label: "Included in a block" },
];

const PHASE_WORDS: Record<ExecutionPhase, string> = {
  rebuilding: "rebuilding the transaction",
  proving: "proving it",
  sending: "sending it to the network",
  mined: "included in a block",
  failed: "it failed",
};

/** What the proposal's picture shows: where it is, or the execution's phase while one runs here. */
function sceneFor(proposal: ProposalView, progress: ExecutionProgress | undefined): SceneId {
  if (progress && progress.phase !== "mined" && progress.phase !== "failed") {
    return progress.phase === "sending" ? "sending" : "proving";
  }
  return proposal.status === "unknown" ? "stale" : proposal.status;
}

/** Where the proposal stands and what happens next, with Execute once it has its approvals. */
export function OutcomeCard({
  proposal,
  progress,
  now,
  onExecute,
  className,
}: {
  proposal: ProposalView;
  progress: ExecutionProgress | undefined;
  now: number;
  onExecute: () => Promise<void>;
  className?: string | undefined;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const execute = useCallback(async () => {
    setPending(true);
    setError(undefined);
    try {
      await onExecute();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [onExecute]);

  const running = progress !== undefined && proposal.status === "ready";
  // Another member's daemon claimed the execution: running it here too would only race them.
  const elsewhere = proposal.executing && !proposal.executing.mine ? proposal.executing : null;
  const failed = progress?.phase === "failed" ? progress.error : null;

  return (
    <aside className={cn("flex flex-col gap-5 rounded-lg bg-surface p-5 shadow-1", className)}>
      <Scene
        id={sceneFor(proposal, progress)}
        alt=""
        className="aspect-[16/7] w-full rounded-md object-cover @3xl:aspect-[16/10]"
      />
      <VoteProgress proposal={proposal} />
      {running ? (
        <StepList label="Executing" className="-my-1">
          {PHASES.map((phase, index) => (
            <StepRow
              key={phase.id}
              status={stepStatus(index, progress.phase)}
              label={phase.label}
            />
          ))}
        </StepList>
      ) : elsewhere && elsewhere.phase !== "failed" ? (
        <Text>
          {elsewhere.member.name} is executing it: {PHASE_WORDS[elsewhere.phase]}. It shows here as
          soon as it lands.
        </Text>
      ) : (
        <Explanation proposal={proposal} now={now} />
      )}
      {failed ? <Banner kind="alarm">{failed}</Banner> : null}
      {error ? <Banner kind="alarm">{error}</Banner> : null}
      {proposal.status === "ready" &&
      (!running || failed) &&
      !(elsewhere && elsewhere.phase !== "failed") ? (
        <Button variant="primary" icon="play" onClick={execute} pending={pending}>
          {failed ? "Try again" : "Execute"}
        </Button>
      ) : null}
    </aside>
  );
}

function stepStatus(
  index: number,
  phase: ExecutionPhase,
): "pending" | "active" | "done" | "failed" {
  if (phase === "mined") return "done";
  const at = PHASES.findIndex((item) => item.id === phase);
  if (phase === "failed") return "pending";
  return index < at ? "done" : index === at ? "active" : "pending";
}

function Explanation({ proposal, now }: { proposal: ProposalView; now: number }) {
  const progress = voteProgress(proposal);
  const more = progress.needed - progress.approvals;
  switch (proposal.status) {
    case "collecting":
      return (
        <Text>
          Waiting for {more} more {more === 1 ? "approval" : "approvals"}.{" "}
          {formatExpiry(proposal.expiresAt, now).replace(/^e/, "E")}.
        </Text>
      );
    case "ready":
      return (
        <Text>
          It has its approvals. Any member can execute it; proving takes a minute on this device.
        </Text>
      );
    case "blocked":
      return (
        <Text>Too many members rejected it, so it can't pass. Cancel it, or let it expire.</Text>
      );
    case "executed":
      return proposal.execution ? (
        <div className="flex flex-col gap-1.5">
          <Text>
            Executed {formatAbsoluteTime(proposal.execution.at)}
            {proposal.execution.executor ? ` by ${proposal.execution.executor.name}` : ""}
            {proposal.execution.block === null ? "" : `, in block ${proposal.execution.block}`}.
          </Text>
          <Hash value={proposal.execution.txHash} noun="transaction" />
        </div>
      ) : (
        <Text>Executed.</Text>
      );
    case "cancelled":
      return <Text>The members cancelled it. Nothing was sent.</Text>;
    case "expired":
      return <Text>It expired before it was executed. Nothing was sent.</Text>;
    case "stale":
      return (
        <Text>
          The vault's members or thresholds changed after it was made, so it can't run. Propose it
          again.
        </Text>
      );
    case "unknown":
      return (
        <Text>A newer release of Ome gave it a status this one doesn't know. Update Ome.</Text>
      );
  }
}

function Text({ children }: { children: React.ReactNode }) {
  return <p className="type-body-s text-fg-muted">{children}</p>;
}
