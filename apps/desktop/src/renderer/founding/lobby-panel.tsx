import { type ReactNode, useCallback, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import type { LobbyView, LobbyViewMember } from "@ome-labs/api";
import { Scene } from "@ome-labs/brand/web";
import {
  Address,
  Banner,
  Button,
  CopyButton,
  IconButton,
  MemberAvatar,
  NumberStepper,
  QrCode,
  Tag,
  ThresholdChip,
  Tooltip,
} from "@ome-labs/ui-web";

import { callOme } from "../data/ome.ts";
import { Page } from "../shell/page.tsx";
import { LIMITS, blocker, networkName } from "./thresholds.ts";

/** Stage 2: who has joined. The host shares the invite and starts once the vault is full; a guest waits. */
export function LobbyPanel({ lobby }: { lobby: LobbyView }) {
  const host = lobby.members.find((member) => member.index === 1);
  const isHost = lobby.role === "host";
  const planned = lobby.expected;

  return (
    <Page
      title={lobby.name}
      lead={
        isHost
          ? `Send the invite to each co-founder. Start once ${planned === 2 ? "your co-founder has" : `all ${planned} have`} joined.`
          : `You've joined. ${host?.name ?? "The host"} starts the founding once all ${planned} are here.`
      }
    >
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          {isHost && lobby.invite ? <Invite invite={lobby.invite} network={lobby.network} /> : null}
          <Roster lobby={lobby} planned={planned} />
        </div>
        {isHost ? (
          <StartCard lobby={lobby} planned={planned} />
        ) : (
          <WaitingCard lobby={lobby} hostName={host?.name} />
        )}
      </div>
    </Page>
  );
}

function Invite({ invite, network }: { invite: string; network: string }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-surface p-6 shadow-1">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="type-heading-s text-fg">Invite</h2>
          <p className="type-body-s text-fg-muted">
            Send it to each co-founder, or let them scan it. It only opens on the same network.
          </p>
        </div>
        <Tag>{networkName(network)}</Tag>
      </header>
      <div className="flex items-center gap-2 rounded-md bg-sunken py-1.5 pr-1.5 pl-3 shadow-field">
        <code title={invite} className="min-w-0 flex-1 truncate type-mono-s text-fg">
          {invite}
        </code>
        <CopyButton value={invite} label="Copy invite" size="md" />
      </div>
      <QrCode value={invite} label="Invite, to scan" size={184} className="self-start" />
    </section>
  );
}

