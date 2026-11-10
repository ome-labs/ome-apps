import { useMemo } from "react";

import { Link, useParams } from "@tanstack/react-router";

import type { VaultSummary } from "@ome-labs/api";

import { useOme } from "../data/ome.ts";
import { APP_PAGES, type Page, VAULT_PAGES } from "../routes/pages.ts";

const SELECTED_VAULT = { className: "font-semibold" };
const SELECTED_PAGE = { className: "bg-neutral-100" };
const EXACT = { exact: true };
const PREFIX = { exact: false };

/** The vault switcher, the selected vault's pages, and the app's own pages. */
export function Sidebar() {
  const vaults = useOme("vault.list", {});
  const params = useParams({ strict: false }) as { vault?: string };
  const selected = params.vault ?? vaults.data?.find((v) => v.isDefault)?.address;

  return (
    <nav className="space-y-6 overflow-auto border-r border-neutral-200 p-3 text-sm">
      <ul className="space-y-1">
        {vaults.data?.map((vault) => (
          <li key={vault.address}>
            <VaultLink vault={vault} />
          </li>
        ))}
      </ul>

      {selected && (
        <ul className="space-y-1">
          {VAULT_PAGES.filter((page) => !page.path.includes("$")).map((page) => (
            <li key={page.path}>
              <VaultPageLink page={page} vault={selected} />
            </li>
          ))}
        </ul>
      )}

      <ul className="space-y-1 border-t border-neutral-200 pt-3">
        {APP_PAGES.map((page) => (
          <li key={page.path}>
            <Link to={page.path} className="block rounded px-2 py-1 hover:bg-neutral-100">
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function VaultLink({ vault }: { vault: VaultSummary }) {
  const params = useMemo(() => ({ vault: vault.address }), [vault.address]);
  return (
    <Link
      to="/vaults/$vault"
      params={params}
      className="block rounded px-2 py-1 hover:bg-neutral-100"
      activeProps={SELECTED_VAULT}
    >
      {vault.name}
      <span className="ml-2 text-xs text-neutral-500">
        {vault.threshold} of {vault.members}
      </span>
    </Link>
  );
}

function VaultPageLink({ page, vault }: { page: Page; vault: string }) {
  const params = useMemo(() => ({ vault }), [vault]);
  const overview = page.path === "/";
  return (
    <Link
      to={overview ? "/vaults/$vault" : `/vaults/$vault${page.path}`}
      params={params}
      className="block rounded px-2 py-1 hover:bg-neutral-100"
      activeOptions={overview ? EXACT : PREFIX}
      activeProps={SELECTED_PAGE}
    >
      {page.title}
    </Link>
  );
}
