// Planning a membership change: who leaves, who joins (by their join requests) and the new thresholds. The daemon
// checks the plan as it changes against the rules a rotation must keep, and the panel beside the form says what the
// plan does, who deals the new shares, and the risks of the thresholds it would set.
import { type ReactNode, useCallback, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import type {
  CommitteeMember,
  Hex32,
  MembershipParams,
  MembershipPlan,
  VaultSummary,
} from "@ome-labs/api";
import { planChanges, shapeLine, shortHex, thresholdRisks } from "@ome-labs/format";
import {
  Banner,
  Button,
  Checkbox,
  Dialog,
  MemberAvatar,
  NumberStepper,
  Tag,
  TextField,
  TextInput,
} from "@ome-labs/ui-web";

import { callOme } from "../data/ome.ts";
import { useDebounced } from "../proposals/use-debounced.ts";

const JOIN = /^ome-join-v0:\S{16,}$/u;

export function PlanForm({
  vault,
  summary,
  members,
  onPlanned,
}: {
  vault: Hex32;
  summary: VaultSummary;
  members: CommitteeMember[];
  onPlanned: (plan: MembershipPlan) => void;
}) {
  const [remove, setRemove] = useState<number[]>([]);
  const [requests, setRequests] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [threshold, setThreshold] = useState(summary.threshold);
  const [viewingThreshold, setViewingThreshold] = useState(summary.viewingThreshold);
  const size = members.length - remove.length + requests.length;
  const changed =
    remove.length > 0 ||
    requests.length > 0 ||
    threshold !== summary.threshold ||
    viewingThreshold !== summary.viewingThreshold;

  const params = useMemo<MembershipParams>(
    () => ({ vault, remove, add: requests, threshold, viewingThreshold }),
    [remove, requests, threshold, viewingThreshold, vault],
  );
  const settled = useDebounced(changed ? JSON.stringify(params) : undefined, 300);
  const plan = useQuery({
    queryKey: ["membership.plan", settled],
    queryFn: () => callOme("membership.plan", JSON.parse(settled as string) as MembershipParams),
    enabled: settled !== undefined,
    placeholderData: (previous) => previous,
  });
  const current = changed && settled === JSON.stringify(params) ? plan.data : undefined;
  const checking = changed && (settled !== JSON.stringify(params) || plan.isFetching);

  const toggle = useCallback(
    (index: number, leaves: boolean) =>
      setRemove((now) => (leaves ? [...now, index] : now.filter((i) => i !== index))),
    [],
  );
  const addRequest = useCallback(() => {
    const text = draft.trim();
    if (!JOIN.test(text) || requests.includes(text)) return;
    setRequests((now) => [...now, text]);
    setDraft("");
  }, [draft, requests]);
  const dropRequest = useCallback(
    (text: string) => setRequests((now) => now.filter((r) => r !== text)),
    [],
  );
  // A smaller vault pulls the thresholds down with it, so the form never asks for an impossible one.
  const clamp = useCallback((next: number) => {
    setThreshold((t) => Math.min(t, next));
    setViewingThreshold((t) => Math.min(t, next));
  }, []);
  const toggleAndClamp = useCallback(
    (index: number, leaves: boolean) => {
      toggle(index, leaves);
      clamp(members.length - (remove.length + (leaves ? 1 : -1)) + requests.length);
    },
    [clamp, members.length, remove.length, requests.length, toggle],
  );
  const submitRequest = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      addRequest();
    },
    [addRequest],
  );
  const draftOk = JOIN.test(draft.trim());
  const draftError =
    draft.trim() && !draftOk ? "A join request starts with ome-join-v0:" : undefined;

  return (
    <div className="grid grid-cols-1 items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col rounded-lg bg-surface px-6 shadow-1">
        <Block
          title="Who leaves"
          hint={`At most ${summary.viewingThreshold - 1} in one change, and ${summary.viewingThreshold} must stay to share the viewing key anew.`}
        >
          <ul className="flex flex-col">
            {members.map((member) => (
              <li key={member.identity} className="flex items-center gap-3 py-2">
                <MemberAvatar name={member.name} index={member.index} size="sm" />
                <span className="flex-1 type-label-m text-fg">
                  {member.name}
                  {member.you ? (
                    <span className="ml-1.5 type-caption text-fg-subtle">you</span>
                  ) : null}
                </span>
                {member.you ? (
                  <span className="type-caption text-fg-subtle">
                    To leave, ask another member to plan it
                  </span>
                ) : (
                  <LeaveBox
                    member={member}
                    checked={remove.includes(member.index)}
                    onChange={toggleAndClamp}
                  />
                )}
              </li>
            ))}
          </ul>
        </Block>

        <Block
          title="Who joins"
          hint="Each newcomer makes a join request in Ome (Join an existing vault) and sends it to you."
        >
          {requests.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {requests.map((request) => {
                const joiner = current?.joiners[requests.indexOf(request)];
                return (
                  <JoinerRow
                    key={request}
                    request={request}
                    name={joiner?.name}
                    account={joiner?.account}
                    onDrop={dropRequest}
                  />
                );
              })}
            </ul>
          ) : null}
          <form className="flex items-start gap-2" onSubmit={submitRequest}>
            <div className="flex flex-1 flex-col gap-1">
              <TextInput
                aria-label="Join request"
                mono
                placeholder="ome-join-v0:…"
                value={draft}
                onValueChange={setDraft}
                aria-invalid={Boolean(draftError) || undefined}
              />
              {draftError ? <span className="type-caption text-danger">{draftError}</span> : null}
            </div>
            <Button type="submit" icon="user-plus" disabled={!draftOk}>
              Add
            </Button>
          </form>
        </Block>

        <Block title="Thresholds" hint={`For the ${size} members after the change.`}>
          <Setting label="Approvals to spend" of={size}>
            <NumberStepper
              aria-label="Approvals to spend"
              value={threshold}
              min={1}
              max={Math.max(1, size)}
              onValueChange={setThreshold}
            />
          </Setting>
          <Setting label="Keepers to read" of={size}>
            <NumberStepper
              aria-label="Keepers to read"
              value={viewingThreshold}
              min={2}
              max={Math.max(2, size)}
              onValueChange={setViewingThreshold}
            />
          </Setting>
        </Block>

        {plan.error ? (
          <Banner kind="alarm" className="mb-4">
            {plan.error.message}
          </Banner>
        ) : null}
        <div className="flex items-center justify-end gap-2 py-4">
          <ConfirmPlan
            summary={summary}
            plan={current}
            disabled={!current || current.failure !== null || checking}
            onConfirmed={onPlanned}
          />
        </div>
      </div>

      <PlanCheck plan={changed ? current : undefined} members={members} checking={checking} />
    </div>
  );
}