function Roster({ lobby, planned }: { lobby: LobbyView; planned: number }) {
  const joined = lobby.members.length;
  const waiting = lobby.status === "open" && joined < planned;
  const canRemove = lobby.role === "host" && lobby.status === "open";
  return (
    <section className="flex flex-col rounded-lg bg-surface px-6 shadow-1">
      <header className="flex items-center justify-between border-b border-line-subtle py-4">
        <h2 className="type-heading-s text-fg">Co-founders</h2>
        <span className="type-body-s text-fg-muted tabular-nums">
          {joined > planned
            ? `${joined} joined · ${planned} planned`
            : `${joined} of ${planned} joined`}
        </span>
      </header>
      <ul className="flex flex-col py-2">
        {lobby.members.map((member) => (
          <li key={member.identity} className="group flex items-center gap-3 py-2.5">
            <span className="w-4 type-mono-s text-fg-subtle tabular-nums">{member.index}</span>
            <MemberAvatar name={member.name} index={member.index} size="sm" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="type-label-m text-fg">{member.name}</span>
              {/* The account they'll use with the vault: worth checking against what they sent you. */}
              <Address address={member.account} className="type-caption" />
            </span>
            {member.you ? <Tag tone="accent">You</Tag> : null}
            {member.index === 1 && !member.you ? <Tag>Host</Tag> : null}
            {member.index > planned ? <Tag tone="warning">Extra</Tag> : null}
            {canRemove && !member.you ? <RemoveButton lobby={lobby} member={member} /> : null}
          </li>
        ))}
        {waiting ? (
          <li className="flex items-center gap-3 py-2.5 text-fg-subtle">
            <span className="w-4" />
            <span className="relative grid size-6 place-items-center">
              <span className="absolute size-2 animate-ping rounded-full bg-accent opacity-40 motion-reduce:hidden" />
              <span className="size-2 rounded-full bg-accent" />
            </span>
            <span className="type-body-s">Waiting for {planned - joined} more to join…</span>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function StartCard({ lobby, planned }: { lobby: LobbyView; planned: number }) {
  const navigate = useNavigate();
  const joined = lobby.members.length;
  const [pending, setPending] = useState<"start" | "cancel">();
  const [error, setError] = useState<string>();
  const stop = blocker(
    { approvals: lobby.threshold, read: lobby.viewingThreshold },
    joined,
    planned,
  );
  // Every member sees the change at once: the daemon sends the updated lobby to them.
  const update = useCallback(
    async (patch: { members?: number; threshold?: number; viewingThreshold?: number }) => {
      setError(undefined);
      try {
        await callOme("lobby.update", { lobby: lobby.lobby, ...patch });
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : String(failure));
      }
    },
    [lobby.lobby],
  );
  const setMembers = useCallback(
    (members: number) =>
      void update({
        members,
        threshold: Math.min(lobby.threshold, members),
        viewingThreshold: Math.min(lobby.viewingThreshold, members),
      }),
    [lobby.threshold, lobby.viewingThreshold, update],
  );
  const setThreshold = useCallback((threshold: number) => void update({ threshold }), [update]);
  const setRead = useCallback(
    (viewingThreshold: number) => void update({ viewingThreshold }),
    [update],
  );

  const start = useCallback(async () => {
    setPending("start");
    setError(undefined);
    try {
      await callOme("lobby.start", {
        lobby: lobby.lobby,
        threshold: lobby.threshold,
        viewingThreshold: lobby.viewingThreshold,
      });
      await callOme("founding.begin", { lobby: lobby.lobby });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
      setPending(undefined);
    }
  }, [lobby.lobby, lobby.threshold, lobby.viewingThreshold]);
  const cancel = useCallback(async () => {
    setPending("cancel");
    await callOme("lobby.leave", { lobby: lobby.lobby }).catch(() => undefined);
    await navigate({ to: "/home" });
  }, [lobby.lobby, navigate]);

  return (
    <section className="flex flex-col rounded-lg bg-surface px-6 shadow-1">
      <header className="flex flex-col gap-3 border-b border-line-subtle py-4">
        <div className="flex flex-col gap-1">
          <h2 className="type-heading-s text-fg">The vault</h2>
          <p className="type-body-s text-fg-muted">
            You can change these until you start. Co-founders see each change.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ThresholdChip kind="spend" threshold={lobby.threshold} members={planned} />
          <ThresholdChip kind="read" threshold={lobby.viewingThreshold} members={planned} />
        </div>
      </header>

      <dl className="flex flex-col divide-y divide-line-subtle">
        <Setting label="Members" hint="Host included">
          <NumberStepper
            aria-label="Members"
            value={planned}
            min={Math.max(LIMITS.members.min, joined)}
            max={LIMITS.members.max}
            disabled={pending !== undefined}
            onValueChange={setMembers}
          />
        </Setting>
        <Setting label="Approvals to spend" hint={`of ${planned}`}>
          <NumberStepper
            aria-label="Approvals to spend"
            value={lobby.threshold}
            min={LIMITS.approvals.min}
            max={planned}
            disabled={pending !== undefined}
            onValueChange={setThreshold}
          />
        </Setting>
        <Setting label="Keepers to read" hint={`of ${planned}`}>
          <NumberStepper
            aria-label="Keepers to read"
            value={lobby.viewingThreshold}
            min={LIMITS.read.min}
            max={planned}
            disabled={pending !== undefined}
            onValueChange={setRead}
          />
        </Setting>
      </dl>

      <div className="flex flex-col gap-3 border-t border-line-subtle py-4">
        {error ? <Banner kind="alarm">{error}</Banner> : null}
        {stop ? <p className="type-body-s text-fg-subtle">{stop}</p> : null}
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={cancel} disabled={pending !== undefined}>
            Cancel lobby
          </Button>
          <Button
            variant="primary"
            icon="play"
            onClick={start}
            pending={pending === "start"}
            disabled={pending === "cancel" || Boolean(stop)}
          >
            {pending === "start" ? "Starting…" : "Start"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Setting({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="flex flex-col">
        <span className="type-label-m text-fg">{label}</span>
        <span className="type-caption text-fg-subtle">{hint}</span>
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

/** The host takes someone off the roster: a stranger with the invite, or someone joined twice. */
function RemoveButton({ lobby, member }: { lobby: LobbyView; member: LobbyViewMember }) {
  const [pending, setPending] = useState(false);
  const remove = useCallback(async () => {
    setPending(true);
    await callOme("lobby.remove", { lobby: lobby.lobby, identity: member.identity }).catch(() =>
      setPending(false),
    );
  }, [lobby.lobby, member.identity]);

  return (
    <Tooltip content={`Remove ${member.name}`}>
      <IconButton
        icon="x"
        label={`Remove ${member.name}`}
        size="sm"
        onClick={remove}
        disabled={pending}
        className="opacity-60 transition-opacity duration-fast group-hover:opacity-100 focus-visible:opacity-100"
      />
    </Tooltip>
  );
}

function WaitingCard({ lobby, hostName }: { lobby: LobbyView; hostName: string | undefined }) {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const leave = useCallback(async () => {
    setLeaving(true);
    await callOme("lobby.leave", { lobby: lobby.lobby }).catch(() => undefined);
    await navigate({ to: "/home" });
  }, [lobby.lobby, navigate]);
  const members = lobby.expected;

  return (
    <section className="flex flex-col gap-5 rounded-lg bg-surface p-5 shadow-1">
      <Scene id="lobby" alt="" className="aspect-[16/10] w-full rounded-md object-cover" />
      <div className="flex flex-col gap-1">
        <h2 className="type-heading-s text-fg">Waiting for {hostName ?? "the host"}</h2>
        <p className="type-body-s text-fg-muted">
          They set the final thresholds and start. Keep Ome open: founding begins on its own.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="type-caption text-fg-subtle">Proposed</span>
        <div className="flex flex-wrap gap-2">
          <ThresholdChip kind="spend" threshold={lobby.threshold} members={members} />
          <ThresholdChip kind="read" threshold={lobby.viewingThreshold} members={members} />
        </div>
      </div>
      <div>
        <Button variant="ghost" onClick={leave} pending={leaving}>
          Leave lobby
        </Button>
      </div>
    </section>
  );
}
