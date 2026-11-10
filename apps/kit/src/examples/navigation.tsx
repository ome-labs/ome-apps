import { useState } from "react";

import { FilterChip, Kbd, KbdCombo, SidebarItem, Tabs } from "@ome-labs/ui-web";

import type { ExampleSet } from "../bench/examples-page.tsx";

export function SidebarItems() {
  return (
    <div className="flex w-56 flex-col gap-0.5">
      <SidebarItem href="#overview" icon="home" label="Overview" active />
      <SidebarItem href="#proposals" icon="proposals" label="Proposals" count={2} />
      <SidebarItem href="#activity" icon="activity" label="Activity" />
      <SidebarItem href="#members" icon="members" label="Members" />
    </div>
  );
}

export function ProposalTabs() {
  return (
    <Tabs
      defaultValue="transfer"
      tabs={[
        {
          value: "transfer",
          label: "Transfer",
          content: <p className="type-body-s text-fg-muted">Send tokens from the vault.</p>,
        },
        {
          value: "calls",
          label: "Contract calls",
          content: <p className="type-body-s text-fg-muted">Call contracts from the vault.</p>,
        },
      ]}
    />
  );
}

export function FilterChips() {
  const [filter, setFilter] = useState("open");
  const filters = [
    ["open", "Open", 2],
    ["ready", "Ready", 0],
    ["done", "Done", 1],
    ["all", "All", 3],
  ] as const;

  return (
    <div role="toolbar" aria-label="Filter proposals" className="flex flex-wrap gap-2">
      {filters.map(([value, label, count]) => (
        <FilterChip
          key={value}
          label={label}
          count={count}
          pressed={filter === value}
          onPressedChange={() => setFilter(value)}
        />
      ))}
    </div>
  );
}

export function Keys() {
  return (
    <div className="flex flex-col gap-3 type-body-s text-fg-muted">
      <p className="flex items-center gap-2">
        <KbdCombo keys={["⌘", "K"]} /> opens the command menu
      </p>
      <p className="flex items-center gap-2">
        <KbdCombo keys={["⌘", "⇧", "L"]} /> locks the signer
      </p>
      <p className="flex items-center gap-2">
        <Kbd>esc</Kbd> closes any overlay
      </p>
    </div>
  );
}

export const navigation: ExampleSet = {
  title: "Navigation",
  description:
    "Sidebar items are links that mark the current page; counts only appear when something waits for the member.",
  examples: [
    { name: "SidebarItems", title: "Sidebar items", Component: SidebarItems },
    { name: "ProposalTabs", title: "Tabs", Component: ProposalTabs },
    { name: "FilterChips", title: "Filter chips", Component: FilterChips },
    {
      name: "Keys",
      title: "Keys",
      description:
        "One raised keycap per key; screen readers hear the modifier's name, not its glyph.",
      Component: Keys,
    },
  ],
};