function Block({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b border-line-subtle py-5">
      <header className="flex flex-col gap-0.5">
        <h3 className="type-label-m text-fg">{title}</h3>
        <p className="type-body-s text-fg-muted">{hint}</p>
      </header>
      {children}
    </section>
  );
}

function Setting({ label, of, children }: { label: string; of: number; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex flex-col">
        <span className="type-body-s text-fg">{label}</span>
        <span className="type-caption text-fg-subtle">of {of}</span>
      </span>
      {children}
    </div>
  );
}

function LeaveBox({
  member,
  checked,
  onChange,
}: {
  member: CommitteeMember;
  checked: boolean;
  onChange: (index: number, leaves: boolean) => void;
}) {
  const change = useCallback(
    (next: boolean) => onChange(member.index, next),
    [member.index, onChange],
  );
  return <Checkbox label="Remove" checked={checked} onCheckedChange={change} />;
}

function JoinerRow({
  request,
  name,
  account,
  onDrop,
}: {
  request: string;
  name: string | undefined;
  account: Hex32 | undefined;
  onDrop: (request: string) => void;
}) {
  const drop = useCallback(() => onDrop(request), [onDrop, request]);
  return (
    <li className="flex items-center gap-3 rounded-md bg-sunken px-3 py-2 shadow-field">
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="type-label-m text-fg">{name ?? "Reading the request…"}</span>
        <span className="truncate type-mono-s text-fg-subtle">
          {account ? shortHex(account) : request}
        </span>
      </span>
      <Tag tone="accent">joins</Tag>
      <Button size="sm" variant="ghost" onClick={drop}>
        Remove
      </Button>
    </li>
  );
}

