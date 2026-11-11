import { Fragment, useCallback, useMemo, useState } from "react";

import { useNavigate, useParams } from "@tanstack/react-router";

import type { Hex32, MembershipPlan, RotationState } from "@ome-labs/api";
import { Banner, Button, CodeBox, fitsQrCode, QrCode, TextField, toast } from "@ome-labs/ui-web";

import { callOme, useOme } from "../data/ome.ts";
import { Page } from "../shell/page.tsx";
import { useWithSigner } from "../shell/signer.tsx";
import { PlanForm } from "./plan-form.tsx";
import { RotationProgress } from "./rotation-progress.tsx";

/**
 * `/vaults/$vault/membership`: adding and removing members and changing the thresholds, which change together in
 * one rotation. A member plans it here and sends the plan to everyone who takes part; each of them begins it from the
 * plan, their keepers share the viewing key anew, and the change lands as a proposal the members approve.
 */
export function ChangeMembersPage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const navigate = useNavigate();
  const status = useOme("status", {});
  const details = useOme("vault.details", { vault });
  const rotations = useOme("membership.list", { vault });
  const summary = status.data?.vaults.find((item) => item.address === vault);
  const [started, setStarted] = useState<RotationState>();
  const [planning, setPlanning] = useState(false);

  const running = useMemo(
    () => (rotations.data ?? []).filter((r) => !r.done && r.plan.id !== started?.plan.id),
    [rotations.data, started],
  );
  const members = useMemo(() => details.data?.committee.members ?? [], [details.data]);
  const me = members.find((m) => m.you)?.name;

  const plan = useCallback(() => setPlanning(true), []);
  const begin = useCallback(async (next: MembershipPlan) => {
    try {
      const state = await callOme("membership.begin", { plan: next.share });
      setStarted(state);
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : String(failure));
    }
  }, []);
  const planned = useCallback((next: MembershipPlan) => void begin(next), [begin]);
  const back = useMemo(
    () => ({
      label: "Members",
      onClick: () => void navigate({ to: "/vaults/$vault/members", params: { vault } }),
    }),
    [navigate, vault],
  );
  const finished = useCallback(() => {
    setStarted(undefined);
    setPlanning(false);
    void navigate({ to: "/vaults/$vault/members", params: { vault } });
  }, [navigate, vault]);

  return (
    <Page
      back={back}
      title="Change members"
      lead="Add or remove members and change the thresholds. Everyone who stays and every newcomer takes part, then the members approve the change like any proposal."
    >
      <div className="flex flex-col gap-6">
        {details.error ? <Banner kind="alarm">{details.error.message}</Banner> : null}

        {running.map((rotation) => (
          <Fragment key={rotation.plan.id}>
            {/* Until the reshare is done, someone may still need the plan: show it again after a reload. */}
            {rotation.steps[0]?.status === "done" ? null : (
              <SharePlan plan={rotation.plan} me={me} />
            )}
            <RotationProgress vault={vault} rotation={rotation} />
          </Fragment>
        ))}

        {started ? (
          <>
            <SharePlan plan={started.plan} me={me} />
            <RotationProgress vault={vault} rotation={started} onDone={finished} />
          </>
        ) : planning && summary && members.length > 0 ? (
          <PlanForm vault={vault} summary={summary} members={members} onPlanned={planned} />
        ) : (
          <div className="flex flex-col gap-4 rounded-lg bg-surface p-6 shadow-1">
            <div className="flex flex-col gap-1">
              <h2 className="type-heading-s text-fg">Plan a change</h2>
              <p className="type-body-s text-fg-muted">
                Remove members, add newcomers from their join requests, or change how many approve
                and read.
              </p>
            </div>
            <div>
              <Button variant="primary" icon="rotate" onClick={plan}>
                Plan a change
              </Button>
            </div>
          </div>
        )}

        {started ? null : <TakePart vault={vault} onStarted={setStarted} />}
      </div>
    </Page>
  );
}

/** The plan to send: it holds no secrets, and every member who stays and every newcomer needs it to take part. */
function SharePlan({ plan, me }: { plan: MembershipPlan; me: string | undefined }) {
  const recipients = plan.next.members.filter((name) => name !== me);
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-surface p-6 shadow-1">
      <div className="flex flex-col gap-1">
        <h2 className="type-heading-s text-fg">Send the plan to {recipients.join(", ")}</h2>
        <p className="type-body-s text-fg-muted">
          Each of them opens Change members and pastes it under "Take part" (a newcomer, in Join an
          existing vault). It holds no secrets. The change goes on once they have.
        </p>
      </div>
      {/* A plan names every member, their keys and the committee: past a few members it outgrows a QR code. */}
      {fitsQrCode(plan.share) ? (
        <div className="flex flex-col items-start gap-5 @2xl:flex-row">
          <QrCode value={plan.share} label="Membership change plan, to scan" size={160} />
          <CodeBox label="Plan" value={plan.share} className="min-w-0 flex-1" />
        </div>
      ) : (
        <CodeBox label="Plan" value={plan.share} />
      )}
    </section>
  );
}

/** A plan another member sent: taking part starts this member's side of the change. */
function TakePart({
  vault,
  onStarted,
}: {
  vault: Hex32;
  onStarted: (state: RotationState) => void;
}) {
  const withSigner = useWithSigner();
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const valid = text.trim().startsWith("ome-rotation-v0:");
  const begin = useCallback(async () => {
    setPending(true);
    setError(undefined);
    try {
      const state = await withSigner(() => callOme("membership.begin", { plan: text.trim() }));
      if (state) {
        if (state.plan.vault !== vault) toast("This plan is for another vault; it runs there.");
        onStarted(state);
        setText("");
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [onStarted, text, vault, withSigner]);
  const submit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (valid) void begin();
    },
    [begin, valid],
  );

  return (
    <section className="flex flex-col gap-3 rounded-lg bg-surface p-6 shadow-1">
      <div className="flex flex-col gap-1">
        <h2 className="type-heading-s text-fg">Take part in a change</h2>
        <p className="type-body-s text-fg-muted">
          Another member planned a change and sent you its plan. Your keeper takes part in sharing
          the viewing key anew; you approve the change once it's proposed.
        </p>
      </div>
      <form className="flex items-start gap-2" onSubmit={submit}>
        <TextField
          label="Plan"
          className="flex-1"
          mono
          placeholder="ome-rotation-v0:…"
          value={text}
          onValueChange={setText}
          error={
            error ?? (text.trim() && !valid ? "A plan starts with ome-rotation-v0:" : undefined)
          }
          disabled={pending}
        />
        <Button type="submit" className="mt-[26px]" pending={pending} disabled={!valid}>
          Take part
        </Button>
      </form>
    </section>
  );
}
