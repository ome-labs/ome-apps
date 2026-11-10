import { needsMyVote, readingHealth } from "@ome-labs/format";
import {
  Amount,
  AppShell,
  Banner,
  Button,
  Card,
  CardHeader,
  HealthMeter,
  MemberAvatar,
  PageHeader,
  ProposalTable,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  ThresholdChip,
  TokenMonogram,
  TopBar,
  VaultSwitcher,
  toast,
  type TopBarProps,
} from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";
import { now, omet, peers, proposals, treasury } from "../sample/story.ts";

const open = [proposals.designWork, proposals.tooLarge, proposals.auditDeposit];
const waiting = Object.values(proposals).filter(needsMyVote).length;
const pressed = (label: string) => () => {
  toast.info(`${label} pressed`);
};

export function VaultShell({ top, banner }: { top?: Partial<TopBarProps>; banner?: boolean }) {
  return (
    <AppShell
      className="h-[720px] w-full min-w-[1000px] overflow-hidden rounded-lg border border-line-subtle"
      topBar={
        <TopBar
          node={{ state: "ready", network: "Local network", block: 1204 }}
          keeper="running"
          signer={{ locked: false, unlockedUntil: now + 14 * 60 }}
          now={now}
          onLock={pressed("Lock")}
          profile={
            <span className="flex items-center gap-1.5 type-label-m">
              <MemberAvatar name="Alice" index={1} size="sm" />
              Alice
            </span>
          }
          {...top}
        />
      }
      sidebar={
        <Sidebar
          header={
            <VaultSwitcher
              vaults={[{ ...treasury, alias: "treasury" }]}
              current={treasury.address}
              onSelect={pressed("Vault")}
            />
          }
          footer={
            <>
              <SidebarItem href="#create" icon="plus" label="Create vault" />
              <SidebarItem href="#join" icon="link" label="Join vault" />
              <SidebarItem href="#devices" icon="phone" label="Devices" />
            </>
          }
        >
          <SidebarGroup>
            <SidebarItem href="#overview" icon="home" label="Overview" active />
            <SidebarItem href="#proposals" icon="proposals" label="Proposals" count={waiting} />
            <SidebarItem href="#activity" icon="activity" label="Activity" />
            <SidebarItem href="#members" icon="members" label="Members" />
            <SidebarItem href="#settings" icon="settings" label="Settings" />
          </SidebarGroup>
          <SidebarGroup title="Vault">
            <SidebarItem href="#balances" icon="token" label="Balances" />
            <SidebarItem href="#receive" icon="receive" label="Receive" />
            <SidebarItem href="#counterparties" icon="link" label="Counterparties" />
            <SidebarItem href="#audit" icon="audit" label="Keeper audit" />
          </SidebarGroup>
        </Sidebar>
      }
      banner={
        banner ? (
          <Banner kind="alarm" action={{ label: "Review", onClick: pressed("Review") }}>
            This vault's on-chain config names a committee your keeper can't verify. It won't act
            until you look.
          </Banner>
        ) : null
      }
    >
      <PageHeader
        title={treasury.name}
        description={
          <span className="flex gap-2">
            <ThresholdChip kind="spend" threshold={2} members={3} />
            <ThresholdChip kind="read" threshold={2} members={3} />
          </span>
        }
        actions={
          <Button variant="primary" icon="plus" onClick={pressed("New proposal")}>
            New proposal
          </Button>
        }
      />
      <ProposalTable
        proposals={open}
        hrefFor={(proposal) => `#${proposal.id}`}
        now={now}
        label="Open proposals"
      />
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Balances" />
          <div className="flex items-center gap-3">
            <TokenMonogram token={omet} />
            <span className="flex-1 type-label-m">{omet.name}</span>
            <Amount amount="1000000000000000000000" token={omet} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Can this vault still read?" />
          <HealthMeter health={readingHealth({ peers, serving: true, viewingThreshold: 2 })} />
        </Card>
      </div>
    </AppShell>
  );
}

export function Locked() {
  return <VaultShell top={{ signer: { locked: true }, onUnlock: pressed("Unlock") }} />;
}

export function Syncing() {
  return (
    <VaultShell
      top={{ node: { state: "syncing", network: "Local network", synced: 1204, block: 1210 } }}
    />
  );
}

export function NodeUnreachable() {
  return (
    <VaultShell
      top={{ node: { state: "unreachable", network: "Local network" }, keeper: "failed" }}
    />
  );
}

export function Alarm() {
  return <VaultShell banner />;
}

function Overview() {
  return <VaultShell />;
}

export const shell: ExampleSet = {
  title: "Shell",
  description:
    "The desktop app's frame: the top bar reports the node, keeper and signer; the sidebar holds the vault and its places.",
  examples: [
    { name: "VaultShell", title: "Overview", Component: Overview, wide: true },
    { name: "Locked", title: "Signer locked", Component: Locked, wide: true },
    { name: "Syncing", title: "Node syncing", Component: Syncing, wide: true },
    {
      name: "NodeUnreachable",
      title: "Node unreachable, keeper failed",
      Component: NodeUnreachable,
      wide: true,
    },
    { name: "Alarm", title: "With an alarm", Component: Alarm, wide: true },
  ],
};
