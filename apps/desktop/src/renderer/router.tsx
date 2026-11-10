// The app's routes, built from the page table. Hash history: the app is served from one `index.html`.
import {
  Outlet,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useParams,
} from "@tanstack/react-router";

import { DevPanel } from "./dev/dev-panel.tsx";
import { APP_PAGES, type Page, VAULT_PAGES, WELCOME_PAGE } from "./routes/pages.ts";
import { Placeholder } from "./routes/placeholder.tsx";
import { Start } from "./routes/start.tsx";
import { AppShell } from "./shell/app-shell.tsx";

function PageRoute({ page }: { page: Page }) {
  const params = useParams({ strict: false }) as { vault?: string; id?: string };
  return <Placeholder page={page} route={{ vault: params.vault ?? "", id: params.id ?? "" }} />;
}

const root = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEV && <DevPanel />}
    </>
  ),
});

const start = createRoute({ getParentRoute: () => root, path: "/", component: Start });
const welcome = createRoute({
  getParentRoute: () => root,
  path: WELCOME_PAGE.path,
  component: () => <PageRoute page={WELCOME_PAGE} />,
});

const shell = createRoute({ getParentRoute: () => root, id: "shell", component: AppShell });
const appPages = APP_PAGES.map((page) =>
  createRoute({
    getParentRoute: () => shell,
    path: page.path,
    component: () => <PageRoute page={page} />,
  }),
);

const vault = createRoute({ getParentRoute: () => shell, path: "/vaults/$vault" });
const vaultPages = VAULT_PAGES.map((page) =>
  createRoute({
    getParentRoute: () => vault,
    path: page.path,
    component: () => <PageRoute page={page} />,
  }),
);

const tree = root.addChildren([
  start,
  welcome,
  shell.addChildren([...appPages, vault.addChildren(vaultPages)]),
]);

export const router = createRouter({ routeTree: tree, history: createHashHistory() });
