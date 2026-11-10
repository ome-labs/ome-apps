import { Link, useParams } from "@tanstack/react-router";

import { useOme } from "../data/ome.ts";
import { APP_PAGES, VAULT_PAGES } from "../routes/pages.ts";

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
            <Link
              to="/vaults/$vault"
              params={{ vault: vault.address }}
              className="block rounded px-2 py-1 hover:bg-neutral-100"
              activeProps={{ className: "font-semibold" }}
            >
              {vault.name}
              <span className="ml-2 text-xs text-neutral-500">
                {vault.threshold} of {vault.members}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {selected && (
        <ul className="space-y-1">
          {VAULT_PAGES.filter((page) => !page.path.includes("$")).map((page) => (
            <li key={page.path}>
              <Link
                to={`/vaults/$vault${page.path === "/" ? "" : page.path}`}
                params={{ vault: selected }}
                className="block rounded px-2 py-1 hover:bg-neutral-100"
                activeOptions={{ exact: page.path === "/" }}
                activeProps={{ className: "bg-neutral-100" }}
              >
                {page.title}
              </Link>
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
