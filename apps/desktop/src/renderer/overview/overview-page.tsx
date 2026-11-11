import { type ReactNode, useCallback, useMemo } from "react";

import { useNavigate, useParams } from "@tanstack/react-router";

import type { Hex32, ProposalView } from "@ome-labs/api";
import { balanceDisplay, formatExpiry } from "@ome-labs/format";
import {
  ActivityRow,
  Avatar,
  Banner,
  Button,
  EmptyState,
  HealthMeter,
  Tag,
  ThresholdChip,
  TokenMonogram,
  cn,
} from "@ome-labs/ui-web";

import { useAvatars, vaultAvatar } from "../avatars/avatars.ts";
import { useOme } from "../data/ome.ts";
import { useVaultHealth } from "../members/live.ts";
import { useAddressBook } from "../proposals/calls/address-book.ts";
import { useNow } from "../shell/now.ts";
import { Page } from "../shell/page.tsx";

/** Balances and recent entries shown before "see all". */
const SHOWN = 5;

const HEALTH_TONES = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-fg",
  neutral: "text-fg",
} as const;

/**
 * `/vaults/$vault`: the vault at a glance. What waits on this member comes first, since it is the only thing to act
 * on; then what the vault holds, whether it is healthy, and what happened lately. Each card reads on its own, so a
 * slow balance doesn't hold up the rest.
 */
export function OverviewPage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const navigate = useNavigate();
  const status = useOme("status", {});
  const summary = status.data?.vaults.find((item) => item.address === vault);
  const avatars = useAvatars();
  const go = useCallback(
    (path: string) => () => void navigate({ to: `/vaults/${vault}${path}` }),
    [navigate, vault],
  );

  return (
    <Page
      title={summary?.name ?? "Vault"}
      lead={
        summary ? (
          <span className="flex flex-wrap items-center gap-2">
            <ThresholdChip kind="spend" threshold={summary.threshold} members={summary.members} />
            <ThresholdChip
              kind="read"
              threshold={summary.viewingThreshold}
              members={summary.members}
            />
            {summary.isDefault ? <Tag>default vault</Tag> : null}
          </span>
        ) : undefined
      }
      actions={
        <div className="flex items-center gap-2">
          {summary ? (
            <Avatar
              source={vaultAvatar(avatars, vault)}
              name={summary.name}
              shape="square"
              size={32}
            />
          ) : null}
          <Button icon="receive" onClick={go("/receive")}>
            Receive
          </Button>
          <Button variant="primary" icon="plus" onClick={go("/new")}>
            New proposal
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="flex flex-col gap-6">
          <NeedsYou vault={vault} onAll={go("/proposals")} />
          <Recent vault={vault} onAll={go("/activity")} />
        </div>
        <div className="flex flex-col gap-6">
          <Balances vault={vault} onAll={go("/tokens")} onReceive={go("/receive")} />
          <Health vault={vault} onOpen={go("/health")} />
        </div>
      </div>
    </Page>
  );
}

