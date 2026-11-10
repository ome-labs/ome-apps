// The settings pages, one per section, in the order the list on the left shows them.
import type { ReactNode } from "react";

import type { IconName } from "@ome-labs/icons/web";

import { useSettingsData } from "./data.ts";
import { About } from "./sections/about.tsx";
import { AztecWallet } from "./sections/aztec-wallet.tsx";
import { Fees } from "./sections/fees.tsx";
import { Keeper } from "./sections/keeper.tsx";
import { Network } from "./sections/network.tsx";
import { Profile } from "./sections/profile.tsx";
import { Relays } from "./sections/relays.tsx";
import { Signer } from "./sections/signer.tsx";

function ProfilePage() {
  const data = useSettingsData();
  return data ? <Profile profile={data.status.profile} /> : null;
}

function SignerPage() {
  const data = useSettingsData();
  return data ? <Signer signer={data.status.signer} settings={data.settings} /> : null;
}

function NetworkPage() {
  const data = useSettingsData();
  return data ? <Network node={data.status.node} /> : null;
}

function RelaysPage() {
  const data = useSettingsData();
  return data ? <Relays relays={data.settings.relays} /> : null;
}

function KeeperPage() {
  const data = useSettingsData();
  return data ? <Keeper keeper={data.status.keeper} remote={data.settings.remoteKeeper} /> : null;
}

function FeesPage() {
  const data = useSettingsData();
  return data ? <Fees salt={data.settings.feePayerSalt} /> : null;
}

function AztecWalletPage() {
  const data = useSettingsData();
  return data ? (
    <AztecWallet dir={data.settings.aztecWalletDir} sync={data.settings.aztecWalletSync} />
  ) : null;
}

function AboutPage() {
  const data = useSettingsData();
  return data ? <About info={data.info} keeper={data.status.keeper} /> : null;
}

export interface SettingsPageEntry {
  /** Under `/settings/`. */
  path: string;
  label: string;
  icon: IconName;
  component: () => ReactNode;
}

export const SETTINGS_PAGES: readonly SettingsPageEntry[] = [
  {
    path: "profile",
    label: "Profile",
    icon: "user",
    component: ProfilePage,
  },
  {
    path: "signer",
    label: "Signer",
    icon: "key",
    component: SignerPage,
  },
  {
    path: "network",
    label: "Network & node",
    icon: "node",
    component: NetworkPage,
  },
  {
    path: "relays",
    label: "Relays",
    icon: "relay",
    component: RelaysPage,
  },
  {
    path: "keeper",
    label: "Keeper",
    icon: "server",
    component: KeeperPage,
  },
  {
    path: "fees",
    label: "Fees",
    icon: "token",
    component: FeesPage,
  },
  {
    path: "aztec-wallet",
    label: "aztec-wallet",
    icon: "terminal",
    component: AztecWalletPage,
  },
  {
    path: "about",
    label: "About",
    icon: "info",
    component: AboutPage,
  },
];
