import { type ReactNode, useCallback, useMemo } from "react";

import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import type { VaultSummary } from "@ome-labs/api";
import { Scene } from "@ome-labs/brand/web";
import { formatExpiry, proposalSummary, voteProgress } from "@ome-labs/format";
import { Avatar, Button, EmptyState, StatusBadge, Tag, ThresholdChip } from "@ome-labs/ui-web";

import { useAvatars, vaultAvatar } from "../avatars/avatars.ts";
import { callOme, omeQueryKey, useOme } from "../data/ome.ts";
import { useNow } from "../shell/now.ts";
import { type Waiting, waitingAcross } from "./waiting.ts";

/**
 * `/home`: every vault this member is in, and what waits on them across all of them. Without a vault, the ways to
 * get one: create, join by invite, or ask to join an existing one.
 */
export function HomePage() {
  const status = useOme("status", {});
  const name = status.data?.profile?.name;
  const vaults = useMemo(() => status.data?.vaults ?? [], [status.data]);

  return (
    <div className="@container flex flex-col gap-8">
      <header className="flex flex-col gap-1.5">
        <h1 className="type-heading-xl text-fg">{name ? `Welcome, ${name}` : "Welcome"}</h1>
        <p className="type-body-m text-fg-muted">
          {status.data && vaults.length === 0
            ? "You're not in a vault yet. Start one, or join one you were invited to."
            : vaults.length === 1
              ? "Your vault, and what waits on you."
              : `Your ${vaults.length} vaults, and what waits on you across them.`}
        </p>
      </header>
      {status.data ? vaults.length === 0 ? <Ways /> : <WithVaults vaults={vaults} /> : null}
    </div>
  );
}

function WithVaults({ vaults }: { vaults: VaultSummary[] }) {
  const navigate = useNavigate();
  const go = useCallback((to: string) => () => void navigate({ to }), [navigate]);
  return (
    <>
      <NeedsYou vaults={vaults} />
      <section className="flex flex-col gap-3">
        <h2 className="type-heading-s text-fg">Your vaults</h2>
        <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {vaults.map((vault) => (
            <VaultCard key={vault.address} vault={vault} />
          ))}
        </div>
      </section>
      <div className="flex flex-wrap items-center gap-2 border-t border-line-subtle pt-5">
        <span className="mr-2 type-body-s text-fg-muted">Another vault?</span>
        <Button size="sm" icon="plus" onClick={go("/create")}>
          Create a vault
        </Button>
        <Button size="sm" icon="link" onClick={go("/join")}>
          Join by invite
        </Button>
        <Button size="sm" icon="user-plus" onClick={go("/join-request")}>
          Join an existing vault
        </Button>
      </div>
    </>
  );
}

/** Proposals waiting on this member in every vault, read with the daemon's own filters. */
function NeedsYou({ vaults }: { vaults: VaultSummary[] }) {
  const now = useNow();
  const lists = useQueries({
    queries: vaults.flatMap((vault) =>
      (["needsMe", "ready"] as const).map((filter) => ({
        queryKey: omeQueryKey("proposals.list", { vault: vault.address, filter }),
        queryFn: () => callOme("proposals.list", { vault: vault.address, filter }),
      })),
    ),
  });
  const waiting = useMemo(
    () =>
      waitingAcross(
        vaults,
        vaults.map((_, at) => {
          const [needs, ready] = [lists[at * 2]?.data, lists[at * 2 + 1]?.data];
          return needs || ready ? [...(needs?.items ?? []), ...(ready?.items ?? [])] : undefined;
        }),
      ),
    [lists, vaults],
  );
  const loaded = lists.every((list) => list.data !== undefined || list.error);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="type-heading-s text-fg">Needs you</h2>
      {loaded && waiting.length === 0 ? (
        <div className="rounded-lg bg-surface shadow-1">
          <EmptyState object="ballot" title="Nothing needs you">
            No vault has a proposal waiting for your vote or ready to execute.
          </EmptyState>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-line-subtle overflow-hidden rounded-lg bg-surface shadow-1">
          {waiting.map((item) => (
            <WaitingRow key={`${item.vault.address}:${item.proposal.id}`} item={item} now={now} />
          ))}
        </ul>
      )}
    </section>
  );
}

