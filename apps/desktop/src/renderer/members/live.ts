// A vault's members with how this member's keeper reaches each of theirs. Reachability changes without an event
// (peers come and go on the network), so it is read again every few seconds while a page shows it.
import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import type { CommitteeMember, Hex32, MemberReachability } from "@ome-labs/api";

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
