import { type ReactNode, useCallback, useMemo } from "react";

import { useNavigate, useParams } from "@tanstack/react-router";

import type { Hex32 } from "@ome-labs/api";
import type { SceneId } from "@ome-labs/brand/web";
import { Scene } from "@ome-labs/brand/web";
import {
  connectionOf,
  connectionStatus,
  riskRemedy,
  type VaultHealthState,
} from "@ome-labs/format";
import { Banner, CheckRow, HealthMeter, MemberAvatar, cn } from "@ome-labs/ui-web";

import { Page } from "../shell/page.tsx";
import { useVaultHealth } from "./live.ts";

const SCENES: Record<VaultHealthState, SceneId> = {
  healthy: "health-good",
  "no-spare": "health-low",
  unreadable: "health-unreadable",
  mismatch: "alarm",
  removed: "member-leaving",
};

const TITLE_TONES = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-fg",
  neutral: "text-fg",
} as const;

/**
 * `/vaults/$vault/health`: whether the vault can still read and spend if something goes wrong. Computed from the
 * members' keepers answering now, this keeper's share and the config on chain; then the risks its thresholds carry,
 * and what to do when a device or a keeper is lost.
 */
export function HealthPage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const navigate = useNavigate();
  const { details, peers, rows, health, running, answers } = useVaultHealth(vault);
  const data = details.data;

  const members = useCallback(
    () => void navigate({ to: "/vaults/$vault/members", params: { vault } }),
    [navigate, vault],
  );
  const back = useMemo(() => ({ label: "Members", onClick: members }), [members]);

  return (
    <Page
      back={back}
      title="Health"
      lead="Whether the vault can still read and spend if a member, a device or a keeper is lost."
    >
      <div className="flex flex-col gap-6">
        {details.error ? <Banner kind="alarm">{details.error.message}</Banner> : null}
        {peers.error ? (
          <Banner kind="warning">Can't reach your keeper: {peers.error.message}</Banner>
        ) : null}
        {data && health ? (
          <>
            <section className="grid grid-cols-1 items-center gap-6 rounded-lg bg-surface p-6 shadow-1 @3xl:grid-cols-[280px_minmax(0,1fr)]">
              <Scene
                id={SCENES[health.overall.state]}
                alt=""
                className="aspect-[16/10] w-full rounded-md object-cover"
              />
              <div className="flex flex-col gap-3">
                <h2 className={cn("type-heading-m", TITLE_TONES[health.overall.tone])}>
                  {health.overall.title}
                </h2>
                <p className="type-body-m text-fg-muted">{health.overall.detail}</p>
                <HealthMeter health={health.reading} />
              </div>
            </section>

            <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-2">
              <Card title="Checks">
                <ul className="flex flex-col">
                  <CheckRow
                    state={
                      health.reading.canRead
                        ? health.reading.spare > 0
                          ? "pass"
                          : "warning"
                        : "fail"
                    }
                    label={`${health.reading.answering} ${health.reading.answering === 1 ? "keeper" : "keepers"} answering, ${health.reading.needed} needed to read${
                      health.reading.spare > 0 ? `, ${health.reading.spare} spare` : ""
                    }`}
                  />
                  <CheckRow
                    state={data.committee.serving ? "pass" : "fail"}
                    label={
                      data.committee.serving
                        ? "Your keeper holds its share"
                        : "Your keeper no longer holds a share"
                    }
                  />
                  <CheckRow
                    state={
                      data.config === null
                        ? "warning"
                        : data.config.matchesCommittee
                          ? "pass"
                          : "fail"
                    }
                    label={
                      data.config === null
                        ? "The config on chain hasn't been read yet"
                        : data.config.matchesCommittee
                          ? "The vault on chain names this committee"
                          : "The vault on chain names another committee"
                    }
                  />
                </ul>
              </Card>

              <Card title="Keepers">
                <ul className="flex flex-col divide-y divide-line-subtle">
                  {rows.map(({ member, peer }) => {
                    const state = member.you
                      ? answers
                        ? "connected"
                        : "offline"
                      : peer
                        ? connectionOf(peer)
                        : "offline";
                    const shown = connectionStatus(state);
                    return (
                      <li
                        key={member.identity}
                        className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <MemberAvatar name={member.name} index={member.index} size="sm" />
                        <span className="flex-1 type-label-m text-fg">
                          {member.name}
                          {member.you ? (
                            <span className="ml-1.5 type-caption text-fg-subtle">you</span>
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            "type-body-s",
                            state === "offline" ? "text-fg-subtle" : "text-success",
                          )}
                        >
                          {member.you
                            ? !data.committee.serving
                              ? "Not serving"
                              : running
                                ? "Serving"
                                : "Stopped"
                            : shown.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </div>

            <Card
              title="Risks of these thresholds"
              lead={`${data.summary.threshold} of ${data.summary.members} approvals to spend, ${data.committee.viewingThreshold} of ${data.summary.members} keepers to read.`}
            >
              {health.risks.length === 0 ? (
                <p className="type-body-s text-fg-muted">
                  None: one lost key or keeper leaves the vault working, and no one member can act
                  alone.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {health.risks.map((risk) => (
                    <li
                      key={risk.id}
                      className="flex flex-col gap-1 rounded-md bg-warning-subtle px-4 py-3"
                    >
                      <span className="type-label-m text-fg">{risk.text}</span>
                      <span className="type-body-s text-fg-muted">{riskRemedy(risk.id)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="If something is lost">
              <dl className="flex flex-col divide-y divide-line-subtle">
                <Recovery
                  what="This computer, or your signing key"
                  how="Move your signer to another device with a signer swap: the other members approve it like a proposal."
                />
                <Recovery
                  what="A member's keeper"
                  how="Change members to remove that member and add them back with a new keeper. Reading keeps working meanwhile while enough keepers answer."
                />
                <Recovery
                  what="A member who leaves"
                  how="Change members to remove them. Their keeper's share is replaced, so they can't read what arrives after."
                />
              </dl>
            </Card>
          </>
        ) : null}
      </div>
    </Page>
  );
}

function Card({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-surface p-6 shadow-1">
      <header className="flex flex-col gap-1">
        <h2 className="type-heading-s text-fg">{title}</h2>
        {lead ? <p className="type-body-s text-fg-muted">{lead}</p> : null}
      </header>
      {children}
    </section>
  );
}

function Recovery({ what, how }: { what: string; how: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 @2xl:flex-row @2xl:gap-6">
      <dt className="type-label-m text-fg @2xl:w-56 @2xl:shrink-0">{what}</dt>
      <dd className="type-body-s text-fg-muted">{how}</dd>
    </div>
  );
}
