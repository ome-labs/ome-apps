import { useCallback } from "react";

import { Outlet, useParams } from "@tanstack/react-router";

import type { Status } from "@ome-labs/api";
import { AppShell } from "@ome-labs/ui-web";

import { useOme } from "../data/ome.ts";
import { Banners } from "./banners.tsx";
import { Commands } from "./commands.tsx";
import { daemonStates } from "./daemon-states.tsx";
import { Navigation } from "./navigation.tsx";
import { SignerProvider, useUnlock } from "./signer.tsx";
import { StatusBar } from "./status-bar.tsx";

/**
 * Every page inside the app: the top bar, the sidebar and what's wrong right now. Before the status is in, the states
 * that replace the whole window.
 */
export function AppFrame() {
  const status = useOme("status", {});

  const blocked = daemonStates(status);
  if (blocked || !status.data) return blocked;
  return (
    <SignerProvider maxSeconds={status.data.settings.unlockTimeoutSecs}>
      <Frame status={status.data} />
    </SignerProvider>
  );
}

function Frame({ status }: { status: Status }) {
  const { vault: routeVault } = useParams({ strict: false }) as { vault?: string };
  const unlock = useUnlock();
  const openUnlock = useCallback(() => void unlock(), [unlock]);

  // The vault in the address, else the default, else the first: a member who just founded one has no default yet.
  const vault = routeVault ?? status.defaultVault ?? status.vaults[0]?.address;
  return (
    <>
      <AppShell
        topBar={<StatusBar status={status} onUnlock={openUnlock} />}
        sidebar={<Navigation vaults={status.vaults} current={vault} />}
        banner={<Banners status={status} vault={vault} />}
      >
        <Outlet />
      </AppShell>
      <Commands vaults={status.vaults} current={vault} onUnlock={openUnlock} />
    </>
  );
}
