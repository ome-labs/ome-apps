// A vault's members with how this member's keeper reaches each of theirs. Reachability changes without an event
// (peers come and go on the network), so it is read again every few seconds while a page shows it.
import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import type { CommitteeMember, Hex32, MemberReachability } from "@ome-labs/api";
import { readingHealth, thresholdRisks, vaultHealth } from "@ome-labs/format";

import { callOme, omeQueryKey, useOme } from "../data/ome.ts";

const PEERS_POLL_MS = 5000;

export type MemberRow = {
  member: CommitteeMember;
  /** Undefined until the peers answer. */
  peer: MemberReachability | undefined;
};

export function useMembers(vault: Hex32) {
  const details = useOme("vault.details", { vault });
  const peers = useQuery({
    queryKey: omeQueryKey("vault.peers", { vault }),
    queryFn: () => callOme("vault.peers", { vault }),
    refetchInterval: PEERS_POLL_MS,
  });
  const rows = useMemo<MemberRow[]>(
    () =>
      (details.data?.committee.members ?? []).map((member) => ({
        member,
        peer: peers.data?.find((peer) => peer.index === member.index),
      })),
    [details.data, peers.data],
  );
  return { details, peers, rows };
}

/**
 * The vault's health as the Health page and the overview show it: keepers answering against the viewing threshold
 * (this member's keeper counts only while it runs and holds its share), the most serious state, and the risks of the
 * thresholds.
 */
export function useVaultHealth(vault: Hex32) {
  const members = useMembers(vault);
  const status = useOme("status", {});
  const data = members.details.data;
  const running = status.data ? status.data.keeper.status === "running" : true;
  const answers = Boolean(data?.committee.serving) && running;
  const peers = members.peers.data;

  const health = useMemo(() => {
    if (!data || !peers) return undefined;
    const reading = readingHealth({
      peers,
      serving: answers,
      viewingThreshold: data.committee.viewingThreshold,
    });
    return {
      reading,
      overall: vaultHealth({
        reading,
        serving: data.committee.serving,
        matchesCommittee: data.config?.matchesCommittee ?? null,
      }),
      risks: thresholdRisks({
        threshold: data.summary.threshold,
        viewingThreshold: data.committee.viewingThreshold,
        members: data.summary.members,
      }),
    };
  }, [answers, data, peers]);

  return { ...members, health, running, answers };
}
