import { useCallback, useMemo, useState } from "react";

import { useNavigate, useParams } from "@tanstack/react-router";

import type { Hex32, ProposalView } from "@ome-labs/api";
import { formatExpiry, proposalMemo, proposalSummary, shortProposalId } from "@ome-labs/format";
import { Banner, Button, EmptyState, ReviewPanel, StatusBadge } from "@ome-labs/ui-web";

import { callOme, useOme } from "../data/ome.ts";
import { useNow } from "../shell/now.ts";
import { Page } from "../shell/page.tsx";
import { useWithSigner } from "../shell/signer.tsx";
import { OutcomeCard } from "./outcome-card.tsx";
import { useExecution } from "./use-execution.ts";
import { CancelDialog, RejectDialog } from "./vote-dialogs.tsx";

const OPEN = new Set(["collecting", "ready", "blocked"]);

/** `/vaults/$vault/proposals/$id`: one proposal, rebuilt and checked on this device, to vote on or execute. */
export function ProposalPage() {
  const { vault, id } = useParams({ strict: false }) as { vault: Hex32; id: Hex32 };
  const navigate = useNavigate();
  const now = useNow();
  const ref = useMemo(() => ({ vault, id }), [vault, id]);
  const proposal = useOme("proposals.get", ref);
  const review = useOme("proposals.review", ref);
  const progress = useExecution(id);
  const withSigner = useWithSigner();
  const [dialog, setDialog] = useState<"reject" | "cancel">();
  const [error, setError] = useState<string>();

  const toList = useCallback(
    () => void navigate({ to: "/vaults/$vault/proposals", params: { vault } }),
    [navigate, vault],
  );
  const approve = useCallback(async () => {
    setError(undefined);
    try {
      await withSigner(() => callOme("proposals.approve", ref));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  }, [ref, withSigner]);
  const reject = useCallback(
    async (reason: string) => {
      const done = await withSigner(() =>
        callOme("proposals.reject", {
          ...ref,
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        }),
      );
      if (done) setDialog(undefined);
    },
    [ref, withSigner],
  );
  const cancel = useCallback(async () => {
    const made = await withSigner(() => callOme("proposals.cancel", ref));
    if (!made) return;
    setDialog(undefined);
    await navigate({ to: "/vaults/$vault/proposals/$id", params: { vault, id: made.id } });
  }, [navigate, ref, vault, withSigner]);
  const execute = useCallback(async () => {
    await callOme("proposals.execute", ref);
  }, [ref]);
  const approveClick = useCallback(() => void approve(), [approve]);
  const openReject = useCallback(() => setDialog("reject"), []);
  const openCancel = useCallback(() => setDialog("cancel"), []);
  const closeDialog = useCallback(
    (open: boolean) => setDialog(open ? dialog : undefined),
    [dialog],
  );
  const back = useMemo(() => ({ label: "Proposals", onClick: toList }), [toList]);
  // The review is fetched once; the proposal in it follows the live one, so votes show as they land.
  const reviewed = useMemo(
    () => (review.data && proposal.data ? { ...review.data, proposal: proposal.data } : undefined),
    [proposal.data, review.data],
  );

  if (proposal.error) {
    return (
      <EmptyState
        object="scroll"
        className="pt-16"
        title="No such proposal"
        action={<Button onClick={toList}>Back to proposals</Button>}
      >
        It may belong to another vault, or the link is wrong.
      </EmptyState>
    );
  }
  const current = proposal.data;
  if (!current) return null;

  const open = OPEN.has(current.status);
  const cancellable = open && current.intent.kind !== "cancel" && current.cancelledBy === null;

  return (
    <Page
      back={back}
      title={proposalSummary(current, review.data?.recipient)}
      lead={<Lead proposal={current} now={now} />}
      actions={
        cancellable ? (
          <Button variant="ghost" onClick={openCancel}>
            Cancel proposal…
          </Button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Stacked, where it stands and Execute come first; side by side, they sit on the right. */}
        <OutcomeCard
          proposal={current}
          progress={progress}
          now={now}
          onExecute={execute}
          className="@3xl:col-start-2 @3xl:row-start-1"
        />
        <div className="flex flex-col gap-4 rounded-lg bg-surface p-6 shadow-1 @3xl:col-start-1 @3xl:row-start-1">
          {error ? <Banner kind="alarm">{error}</Banner> : null}
          {current.cancelledBy && current.intent.kind !== "cancel" ? (
            <CancelNote vault={vault} cancel={current.cancelledBy} />
          ) : null}
          {reviewed ? (
            <ReviewPanel
              review={reviewed}
              onApprove={approveClick}
              onReject={openReject}
              actions={voteActions(current)}
            />
          ) : review.error ? (
            <Banner kind="alarm">{review.error.message}</Banner>
          ) : null}
        </div>
      </div>
      <RejectDialog open={dialog === "reject"} onOpenChange={closeDialog} onReject={reject} />
      <CancelDialog
        open={dialog === "cancel"}
        onOpenChange={closeDialog}
        threshold={current.threshold}
        onCancel={cancel}
      />
    </Page>
  );
}

function Lead({ proposal, now }: { proposal: ProposalView; now: number }) {
  const memo = proposalMemo(proposal.intent);
  return (
    <span>
      <StatusBadge kind="proposal" status={proposal.status} className="mr-2 align-middle" />
      <span className="align-middle">
        {memo ? `“${memo}” · ` : ""}from {proposal.proposer.name} ·{" "}
        <span className="type-mono-s">{shortProposalId(proposal.id)}</span>
        {OPEN.has(proposal.status) ? ` · ${formatExpiry(proposal.expiresAt, now)}` : ""}
      </span>
    </span>
  );
}

/** In place of the vote buttons once this member has voted or the proposal is closed; undefined keeps them. */
function voteActions(proposal: ProposalView): React.ReactNode {
  if (!OPEN.has(proposal.status)) return <span hidden />;
  if (proposal.approvedByMe) return <p className="type-body-s text-success">You approved this.</p>;
  if (proposal.rejectedByMe) return <p className="type-body-s text-danger">You rejected this.</p>;
  return undefined;
}

function CancelNote({ vault, cancel }: { vault: Hex32; cancel: Hex32 }) {
  const navigate = useNavigate();
  const action = useMemo(
    () => ({
      label: "Open the cancel",
      onClick: () =>
        void navigate({ to: "/vaults/$vault/proposals/$id", params: { vault, id: cancel } }),
    }),
    [cancel, navigate, vault],
  );
  return (
    <Banner kind="warning" action={action}>
      A member proposed to cancel this. It stops once that cancel has its approvals.
    </Banner>
  );
}
