import { useSearch } from "@tanstack/react-router";

import type { Hex16 } from "@ome-labs/api";

import { CreateForm } from "./create-form.tsx";
import { LobbyFlow } from "./flow.tsx";
import { JoinForm } from "./join-form.tsx";

/** The `?lobby=` a create or join page is following, once the lobby exists. */
export function validateLobbySearch(search: Record<string, unknown>): { lobby?: Hex16 } {
  return typeof search["lobby"] === "string" && /^0x[0-9a-f]{32}$/u.test(search["lobby"])
    ? { lobby: search["lobby"] as Hex16 }
    : {};
}

/** `/create`: name and thresholds, then the lobby and its founding. */
export function CreatePage() {
  const { lobby } = useSearch({ strict: false }) as { lobby?: Hex16 };
  return lobby ? <LobbyFlow key={lobby} lobby={lobby} /> : <CreateForm />;
}

/** `/join`: the invite, then the lobby and its founding. */
export function JoinPage() {
  const { lobby } = useSearch({ strict: false }) as { lobby?: Hex16 };
  return lobby ? <LobbyFlow key={lobby} lobby={lobby} /> : <JoinForm />;
}