/** The plan as the daemon checked it: what changes, who deals, what fails, and the risks of the new thresholds. */
function PlanCheck({
  plan,
  members,
  checking,
}: {
  plan: MembershipPlan | undefined;
  members: CommitteeMember[];
  checking: boolean;
}) {
  const risks = plan ? thresholdRisks({ ...plan.next, members: plan.next.members.length }) : [];
  const dealers =
    plan?.dealers.map(
      (index) => members.find((m) => m.index === index)?.name ?? `member ${index}`,
    ) ?? [];

  return (
    <aside className="flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-1 @4xl:sticky @4xl:top-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="type-heading-s text-fg">The plan</h2>
        {checking ? (
          <span className="type-caption text-fg-subtle motion-safe:animate-pulse">Checking…</span>
        ) : null}
      </div>
      {!plan ? (
        <p className="type-body-s text-fg-muted">
          Choose who leaves or joins, or new thresholds, and the plan shows here.
        </p>
      ) : (
        <>
          <dl className="flex flex-col gap-2">
            <div className="flex flex-col">
              <dt className="type-caption text-fg-subtle">Now</dt>
              <dd className="type-body-s text-fg">{shapeLine(plan.current)}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="type-caption text-fg-subtle">After</dt>
              <dd className="type-body-s text-fg">{shapeLine(plan.next)}</dd>
              <dd className="type-caption text-fg-muted">{plan.next.members.join(", ")}</dd>
            </div>
          </dl>
          <ul className="flex flex-col gap-1 type-body-s text-fg">
            {planChanges(plan).map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
          {plan.failure ? (
            <Banner kind="alarm">This plan can't run: {plan.failure}.</Banner>
          ) : (
            <p className="type-caption text-fg-subtle">
              {dealers.join(" and ")} deal the new shares. Members who leave never see them.
            </p>
          )}
          {risks.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {risks.map((risk) => (
                <li
                  key={risk.id}
                  className="rounded-md bg-warning-subtle px-3 py-2 type-body-s text-fg"
                >
                  {risk.text}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </aside>
  );
}

/**
 * The last check before the change starts: a removal needs the vault's name typed, and a threshold with a risk an
 * explicit yes. Starting begins the rotation on this daemon.
 */
function ConfirmPlan({
  summary,
  plan,
  disabled,
  onConfirmed,
}: {
  summary: VaultSummary;
  plan: MembershipPlan | undefined;
  disabled: boolean;
  onConfirmed: (plan: MembershipPlan) => void;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [understood, setUnderstood] = useState(false);
  const leaving = plan
    ? plan.current.members.filter((name) => !plan.next.members.includes(name))
    : [];
  const risks = plan ? thresholdRisks({ ...plan.next, members: plan.next.members.length }) : [];
  const ready =
    (leaving.length === 0 || typed.trim() === summary.name) && (risks.length === 0 || understood);

  const show = useCallback(() => setOpen(true), []);
  const change = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setTyped("");
      setUnderstood(false);
    }
  }, []);
  const confirm = useCallback(() => {
    if (!plan) return;
    setOpen(false);
    onConfirmed(plan);
  }, [onConfirmed, plan]);
  const cancel = useCallback(() => change(false), [change]);

  return (
    <>
      <Button variant="primary" icon="rotate" onClick={show} disabled={disabled}>
        Continue
      </Button>
      <Dialog
        title="Start this change?"
        description={plan ? planChanges(plan).join(" · ") : undefined}
        open={open}
        onOpenChange={change}
        actions={
          <>
            <Button variant="ghost" onClick={cancel}>
              Back
            </Button>
            <Button
              variant={leaving.length > 0 ? "danger" : "primary"}
              onClick={confirm}
              disabled={!ready}
            >
              Start the change
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="type-body-s text-fg-muted">
            Your keeper starts sharing the viewing key anew. Every member who stays and every
            newcomer takes part with the plan you send them, then the members approve the change
            like any proposal.
          </p>
          {leaving.length > 0 ? (
            <TextField
              label={`${leaving.join(" and ")} will no longer read anything that arrives after the change. Type ${summary.name} to confirm`}
              value={typed}
              onValueChange={setTyped}
              placeholder={summary.name}
            />
          ) : null}
          {risks.length > 0 ? (
            <Checkbox
              label={`I understand: ${risks.map((risk) => risk.text.toLowerCase().replace(/\.$/u, "")).join("; ")}.`}
              checked={understood}
              onCheckedChange={setUnderstood}
            />
          ) : null}
        </div>
      </Dialog>
    </>
  );
}
