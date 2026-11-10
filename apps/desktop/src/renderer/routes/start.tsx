import { useMemo } from "react";

import { Navigate } from "@tanstack/react-router";

import { useOme } from "../data/ome.ts";

/** `/`: first run without a profile, Home without a vault, else the default vault's overview. */
export function Start() {
  const status = useOme("status", {});
  const vault = status.data?.defaultVault ?? status.data?.vaults[0]?.address;
  const params = useMemo(() => ({ vault: vault ?? "" }), [vault]);

  if (status.isPending) return null;
  if (status.isError) return <p className="p-8 text-sm text-red-700">{status.error.message}</p>;

  if (!status.data.profile) return <Navigate to="/welcome" />;
  if (!vault) return <Navigate to="/home" />;
  return <Navigate to="/vaults/$vault" params={params} />;
}
