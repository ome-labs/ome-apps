import { Navigate } from "@tanstack/react-router";

import { useOme } from "../data/ome.ts";

/** `/`: first run without a profile, Home without a vault, else the default vault's overview. */
export function Start() {
  const status = useOme("status", {});

  if (status.isPending) return null;
  if (status.isError) return <p className="p-8 text-sm text-red-700">{status.error.message}</p>;

  const { profile, defaultVault, vaults } = status.data;
  if (!profile) return <Navigate to="/welcome" />;
  const vault = defaultVault ?? vaults[0]?.address;
  if (!vault) return <Navigate to="/home" />;
  return <Navigate to="/vaults/$vault" params={{ vault }} />;
}
