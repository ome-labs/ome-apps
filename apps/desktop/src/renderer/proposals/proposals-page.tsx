import { useCallback, useMemo, useState } from "react";

import { useNavigate, useParams } from "@tanstack/react-router";

import type { Hex32, ProposalView } from "@ome-labs/api";
import { Banner, Button, EmptyState, FilterChip, ProposalTable } from "@ome-labs/ui-web";

import { useOme } from "../data/ome.ts";
import { useNow } from "../shell/now.ts";
import { Page } from "../shell/page.tsx";
import { FILTERS, type ProposalFilter, matching } from "./filters.ts";

const EMPTY = {
  open: { title: "Nothing waiting", text: "Every proposal is done. Start one to move funds." },
  ready: { title: "Nothing ready", text: "A proposal is ready once enough members approve it." },
  done: { title: "Nothing done yet", text: "Executed, cancelled and expired proposals show here." },
  all: {
    title: "No proposals yet",
    text: "A proposal moves funds once enough members approve it.",
  },
} as const;

/** `/vaults/$vault/proposals`: every proposal in the vault, newest first. */
export function ProposalsPage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const navigate = useNavigate();
  const now = useNow();
  const list = useOme("proposals.list", { vault });
  const [filter, setFilter] = useState<ProposalFilter>("all");

  const proposals = useMemo(() => list.data ?? [], [list.data]);
  const shown = useMemo(() => matching(proposals, filter), [proposals, filter]);
  const hrefFor = useCallback(
    (proposal: ProposalView) => `#/vaults/${vault}/proposals/${proposal.id}`,
    [vault],
  );
  const create = useCallback(
    () => void navigate({ to: "/vaults/$vault/new", params: { vault } }),
    [navigate, vault],
  );

  return (
    <Page
      title="Proposals"
      lead="Every payment from the vault starts as a proposal. It goes through once enough members approve it."
      actions={
        <Button variant="primary" icon="plus" onClick={create}>
          New proposal
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Filter
              key={item.id}
              id={item.id}
              label={item.label}
              count={list.data ? matching(proposals, item.id).length : undefined}
              pressed={filter === item.id}
              onPick={setFilter}
            />
          ))}
        </div>

        {list.error ? <Banner kind="alarm">{list.error.message}</Banner> : null}
        {list.data && shown.length === 0 ? (
          <EmptyState
            object="ballot"
            className="pt-16"
            title={EMPTY[filter].title}
            action={
              filter === "open" || filter === "all" ? (
                <Button icon="plus" onClick={create}>
                  New proposal
                </Button>
              ) : undefined
            }
          >
            {EMPTY[filter].text}
          </EmptyState>
        ) : null}
        {shown.length > 0 ? <ProposalTable proposals={shown} now={now} hrefFor={hrefFor} /> : null}
      </div>
    </Page>
  );
}

function Filter({
  id,
  label,
  count,
  pressed,
  onPick,
}: {
  id: ProposalFilter;
  label: string;
  count: number | undefined;
  pressed: boolean;
  onPick: (filter: ProposalFilter) => void;
}) {
  const press = useCallback(() => onPick(id), [id, onPick]);
  return <FilterChip label={label} count={count} pressed={pressed} onPressedChange={press} />;
}