function WaitingRow({ item, now }: { item: Waiting; now: number }) {
  const { vault, proposal } = item;
  return (
    <li className="relative flex items-center gap-3 px-4 py-3 transition-colors duration-fast ease-standard hover:bg-hover has-[:focus-visible]:bg-hover">
      <Tag>{vault.name}</Tag>
      <span className="flex min-w-0 flex-1 flex-col">
        <a
          href={`#/vaults/${vault.address}/proposals/${proposal.id}`}
          className="focus-ring truncate rounded-xs type-body-s text-fg after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          {proposalSummary(proposal)}
        </a>
        <span className="type-caption text-fg-subtle">
          {proposal.status === "ready"
            ? "Ready: any member can execute it"
            : "Waiting for your vote"}{" "}
          · from {proposal.proposer.name} · {voteProgress(proposal).label} ·{" "}
          {formatExpiry(proposal.expiresAt, now)}
        </span>
      </span>
      <StatusBadge kind="proposal" status={proposal.status} />
    </li>
  );
}

function VaultCard({ vault }: { vault: VaultSummary }) {
  const avatars = useAvatars();
  const { open, ready, needsMe } = vault.counts;
  const counts = [
    needsMe > 0 ? `${needsMe} needs you` : null,
    ready > 0 ? `${ready} ready` : null,
    open > 0 ? `${open} open` : null,
  ].filter(Boolean);

  return (
    <article className="relative flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-1 transition-shadow duration-fast ease-standard hover:shadow-2 has-[:focus-visible]:shadow-2">
      <div className="flex items-center gap-3">
        <Avatar
          source={vaultAvatar(avatars, vault.address)}
          name={vault.name}
          shape="square"
          size={40}
        />
        <div className="flex min-w-0 flex-col">
          <a
            href={`#/vaults/${vault.address}`}
            className="focus-ring truncate rounded-xs type-heading-s text-fg after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {vault.name}
          </a>
          <span className="type-caption text-fg-subtle">
            {vault.members} members{vault.isDefault ? " · default" : ""}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <ThresholdChip kind="spend" threshold={vault.threshold} members={vault.members} />
        <ThresholdChip kind="read" threshold={vault.viewingThreshold} members={vault.members} />
      </div>
      <p className={needsMe > 0 ? "type-label-m text-accent" : "type-body-s text-fg-muted"}>
        {counts.length > 0 ? counts.join(" · ") : "Nothing open"}
      </p>
    </article>
  );
}

/** Without a vault: create one, join one by invite, or ask to join an existing one. */
function Ways() {
  const navigate = useNavigate();
  const go = useCallback((to: string) => () => void navigate({ to }), [navigate]);
  return (
    <div className="grid grid-cols-1 gap-5 @3xl:grid-cols-3">
      <Way
        scene={
          <Scene
            id="create-vault"
            alt=""
            className="aspect-[16/9] w-full rounded-md object-cover"
          />
        }
        title="Create a vault"
        text="Start a vault and invite co-founders."
        action={
          <Button variant="primary" icon="plus" onClick={go("/create")}>
            Create vault
          </Button>
        }
      />
      <Way
        scene={
          <Scene id="invite" alt="" className="aspect-[16/9] w-full rounded-md object-cover" />
        }
        title="Join a vault"
        text="Paste an invite from a co-founder."
        action={
          <Button icon="link" onClick={go("/join")}>
            Paste invite
          </Button>
        }
      />
      <Way
        scene={
          <Scene
            id="join-request"
            alt=""
            className="aspect-[16/9] w-full rounded-md object-cover"
          />
        }
        title="Join an existing vault"
        text="Send a join request to one of its members."
        action={
          <Button icon="user-plus" onClick={go("/join-request")}>
            Make request
          </Button>
        }
      />
    </div>
  );
}

function Way({
  scene,
  title,
  text,
  action,
}: {
  scene: ReactNode;
  title: string;
  text: string;
  action: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-1">
      {scene}
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="type-heading-s text-fg">{title}</h2>
        <p className="type-body-s text-fg-muted">{text}</p>
      </div>
      <div>{action}</div>
    </article>
  );
}
