import { needsMyVote, readingHealth } from "@ome-labs/format";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../src/actions/button.tsx";
import { ProposalTable } from "../../src/data/proposal-row.tsx";
import { Banner } from "../../src/feedback/banner.tsx";
import { MemberAvatar } from "../../src/identity/member-avatar.tsx";
import { TokenMonogram } from "../../src/identity/token-monogram.tsx";
import { SidebarItem } from "../../src/navigation/sidebar-item.tsx";
import { AppShell, PageHeader } from "../../src/shell/app-shell.tsx";
import { Sidebar, SidebarGroup } from "../../src/shell/sidebar.tsx";
import { TopBar, type TopBarProps } from "../../src/shell/top-bar.tsx";
import { VaultSwitcher } from "../../src/shell/vault-switcher.tsx";
import { Card, CardHeader } from "../../src/surfaces/card.tsx";
import { HealthMeter } from "../../src/thresholds/health-meter.tsx";
import { ThresholdChip } from "../../src/thresholds/threshold-chip.tsx";
import { Amount } from "../../src/values/amount.tsx";
import { now, omet, peers, proposals, treasury } from "../sample.ts";

const meta = { title: "Shell/App shell", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};
const open = [proposals.designWork, proposals.tooLarge, proposals.auditDeposit];
const waiting = Object.values(proposals).filter(needsMyVote).length;

const profile = (
  <span className="flex items-center gap-1.5 type-label-m">
    <MemberAvatar name="Alice" index={1} size="sm" />
    Alice
  </span>
);

function Shell({ top, banner }: { top?: Partial<TopBarProps>; banner?: boolean }) {
  return (
    <AppShell
      topBar={
        <TopBar
          node={{ state: "ready", network: "Local network", block: 1204 }}
          keeper="running"
          signer={{ locked: false, unlockedUntil: now + 14 * 60 }}
          now={now}
          profile={profile}
          windowControlsInset
          {...top}
        />
      }
      sidebar={
        <Sidebar
          header={
            <VaultSwitcher
              vaults={[{ ...treasury, alias: "treasury" }]}
              current={treasury.address}
              onSelect={noop}
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
          <Banner kind="alarm" action={{ label: "Review", onClick: noop }}>
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
          <Button variant="primary" icon="plus">
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

export const Overview: Story = { render: () => <Shell /> };
export const Locked: Story = {
  render: () => <Shell top={{ signer: { locked: true }, onUnlock: noop }} />,
};
export const Syncing: Story = {
  render: () => (
    <Shell
      top={{ node: { state: "syncing", network: "Local network", synced: 1204, block: 1210 } }}
    />
  ),
};
export const NodeUnreachable: Story = {
  render: () => (
    <Shell top={{ node: { state: "unreachable", network: "Local network" }, keeper: "failed" }} />
  ),
};
export const Alarm: Story = { render: () => <Shell banner /> };
