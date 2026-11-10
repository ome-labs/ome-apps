// The app's routes, built from the page table. Hash history: the app is served from one `index.html`.
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import { Profiles } from "./onboarding/profiles.tsx";
import { Welcome } from "./onboarding/welcome.tsx";
import { APP_PAGES, VAULT_PAGES } from "./routes/pages.ts";
import { Start } from "./routes/start.tsx";
import { AppFrame } from "./shell/app-frame.tsx";
import { SessionGate } from "./shell/session-gate.tsx";

// The root decides between the first run, the profile list and the app. Pages are empty until their screens are
// built, so their routes have no component yet.
const root = createRootRoute({ component: SessionGate });

const start = createRoute({ getParentRoute: () => root, path: "/", component: Start });
const welcome = createRoute({ getParentRoute: () => root, path: "/welcome", component: Welcome });
const profiles = createRoute({
  getParentRoute: () => root,
  path: "/profiles",
  component: Profiles,
});

const shell = createRoute({ getParentRoute: () => root, id: "shell", component: AppFrame });
const appPages = APP_PAGES.map((page) =>
  createRoute({
    getParentRoute: () => shell,
    path: page.path,
  }),
);

const vault = createRoute({ getParentRoute: () => shell, path: "/vaults/$vault" });
const vaultPages = VAULT_PAGES.map((page) =>
  createRoute({
    getParentRoute: () => vault,
    path: page.path,
  }),
);

const tree = root.addChildren([
  start,
  welcome,
  profiles,
  shell.addChildren([...appPages, vault.addChildren(vaultPages)]),
]);

export const router = createRouter({ routeTree: tree, history: createHashHistory() });
