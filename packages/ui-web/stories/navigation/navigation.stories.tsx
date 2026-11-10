import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { FilterChip } from "../../src/navigation/filter-chip.tsx";
import { SidebarItem } from "../../src/navigation/sidebar-item.tsx";
import { Tabs } from "../../src/navigation/tabs.tsx";

const meta = { title: "Navigation/Navigation" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const SidebarItems: Story = {
  render: () => (
    <div className="flex w-56 flex-col gap-0.5">
      <SidebarItem href="#overview" icon="home" label="Overview" active />
      <SidebarItem href="#proposals" icon="proposals" label="Proposals" count={2} />
      <SidebarItem href="#activity" icon="activity" label="Activity" />
      <SidebarItem href="#members" icon="members" label="Members" />
    </div>
  ),
};

export const TabsStory: Story = {
  name: "Tabs",
  render: () => (
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
  ),
};

function Filters() {
  const [filter, setFilter] = useState("open");
  const filters = [
    ["open", "Open", 2],
    ["ready", "Ready", 0],
    ["done", "Done", 1],
    ["all", "All", 3],
  ] as const;

  return (
    <div role="toolbar" aria-label="Filter proposals" className="flex gap-2">
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

export const FilterChips: Story = { render: () => <Filters /> };
