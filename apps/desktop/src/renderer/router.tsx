// The app's routes, built from the page table. Hash history: the app is served from one `index.html`.
import {
  Navigate,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import { CreatePage, JoinPage, validateLobbySearch } from "./founding/pages.tsx";
import { HomePage } from "./home/home-page.tsx";
import { Profiles } from "./onboarding/profiles.tsx";
import { Welcome } from "./onboarding/welcome.tsx";
import { NewProposalPage } from "./proposals/new-proposal-page.tsx";
import { ProposalPage } from "./proposals/proposal-page.tsx";
import { ProposalsPage } from "./proposals/proposals-page.tsx";
import { APP_PAGES, VAULT_PAGES } from "./routes/pages.ts";
import { Start } from "./routes/start.tsx";
import { SettingsLayout } from "./settings/layout.tsx";
import { SETTINGS_PAGES } from "./settings/pages.tsx";
import { AppFrame } from "./shell/app-frame.tsx";
import { SessionGate } from "./shell/session-gate.tsx";

// The root decides between the first run, the profile list and the app. Pages are empty until their screens are
// built; Settings has its own pages, one per section.
const root = createRootRoute({ component: SessionGate });

const start = createRoute({ getParentRoute: () => root, path: "/", component: Start });
const welcome = createRoute({ getParentRoute: () => root, path: "/welcome", component: Welcome });
const profiles = createRoute({
  getParentRoute: () => root,
  path: "/profiles",
  component: Profiles,
});

const shell = createRoute({ getParentRoute: () => root, id: "shell", component: AppFrame });
/** App pages whose screens are built; the others stay empty frames for now. */
const SCREENS: Partial<Record<string, () => React.ReactNode>> = { "/home": HomePage };

/** Pages with routes of their own below (search params, child pages). */
const OWN_ROUTES = new Set(["/settings", "/create", "/join"]);

const appPages = APP_PAGES.filter((page) => !OWN_ROUTES.has(page.path)).map((page) => {
  const component = SCREENS[page.path];
  return createRoute({
    getParentRoute: () => shell,
    path: page.path,
    ...(component ? { component } : {}),
  });
});

const create = createRoute({
  getParentRoute: () => shell,
  path: "/create",
  validateSearch: validateLobbySearch,
  component: CreatePage,
});
const join = createRoute({
  getParentRoute: () => shell,
  path: "/join",
  validateSearch: validateLobbySearch,
  component: JoinPage,
});

const settings = createRoute({
  getParentRoute: () => shell,
  path: "/settings",
  component: SettingsLayout,
});
const settingsIndex = createRoute({
  getParentRoute: () => settings,
  path: "/",
  component: () => <Navigate to="/settings/profile" replace />,
});
const settingsPages = SETTINGS_PAGES.map((page) =>
  createRoute({ getParentRoute: () => settings, path: page.path, component: page.component }),
);

const vault = createRoute({ getParentRoute: () => shell, path: "/vaults/$vault" });
/** Vault pages built so far; the rest render the empty frame until they are. */
const VAULT_SCREENS: Partial<Record<string, () => React.ReactNode>> = {
  "/proposals": ProposalsPage,
  "/proposals/$id": ProposalPage,
  "/new": NewProposalPage,
};
const vaultPages = VAULT_PAGES.map((page) => {
  const component = VAULT_SCREENS[page.path];
  return createRoute({
    getParentRoute: () => vault,
    path: page.path,
    ...(component ? { component } : {}),
  });
});

const tree = root.addChildren([
  start,
  welcome,
  profiles,
  shell.addChildren([
    ...appPages,
    create,
    join,
    settings.addChildren([settingsIndex, ...settingsPages]),
    vault.addChildren(vaultPages),
  ]),
]);

export const router = createRouter({ routeTree: tree, history: createHashHistory() });
