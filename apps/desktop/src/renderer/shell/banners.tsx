import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import type { DaemonEvent, Status } from "@ome-labs/api";
import { Banner } from "@ome-labs/ui-web";

import { callOme, useOme } from "../data/ome.ts";

const RETRY_NODE = { label: "Try again", onClick: () => void callOme("node.status", {}) };

/** What's wrong right now, most serious first: the vault's alarms, then the keeper, then the node. */
export function Banners({ status, vault }: { status: Status; vault: string | undefined }) {
  const { node, keeper } = status;

  return (
    <>
      {vault ? <VaultBanners vault={vault} /> : null}

      {keeper.status === "failed" ? (
        <Banner kind="alarm">
          Your keeper stopped{keeper.error ? `: ${keeper.error}` : "."} Other members can't read
          through you until it runs again.
        </Banner>
      ) : null}
      {keeper.status === "starting" || keeper.status === "restarting" ? (
        <Banner kind="info">
          Your keeper is starting. Reads and votes wait until it's running.
        </Banner>
      ) : null}

      {node.reachable ? null : (
        <Banner kind="warning" action={RETRY_NODE}>
          Can't reach the Aztec node at {node.url}. Balances and proposals can't update until it
          answers.
        </Banner>
      )}
      {node.reachable &&
      node.syncedBlock !== null &&
      node.blockNumber !== null &&
      node.syncedBlock < node.blockNumber ? (
        <Banner kind="info">
          Catching up with the network: block {node.syncedBlock.toLocaleString("en")} of{" "}
          {node.blockNumber.toLocaleString("en")}. What you see may be a few blocks behind.
        </Banner>
      ) : null}
    </>
  );
}

/** Alarms about one vault: what its committee and config say, and what the keeper reported since the app opened. */
function VaultBanners({ vault }: { vault: string }) {
  const details = useOme("vault.details", { vault });
  const reported = useKeeperReports(vault);
  const advised = useHandshakeAdvice(vault);
  const committee = details.data?.committee;
  const config = details.data?.config;

  if (committee?.keeperStatus === "removed") {
    return (
      <Banner kind="info">
        You were removed from {details.data?.summary.name}. Your keeper destroyed its share, so you
        can't read anything that arrives from now on.
      </Banner>
    );
  }

  return (
    <>
      {config && !config.matchesCommittee ? (
        <Banner kind="alarm">
          This vault's on-chain config names a committee your keeper can't verify. It won't act
          until you look.
        </Banner>
      ) : null}
      {reported.map((report) => (
        <Banner key={report.key} kind={report.kind}>
          {report.text}
        </Banner>
      ))}
      {advised ? (
        <Banner kind="warning" action={advised.action}>
          {advised.counterparties === 1 ? "Someone who" : `${advised.counterparties} people who`}{" "}
          paid this vault before a member was removed can still be recognised by that member when
          they pay. Ask them to handshake with the vault again.
        </Banner>
      ) : null}
    </>
  );
}

/**
 * After a membership change that removed someone, the daemon says how many counterparties should handshake again
 * (`handshakeAdvised`); shown until the app restarts, with the way to Counterparties.
 */
function useHandshakeAdvice(
  vault: string,
): { counterparties: number; action: { label: string; onClick: () => void } } | undefined {
  const navigate = useNavigate();
  const [counterparties, setCounterparties] = useState(0);
  useEffect(
    () =>
      window.ome.onEvent((event: DaemonEvent) => {
        if (event.type === "handshakeAdvised" && event.vault === vault)
          setCounterparties(event.counterparties);
      }),
    [vault],
  );
  const action = useMemo(
    () => ({
      label: "Counterparties",
      onClick: () => void navigate({ to: "/vaults/$vault/counterparties", params: { vault } }),
    }),
    [navigate, vault],
  );
  return counterparties > 0 ? { counterparties, action } : undefined;
}

type Report = { key: string; kind: "alarm" | "warning" | "info"; text: string };

/** Keeper reports worth a banner, kept until the app restarts; the daemon doesn't store them for us. */
function useKeeperReports(vault: string): Report[] {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(
    () =>
      window.ome.onEvent((event: DaemonEvent) => {
        if (
          event.type !== "keeperEvent" ||
          !("vault" in event.event) ||
          event.event.vault !== vault
        )
          return;
        const report = reportOf(event.event);
        if (report)
          setReports((current) => [...current.filter((r) => r.key !== report.key), report]);
      }),
    [vault],
  );

  return reports;
}

function reportOf(event: Extract<DaemonEvent, { type: "keeperEvent" }>["event"]): Report | null {
  switch (event.type) {
    case "unexpectedSpend":
      return {
        key: `spend-${event.txHash}`,
        kind: "alarm",
        text: `A transaction from this vault matches no approved proposal (${event.txHash.slice(0, 6)}…${event.txHash.slice(-4)}).`,
      };
    case "invalidPartials":
      return {
        key: `partials-${event.member}`,
        kind: "warning",
        text: `Member ${event.member}'s keeper sent read shares that don't verify. Reads use the other keepers.`,
      };
    case "pendingExpired":
      return {
        key: "pending-expired",
        kind: "info",
        text: "A membership change didn't complete, so its pending share was discarded.",
      };
    default:
      return null;
  }
}
