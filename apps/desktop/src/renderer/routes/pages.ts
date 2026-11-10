// Every page of the desktop app, from the UI guide's site map (`research/desktop/ui-guide.md` §3 and §5). Each is a
// placeholder until its screen is built from @ome-labs/ui-web: it names its guide section, the daemon methods it uses,
// and shows the data its main method returns.
import type { RendererMethod } from "../../shared/contract.ts";

export interface Page {
  /** Path under the shell, or under `/vaults/$vault` for vault pages. */
  path: string;
  title: string;
  /** Section of the UI guide that specifies it. */
  section: string;
  methods: readonly RendererMethod[];
  /** The call whose result the placeholder shows, from the route's vault and proposal id. */
  preview?: (route: { vault: string; id: string }) => { method: RendererMethod; params: unknown };
}

const vaultOnly = (method: RendererMethod) => (route: { vault: string }) => ({
  method,
  params: { vault: route.vault },
});

/** First run, shown without the shell. */
export const WELCOME_PAGE: Page = {
  path: "/welcome",
  title: "Welcome",
  section: "5.1–5.3",
  methods: ["profile.create", "signer.sealingKey"],
};

export const APP_PAGES: readonly Page[] = [
  { path: "/home", title: "Home", section: "5.6", methods: ["status", "membership.request"] },
  {
    path: "/create",
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
    title: "Join a vault",
    section: "5.18",
    methods: ["lobby.inspect", "lobby.join", "founding.get"],
  },
  {
    path: "/join-request",
    title: "Join an existing vault",
    section: "5.16",
    methods: ["membership.request", "membership.begin", "membership.get"],
  },
  {
    path: "/settings",
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
    preview: () => ({ method: "config.get", params: {} }),
  },
];

export const VAULT_PAGES: readonly Page[] = [
  {
    path: "/",
    title: "Overview",
    section: "5.7",
    methods: ["vault.details", "tokens.list", "proposals.list", "vault.peers", "vault.activity"],
    preview: vaultOnly("vault.details"),
  },
  {
    path: "/proposals",
    title: "Proposals",
    section: "5.8",
    methods: ["proposals.list"],
    preview: vaultOnly("proposals.list"),
  },
  {
    path: "/proposals/$id",
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
    preview: ({ vault, id }) => ({ method: "proposals.review", params: { vault, id } }),
  },
  {
    path: "/new",
    title: "New proposal",
    section: "5.9",
    methods: ["proposals.preview", "proposals.create", "contracts.functions", "aztec.aliases"],
    preview: () => ({ method: "aztec.aliases", params: {} }),
  },
  {
    path: "/activity",
    title: "Activity",
    section: "5.11",
    methods: ["vault.activity"],
    preview: vaultOnly("vault.activity"),
  },
  {
    path: "/tokens",
    title: "Balances & tokens",
    section: "5.12",
    methods: ["tokens.list", "tokens.add", "tokens.remove", "tokens.deployTest"],
    preview: vaultOnly("tokens.list"),
  },
  {
    path: "/receive",
    title: "Receive",
    section: "5.13",
    methods: ["vault.details", "tokens.list", "config.get"],
  },
  {
    path: "/members",
    title: "Members",
    section: "5.14",
    methods: ["vault.details", "vault.peers"],
    preview: vaultOnly("vault.peers"),
  },
  { path: "/health", title: "Health", section: "5.14a", methods: ["vault.peers", "vault.details"] },
  {
    path: "/membership",
    title: "Change members",
    section: "5.15",
    methods: ["membership.plan", "membership.begin", "membership.get", "membership.list"],
    preview: vaultOnly("membership.list"),
  },
  {
    path: "/counterparties",
    title: "Counterparties",
    section: "5.20",
    methods: ["vault.counterparties"],
    preview: vaultOnly("vault.counterparties"),
  },
  {
    path: "/devices",
    title: "Devices",
    section: "5.21",
    methods: [
      "devices.pair",
      "devices.list",
      "devices.enroll",
      "devices.revoke",
      "devices.forward",
    ],
    preview: () => ({ method: "devices.list", params: {} }),
  },
  {
    path: "/audit",
    title: "Keeper audit log",
    section: "5.22",
    methods: ["vault.audit"],
    preview: ({ vault }) => ({ method: "vault.audit", params: { vault, limit: 100 } }),
  },
  {
    path: "/settings",
    title: "Vault settings",
    section: "5.23",
    methods: ["vault.alias", "vault.use", "vault.retire", "vault.details"],
  },
];