function Card({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("flex flex-col overflow-hidden rounded-lg bg-surface shadow-1", className)}
    >
      <header className="flex items-center justify-between gap-3 border-b border-line-subtle px-5 py-3.5">
        <h2 className="type-heading-s text-fg">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function SeeAll({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      {label}
    </Button>
  );
}

/** Proposals waiting for this member's vote, then those ready for anyone to execute, soonest to expire first. */
function NeedsYou({ vault, onAll }: { vault: Hex32; onAll: () => void }) {
  const now = useNow();
  const needsMe = useOme("proposals.list", { vault, filter: "needsMe" });
  const ready = useOme("proposals.list", { vault, filter: "ready" });
  const waiting = useMemo(() => {
    const seen = new Set<string>();
    return [...(needsMe.data?.items ?? []), ...(ready.data?.items ?? [])]
      .filter((proposal) => !seen.has(proposal.id) && seen.add(proposal.id))
      .toSorted((a, b) => a.expiresAt - b.expiresAt);
  }, [needsMe.data, ready.data]);
  const error = needsMe.error ?? ready.error;
  const loaded = needsMe.data && ready.data;

  return (
    <Card title="Needs you" action={<SeeAll label="All proposals" onClick={onAll} />}>
      {error ? (
        <Banner kind="alarm" className="m-4">
          {error.message}
        </Banner>
      ) : null}
      {loaded && waiting.length === 0 ? (
        <EmptyState object="ballot" title="Nothing needs you">
          You've voted on everything open, and nothing is waiting to be executed.
        </EmptyState>
      ) : (
        <ul className="flex flex-col divide-y divide-line-subtle">
          {waiting.map((proposal) => (
            <WaitingRow key={proposal.id} vault={vault} proposal={proposal} now={now} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function WaitingRow({
  vault,
  proposal,
  now,
}: {
  vault: Hex32;
  proposal: ProposalView;
  now: number;
}) {
  const entry = useMemo(
    () => ({ kind: "proposal" as const, at: proposal.createdAt, proposal }),
    [proposal],
  );
  return (
    <div className="flex flex-col">
      <ActivityRow entry={entry} now={now} href={`#/vaults/${vault}/proposals/${proposal.id}`} />
      <span className="-mt-2 px-14 pb-3 type-caption text-fg-subtle">
        {proposal.status === "ready" ? "Ready: any member can execute it" : "Waiting for your vote"}{" "}
        · {formatExpiry(proposal.expiresAt, now)}
      </span>
    </div>
  );
}

function Recent({ vault, onAll }: { vault: Hex32; onAll: () => void }) {
  const now = useNow();
  const activity = useOme("vault.activity", { vault, limit: SHOWN });
  const book = useAddressBook(vault);
  const names = useMemo(
    () => Object.fromEntries(book.map((entry) => [entry.address, entry.name])),
    [book],
  );
  const items = activity.data?.items ?? [];

  return (
    <Card title="Recent activity" action={<SeeAll label="All activity" onClick={onAll} />}>
      {activity.error ? (
        <Banner kind="alarm" className="m-4">
          {activity.error.message}
        </Banner>
      ) : null}
      {activity.data && items.length === 0 ? (
        <EmptyState object="feather" title="Nothing yet">
          Payments to the vault and its proposals show here.
        </EmptyState>
      ) : (
        <ul className="flex flex-col divide-y divide-line-subtle">
          {items.map((entry) =>
            entry.kind === "received" ? (
              <ActivityRow
                key={entry.txHash}
                entry={entry}
                now={now}
                names={names}
                href={`#/vaults/${vault}/activity`}
              />
            ) : (
              <ActivityRow
                key={entry.proposal.id}
                entry={entry}
                now={now}
                href={`#/vaults/${vault}/proposals/${entry.proposal.id}`}
              />
            ),
          )}
        </ul>
      )}
    </Card>
  );
}

function Balances({
  vault,
  onAll,
  onReceive,
}: {
  vault: Hex32;
  onAll: () => void;
  onReceive: () => void;
}) {
  const tokens = useOme("tokens.list", { vault });
  const list = tokens.data ?? [];

  return (
    <Card title="Balances" action={<SeeAll label="All balances" onClick={onAll} />}>
      {tokens.error ? (
        <Banner kind="alarm" className="m-4">
          {tokens.error.message}
        </Banner>
      ) : null}
      {tokens.data && list.length === 0 ? (
        <EmptyState
          object="coin"
          title="No tokens yet"
          action={
            <div className="flex gap-2">
              <Button size="sm" onClick={onAll}>
                Add token
              </Button>
              <Button size="sm" variant="ghost" onClick={onReceive}>
                Receive
              </Button>
            </div>
          }
        >
          Add the tokens the vault holds to see their balances.
        </EmptyState>
      ) : (
        <ul className="flex flex-col divide-y divide-line-subtle">
          {list.slice(0, SHOWN).map((entry) => {
            const shown = balanceDisplay(entry.private, entry.token);
            return (
              <li key={entry.token.address} className="flex items-center gap-3 px-5 py-3">
                <TokenMonogram token={entry.token} size="sm" />
                <span className="flex-1 type-label-m text-fg">{entry.token.symbol}</span>
                <span className="flex flex-col items-end">
                  <span
                    className={cn(
                      shown.baseUnits === null ? "type-label-s" : "type-mono-m tabular-nums",
                      shown.tone === "warning"
                        ? "text-warning"
                        : shown.tone === "danger"
                          ? "text-danger"
                          : "text-fg",
                    )}
                    title={shown.baseUnits === null ? undefined : `${shown.baseUnits} base units`}
                  >
                    {shown.text}
                  </span>
                  {shown.detail ? (
                    <span
                      className="max-w-44 truncate type-caption text-fg-subtle"
                      title={shown.detail}
                    >
                      {shown.detail.split("\n")[0]}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
          {list.length > SHOWN ? (
            <li className="px-5 py-2.5 type-caption text-fg-subtle">
              and {list.length - SHOWN} more
            </li>
          ) : null}
        </ul>
      )}
      <p className="border-t border-line-subtle px-5 py-2.5 type-caption text-fg-subtle">
        Private balances
      </p>
    </Card>
  );
}

function Health({ vault, onOpen }: { vault: Hex32; onOpen: () => void }) {
  const { health, details } = useVaultHealth(vault);

  return (
    <Card title="Health" action={<SeeAll label="Details" onClick={onOpen} />}>
      <div className="flex flex-col gap-3 px-5 py-4">
        {details.error ? <Banner kind="alarm">{details.error.message}</Banner> : null}
        {health ? (
          <>
            <span className={cn("type-label-m", HEALTH_TONES[health.overall.tone])}>
              {health.overall.title}
            </span>
            <HealthMeter health={health.reading} />
            {health.risks.length > 0 ? (
              <button
                type="button"
                onClick={onOpen}
                className="focus-ring self-start rounded-xs text-left type-body-s text-warning hover:underline"
              >
                {health.risks.length === 1
                  ? "1 risk in its thresholds"
                  : `${health.risks.length} risks in its thresholds`}
              </button>
            ) : (
              <span className="type-body-s text-fg-muted">No risks in its thresholds.</span>
            )}
          </>
        ) : (
          <span className="type-body-s text-fg-subtle">Checking the keepers…</span>
        )}
      </div>
    </Card>
  );
}
