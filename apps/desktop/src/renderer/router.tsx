// The app's routes, built from the page table. Hash history: the app is served from one `index.html`.
import {
  Outlet,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import { APP_PAGES, VAULT_PAGES, WELCOME_PAGE } from "./routes/pages.ts";
import { Start } from "./routes/start.tsx";
import { AppFrame } from "./shell/app-frame.tsx";

// Pages are empty until their screens are built, so their routes have no component yet.
const root = createRootRoute({ component: Outlet });

const start = createRoute({ getParentRoute: () => root, path: "/", component: Start });
const welcome = createRoute({
  getParentRoute: () => root,
  path: WELCOME_PAGE.path,
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
  shell.addChildren([...appPages, vault.addChildren(vaultPages)]),
]);

export const router = createRouter({ routeTree: tree, history: createHashHistory() });
