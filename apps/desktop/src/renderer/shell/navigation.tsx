import { useCallback, useMemo } from "react";

import { Link, useLocation, useNavigate } from "@tanstack/react-router";

import type { VaultSummary } from "@ome-labs/api";
import { Sidebar, SidebarGroup, SidebarItem, VaultSwitcher } from "@ome-labs/ui-web";

import { useOme } from "../data/ome.ts";
import { APP_PAGES, type Page, VAULT_PAGES } from "../routes/pages.ts";

/** The sidebar as Figma groups it: the vault's daily pages, its money and safety pages, then the app's. */
const VAULT_MAIN = ["/", "/proposals", "/activity", "/members", "/settings"];
const VAULT_MORE = ["/tokens", "/receive", "/counterparties", "/audit"];
const APP_FOOTER = ["/create", "/join", "/settings"];

const pick = (pages: readonly Page[], paths: string[]) =>
  paths.flatMap((path) => pages.filter((page) => page.path === path));

export function Navigation({
  vaults,
  current,
}: {
  vaults: VaultSummary[];
  current: string | undefined;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const choices = useMemo(
    () =>
      vaults.map((vault) => ({
        address: vault.address,
        name: vault.name,
        alias: vault.alias ?? vault.name.toLowerCase(),
        threshold: vault.threshold,
        members: vault.members,
      })),
    [vaults],
  );
  const select = useCallback(
    (vault: string) => void navigate({ to: "/vaults/$vault", params: { vault } }),
    [navigate],
  );

  return (
    <Sidebar
      header={
        current ? <VaultSwitcher vaults={choices} current={current} onSelect={select} /> : null
      }
      footer={
        <SidebarGroup>
          {pick(APP_PAGES, APP_FOOTER).map((page) => (
            <SidebarItem
              key={page.path}
              icon={page.icon}
              label={page.title}
              active={pathname === page.path}
              render={<Link to={page.path} />}
            />
          ))}
        </SidebarGroup>
      }
    >
      {current ? (
        <>
          <SidebarGroup>
            {pick(VAULT_PAGES, VAULT_MAIN).map((page) => (
              <VaultLink key={page.path} page={page} vault={current} pathname={pathname} />
            ))}
          </SidebarGroup>
          <SidebarGroup title="Vault">
            {pick(VAULT_PAGES, VAULT_MORE).map((page) => (
              <VaultLink key={page.path} page={page} vault={current} pathname={pathname} />
            ))}
          </SidebarGroup>
        </>
      ) : null}
    </Sidebar>
  );
}

function VaultLink({ page, vault, pathname }: { page: Page; vault: string; pathname: string }) {
  const base = `/vaults/${vault}`;
  const href = page.path === "/" ? base : `${base}${page.path}`;
  // The overview is active only on its own path; other pages also own what's under them (a proposal's page).
  const active =
    page.path === "/" ? pathname === base || pathname === `${base}/` : pathname.startsWith(href);
  const waiting = useWaitingCount(page.path === "/proposals" ? vault : undefined);

  return (
    <SidebarItem
      icon={page.icon}
      label={page.title}
      active={active}
      count={waiting || undefined}
      render={<Link to={href} />}
    />
  );
}

/** Proposals still collecting that this member hasn't voted on: what "Needs you" counts. */
function useWaitingCount(vault: string | undefined): number {
  const proposals = useOme(
    "proposals.list",
    { vault: vault ?? "" },
    { enabled: vault !== undefined },
  );
  return (
    proposals.data?.filter((p) => p.status === "collecting" && !p.approvedByMe && !p.rejectedByMe)
      .length ?? 0
  );
}
