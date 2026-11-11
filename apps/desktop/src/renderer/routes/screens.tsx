// Which pages have screens, shared by the router (to render them) and the command menu (to offer only those). A page
// in the site map without a screen yet says so instead of rendering nothing.
import type { ReactNode } from "react";

import { EmptyState } from "@ome-labs/ui-web";

import { ActivityPage } from "../activity/activity-page.tsx";
import { CounterpartiesPage } from "../activity/counterparties-page.tsx";
import { AuditPage } from "../audit/audit-page.tsx";
import { HomePage } from "../home/home-page.tsx";
import { HealthPage } from "../members/health-page.tsx";
import { MembersPage } from "../members/members-page.tsx";
import { ChangeMembersPage } from "../membership/change-page.tsx";
import { JoinRequestPage } from "../membership/join-request-page.tsx";
import { OverviewPage } from "../overview/overview-page.tsx";
import { NewProposalPage } from "../proposals/new-proposal-page.tsx";
import { ProposalPage } from "../proposals/proposal-page.tsx";
import { ProposalsPage } from "../proposals/proposals-page.tsx";
import { ReceivePage } from "../receive/receive-page.tsx";
import { Page } from "../shell/page.tsx";
import { BalancesPage } from "../tokens/balances-page.tsx";
import { VaultSettingsPage } from "../vault-settings/vault-settings-page.tsx";
import type { Page as PageEntry } from "./pages.ts";

type Screen = () => ReactNode;

/** App pages with screens (create, join and settings have routes of their own). */
export const APP_SCREENS: Partial<Record<string, Screen>> = {
  "/home": HomePage,
  "/join-request": JoinRequestPage,
};

/** Vault pages with screens. */
export const VAULT_SCREENS: Partial<Record<string, Screen>> = {
  "/": OverviewPage,
  "/proposals": ProposalsPage,
  "/proposals/$id": ProposalPage,
  "/new": NewProposalPage,
  "/tokens": BalancesPage,
  "/receive": ReceivePage,
  "/members": MembersPage,
  "/health": HealthPage,
  "/activity": ActivityPage,
  "/counterparties": CounterpartiesPage,
  "/settings": VaultSettingsPage,
  "/audit": AuditPage,
  "/membership": ChangeMembersPage,
};

/** App pages with their own routes, which count as built. */
const OWN = new Set(["/create", "/join", "/settings"]);

export const isBuiltAppPage = (path: string): boolean => OWN.has(path) || path in APP_SCREENS;
export const isBuiltVaultPage = (path: string): boolean => path in VAULT_SCREENS;

/** A page of the site map whose screen comes in a later update. */
export function notYet(page: PageEntry): Screen {
  return function NotYet() {
    return (
      <Page title={page.title}>
        <EmptyState object="hourglass" className="pt-16" title="Coming in a later update">
          This page isn't in this version of Ome yet. Until it is, the ome command line does what it
          will do.
        </EmptyState>
      </Page>
    );
  };
}
