import { useCallback, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import type { LobbyView } from "@ome-labs/api";
import { Illustration } from "@ome-labs/brand/web";
import {
  Banner,
  Button,
  CopyButton,
  MemberAvatar,
  QrCode,
  Tag,
  ThresholdChip,
} from "@ome-labs/ui-web";

import { callOme } from "../data/ome.ts";
import { FlowPage } from "./flow-page.tsx";
import { blocker, networkName } from "./thresholds.ts";

/** Stage 2: who has joined. The host shares the invite, sets the final thresholds and starts; a guest waits. */
export function LobbyPanel({ lobby }: { lobby: LobbyView }) {
  const host = lobby.members.find((member) => member.index === 1);
  const isHost = lobby.role === "host";

  return (
    <FlowPage
      title={lobby.name}
      lead={
        isHost
          ? "Send the invite to each co-founder. Start once everyone has joined."
          : `You've joined. ${host?.name ?? "The host"} starts the founding once everyone is here.`
      }
    >
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          {isHost && lobby.invite ? <Invite invite={lobby.invite} network={lobby.network} /> : null}
          <Roster lobby={lobby} />
        </div>
        {isHost ? <StartCard lobby={lobby} /> : <WaitingCard lobby={lobby} hostName={host?.name} />}
      </div>
    </FlowPage>
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

function Roster({ lobby }: { lobby: LobbyView }) {
  const open = lobby.status === "open";
  return (
    <section className="flex flex-col rounded-lg bg-surface shadow-1">
      <header className="flex items-center justify-between border-b border-line-subtle px-6 py-4">
        <h2 className="type-heading-s text-fg">Co-founders</h2>
        <span className="type-body-s text-fg-muted tabular-nums">
          {lobby.members.length} joined
        </span>
      </header>
      <ul className="flex flex-col px-6 py-2">
        {lobby.members.map((member) => (
          <li key={member.identity} className="flex items-center gap-3 py-2.5">
            <span className="w-4 type-mono-s text-fg-subtle tabular-nums">{member.index}</span>
            <MemberAvatar name={member.name} index={member.index} size="sm" />
            <span className="flex-1 type-label-m text-fg">{member.name}</span>
            {member.you ? <Tag tone="accent">You</Tag> : null}
            {member.index === 1 && !member.you ? <Tag>Host</Tag> : null}
          </li>
        ))}
        {open ? (
          <li className="flex items-center gap-3 py-2.5 text-fg-subtle">
            <span className="w-4" />
            <span className="relative grid size-6 place-items-center">
              <span className="absolute size-2 animate-ping rounded-full bg-accent opacity-40 motion-reduce:hidden" />
              <span className="size-2 rounded-full bg-accent" />
            </span>
            <span className="type-body-s">Waiting for more to join…</span>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function StartCard({ lobby }: { lobby: LobbyView }) {
  const navigate = useNavigate();
  const members = lobby.members.length;
  const [pending, setPending] = useState<"start" | "cancel">();
  const [error, setError] = useState<string>();
  const stop = blocker({ approvals: lobby.threshold, read: lobby.viewingThreshold }, members);

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
    <section className="flex flex-col rounded-lg bg-surface shadow-1">
      <header className="flex flex-col gap-3 border-b border-line-subtle px-6 py-4">
        <div className="flex flex-col gap-1">
          <h2 className="type-heading-s text-fg">Thresholds</h2>
          <p className="type-body-s text-fg-muted">For the {members} who joined.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ThresholdChip kind="spend" threshold={lobby.threshold} members={members} />
          <ThresholdChip kind="read" threshold={lobby.viewingThreshold} members={members} />
        </div>
      </header>

      <div className="flex flex-col gap-3 px-6 py-4">
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

function WaitingCard({ lobby, hostName }: { lobby: LobbyView; hostName: string | undefined }) {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const leave = useCallback(async () => {
    setLeaving(true);
    await callOme("lobby.leave", { lobby: lobby.lobby }).catch(() => undefined);
    await navigate({ to: "/home" });
  }, [lobby.lobby, navigate]);
  const members = lobby.members.length;

  return (
    <section className="flex flex-col gap-5 rounded-lg bg-surface p-5 shadow-1">
      <Illustration id="lobby" alt="" className="aspect-[16/10] w-full rounded-md object-cover" />
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
