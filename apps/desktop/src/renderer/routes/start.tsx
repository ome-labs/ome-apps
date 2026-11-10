import { useMemo } from "react";

import { Navigate } from "@tanstack/react-router";

import { useOme } from "../data/ome.ts";
import { daemonStates } from "../shell/daemon-states.tsx";

/** `/`: Home without a vault, else the default vault's overview. */
export function Start() {
  const status = useOme("status", {});
  const vault = status.data?.defaultVault ?? status.data?.vaults[0]?.address;
  const params = useMemo(() => ({ vault: vault ?? "" }), [vault]);

  const blocked = daemonStates(status);
  if (blocked || !status.data) return blocked;

  if (!vault) return <Navigate to="/home" />;
  return <Navigate to="/vaults/$vault" params={params} />;
}
