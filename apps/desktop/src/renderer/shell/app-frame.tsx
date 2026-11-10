import { useCallback, useState } from "react";

import { Outlet, useParams } from "@tanstack/react-router";

import { AppShell } from "@ome-labs/ui-web";

import { useOme } from "../data/ome.ts";
import { Banners } from "./banners.tsx";
import { Commands } from "./commands.tsx";
import { daemonStates } from "./daemon-states.tsx";
import { Navigation } from "./navigation.tsx";
import { StatusBar } from "./status-bar.tsx";
import { Unlock } from "./unlock.tsx";

/**
 * Every page inside the app: the top bar, the sidebar and what's wrong right now. Before the status is in, the states
 * that replace the whole window.
 */
export function AppFrame() {
  const status = useOme("status", {});
  const { vault: routeVault } = useParams({ strict: false }) as { vault?: string };
  const [unlocking, setUnlocking] = useState(false);
  const openUnlock = useCallback(() => setUnlocking(true), []);

  const blocked = daemonStates(status);
  if (blocked || !status.data) return blocked;

  // The vault in the address, else the default, else the first: a member who just founded one has no default yet.
  const vault = routeVault ?? status.data.defaultVault ?? status.data.vaults[0]?.address;
  return (
    <>
      <AppShell
        topBar={<StatusBar status={status.data} onUnlock={openUnlock} />}
        sidebar={<Navigation vaults={status.data.vaults} current={vault} />}
        banner={<Banners status={status.data} vault={vault} />}
      >
        <Outlet />
      </AppShell>
      <Commands vaults={status.data.vaults} current={vault} onUnlock={openUnlock} />
      <Unlock
        open={unlocking}
        onOpenChange={setUnlocking}
        maxSeconds={status.data.settings.unlockTimeoutSecs}
      />
    </>
  );
}
