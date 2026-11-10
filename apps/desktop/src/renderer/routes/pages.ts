// Every page of the desktop app, from the UI guide's site map (`research/desktop/ui-guide.md` §3 and §5). A page stays
// empty until its screen is built; each names its guide section and the daemon methods it will use.
import type { IconName } from "@ome-labs/icons/web";

import type { RendererMethod } from "../../bridge/contract.ts";

export interface Page {
  /** Path under the shell, or under `/vaults/$vault` for vault pages. */
  path: string;
  title: string;
  icon: IconName;
  /** Section of the UI guide that specifies it. */
  section: string;
  methods: readonly RendererMethod[];
}

export const APP_PAGES: readonly Page[] = [
  {
    path: "/home",
    icon: "home",
    title: "Home",
    section: "5.6",
    methods: ["status", "membership.request"],
  },
  {
    path: "/create",
    icon: "plus",
    title: "Create a vault",
    section: "5.17, 5.19",
    methods: [
      "lobby.create",
      "lobby.get",
      "lobby.start",
      "lobby.leave",
      "founding.begin",
      "founding.get",
    ],
  },
  {
    path: "/join",
    icon: "link",
    title: "Join a vault",
    section: "5.18",
    methods: ["lobby.inspect", "lobby.join", "founding.get"],
  },
  {
    path: "/join-request",
    icon: "user-plus",
    title: "Join an existing vault",
    section: "5.16",
    methods: ["membership.request", "membership.begin", "membership.get"],
  },
  {
    path: "/settings",
    icon: "settings",
    title: "Settings",
    section: "5.24",
    methods: [
      "config.get",
      "config.set",
      "relays.set",
      "keeper.connect",
      "daemon.info",
      "signer.sealingKey",
    ],
  },
];

export const VAULT_PAGES: readonly Page[] = [
  {
    path: "/",
    icon: "home",
    title: "Overview",
    section: "5.7",
    methods: ["vault.details", "tokens.list", "proposals.list", "vault.peers", "vault.activity"],
  },
  {
    path: "/proposals",
    icon: "proposals",
    title: "Proposals",
    section: "5.8",
    methods: ["proposals.list"],
  },
  {
    path: "/proposals/$id",
    icon: "proposals",
    title: "Proposal",
    section: "5.10",
    methods: [
      "proposals.get",
      "proposals.review",
      "proposals.approve",
      "proposals.reject",
      "proposals.execute",
      "proposals.cancel",
    ],
  },
  {
    path: "/new",
    icon: "send",
    title: "New proposal",
    section: "5.9",
    methods: ["proposals.preview", "proposals.create", "contracts.functions", "aztec.aliases"],
  },
  {
    path: "/activity",
    icon: "activity",
    title: "Activity",
    section: "5.11",
    methods: ["vault.activity"],
  },
  {
    path: "/tokens",
    icon: "token",
    title: "Balances & tokens",
    section: "5.12",
    methods: ["tokens.list", "tokens.add", "tokens.remove", "tokens.deployTest"],
  },
  {
    path: "/receive",
    icon: "receive",
    title: "Receive",
    section: "5.13",
    methods: ["vault.details", "tokens.list", "config.get"],
  },
  {
    path: "/members",
    icon: "members",
    title: "Members",
    section: "5.14",
    methods: ["vault.details", "vault.peers"],
  },
  {
    path: "/health",
    icon: "shield-check",
    title: "Health",
    section: "5.14a",
    methods: ["vault.peers", "vault.details"],
  },
  {
    path: "/membership",
    icon: "rotate",
    title: "Change members",
    section: "5.15",
    methods: ["membership.plan", "membership.begin", "membership.get", "membership.list"],
  },
  {
    path: "/counterparties",
    icon: "peer",
    title: "Counterparties",
    section: "5.20",
    methods: ["vault.counterparties"],
  },
  {
    path: "/devices",
    icon: "phone",
    title: "Devices",
    section: "5.21",
    methods: [
      "devices.pair",
      "devices.list",
      "devices.enroll",
      "devices.revoke",
      "devices.forward",
    ],
  },
  {
    path: "/audit",
    icon: "audit",
    title: "Keeper audit log",
    section: "5.22",
    methods: ["vault.audit"],
  },
  {
    path: "/settings",
    icon: "settings",
    title: "Vault settings",
    section: "5.23",
    methods: ["vault.alias", "vault.use", "vault.retire", "vault.details"],
  },
];
