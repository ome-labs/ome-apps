import type { ReactElement } from "react";

import { proposalStatuses, readingHealth } from "@ome-labs/format";
import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, test } from "vitest";

import {
  ActivityRow,
  Address,
  Amount,
  AppShell,
  Banner,
  Button,
  Card,
  CardHeader,
  Checkbox,
  CodeBox,
  DetailRow,
  EmptyState,
  Field,
  FilterChip,
  Hash,
  HealthMeter,
  IconButton,
  MemberAvatar,
  ProposalTable,
  QrCode,
  RadioGroup,
  ReviewPanel,
  SegmentedControl,
  Select,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  StatusBadge,
  StepList,
  StepRow,
  Switch,
  Tabs,
  Tag,
  TextField,
  ThemeProvider,
  ThresholdChip,
  TokenMonogram,
  TooltipProvider,
  TopBar,
  TypeToConfirm,
  VaultSwitcher,
  VoteProgress,
} from "../src/index.ts";
import { aliases, now, omet, peers, proposals, reviewOfAuditDeposit, treasury } from "./sample.ts";

const noop = () => {};
const unlockOptions = [
  { value: "5", label: "5 min" },
  { value: "15", label: "15 min" },
] as const;

// One representative render per domain, with the states most likely to break semantics: disabled and invalid
// controls, every status, a failed review check, an open overlay. The kit app (apps/kit) shows them all.
const cases: [string, ReactElement][] = [
  [
    "actions",
    <>
      <Button variant="primary" icon="signature">
        Approve
      </Button>
      <Button variant="danger" disabled>
        Remove member
      </Button>
      <IconButton icon="lock" label="Lock signer" />
    </>,
  ],
  [
    "forms",
    <>
      <TextField label="To" defaultValue="dave" error="Not an address or alias." mono />
      <Field label="Expires in">
        <Select defaultValue="24" options={[{ value: "24", label: "24 hours" }]} />
      </Field>
      <Checkbox label="Every member" indeterminate />
      <RadioGroup aria-label="Unlock for" defaultValue="15" options={[...unlockOptions]} />
      <Switch label="Show Internals" disabled />
      <SegmentedControl
        aria-label="Unlock for"
        value="15"
        onValueChange={noop}
        options={[...unlockOptions]}
      />
    </>,
  ],
  [
    "navigation",
    <>
      <SidebarItem href="#proposals" icon="proposals" label="Proposals" count={2} active />
      <Tabs
        defaultValue="transfer"
        tabs={[
          { value: "transfer", label: "Transfer", content: "Send tokens from the vault." },
          { value: "calls", label: "Contract calls", content: "Call contracts from the vault." },
        ]}
      />
      <FilterChip label="Open" count={2} pressed onPressedChange={noop} />
    </>,
  ],
  [
    "status and identity",
    <>
      {proposalStatuses.map((status) => (
        <StatusBadge key={status} kind="proposal" status={status} />
      ))}
      <StatusBadge kind="service" status="failed" />
      <Tag tone="warning">Testnet</Tag>
      <MemberAvatar name="Alice" index={1} />
      <TokenMonogram token={omet} />
    </>,
  ],
  [
    "values and thresholds",
    <>
      <Address
        address={aliases.dave}
        label={{ label: "accounts:dave", source: "aztecWallet" }}
        flagAlias
      />
      <Hash value={proposals.auditDeposit.outerHash} noun="hash" />
      <Amount amount="340282366920938463463374607431768211455" token={omet} size="lg" />
      <ThresholdChip kind="read" threshold={2} members={3} />
      <VoteProgress proposal={proposals.tooLarge} />
      <HealthMeter health={readingHealth({ peers, serving: false, viewingThreshold: 2 })} />
    </>,
  ],
  [
    "steps, review and codes",
    <>
      <StepList label="Founding">
        <StepRow status="done" label="Agree on the plan" time="4.1 s" />
        <StepRow status="failed" label="Generate the shared key" detail="Keeper 3 did not answer" />
      </StepList>
      <ReviewPanel
        review={{
          ...reviewOfAuditDeposit,
          checks: { ...reviewOfAuditDeposit.checks, configCurrent: false },
        }}
      />
      <CodeBox label="Pay Treasury privately" value={treasury.address} />
      <QrCode value={treasury.address} label="Treasury's address" />
    </>,
  ],
  [
    "feedback, data and surfaces",
    <>
      <Banner kind="alarm" action={{ label: "Review", onClick: noop }}>
        A transaction from this vault matches no approved proposal.
      </Banner>
      <ProposalTable
        proposals={[proposals.designWork, proposals.tooLarge]}
        hrefFor={(proposal) => `#${proposal.id}`}
        now={now}
      />
      <ul aria-label="Activity">
        <ActivityRow
          entry={{ kind: "proposal", at: now - 60, proposal: proposals.auditDeposit }}
          now={now}
        />
      </ul>
      <Card>
        <CardHeader title={treasury.name} />
        <dl>
          <DetailRow label="Config version">1</DetailRow>
        </dl>
      </Card>
      <EmptyState illustration="no-proposals" title="Nothing waiting for you." />
    </>,
  ],
  [
    "shell",
    <AppShell
      key="shell"
      topBar={
        <TopBar
          node={{ state: "syncing", network: "Local network", synced: 1204, block: 1210 }}
          keeper="running"
          signer={{ locked: true }}
          onUnlock={noop}
          now={now}
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
        >
          <SidebarGroup title="Vault">
            <SidebarItem href="#balances" icon="token" label="Balances" />
          </SidebarGroup>
        </Sidebar>
      }
    >
      <h1>Treasury</h1>
    </AppShell>,
  ],
  [
    "an open type-to-confirm dialog",
    <TypeToConfirm
      key="type-to-confirm"
      open
      title="Remove Carol from Treasury?"
      description="Carol's keeper share will be replaced."
      phrase="Treasury"
      confirmLabel="Remove member"
      onConfirm={noop}
    />,
  ],
];

describe("axe", () => {
  test.each(cases)("%s render with no violations", async (_, element) => {
    // A page puts its content in a main landmark; the app shell brings its own.
    const page = element.type === AppShell ? element : <main>{element}</main>;
    render(
      <ThemeProvider initial="light">
        <TooltipProvider>{page}</TooltipProvider>
      </ThemeProvider>,
    );

    // The whole document, so portalled overlays are checked too. Colour contrast is left to the tokens' own
    // test: jsdom doesn't compute styles, so axe can't measure it here.
    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });

    expect(
      results.violations.map(
        (violation) =>
          `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
      ),
    ).toEqual([]);
  });
});
