import { useCallback } from "react";

import { useNavigate } from "@tanstack/react-router";

import type { Hex16 } from "@ome-labs/api";
import { Button, EmptyState } from "@ome-labs/ui-web";

import { FoundingPanel } from "./founding-panel.tsx";
import { useFounding, useLobby } from "./live.ts";
import { LobbyPanel } from "./lobby-panel.tsx";

/** A lobby this member is in: the lobby while it's open, then its founding. */
export function LobbyFlow({ lobby: id }: { lobby: Hex16 }) {
  const lobby = useLobby(id);
  const founding = useFounding(id);
  const navigate = useNavigate();
  const home = useCallback(() => void navigate({ to: "/home" }), [navigate]);

  if (lobby.isPending || founding === undefined) return null;
  if (lobby.isError) {
    return (
      <EmptyState
        illustration="not-found"
        title="This lobby isn't here"
        action={<Button onClick={home}>Back to Home</Button>}
      >
        {lobby.error.message}
      </EmptyState>
    );
  }
  if (lobby.data.status === "closed" && !founding) {
    return (
      <EmptyState
        illustration="cancelled"
        title="The lobby was closed"
        action={<Button onClick={home}>Back to Home</Button>}
      >
        The host closed it before founding. Ask them for a new invite.
      </EmptyState>
    );
  }
  if (lobby.data.status === "open") return <LobbyPanel lobby={lobby.data} />;
  return <FoundingPanel lobby={lobby.data} founding={founding} />;
}
