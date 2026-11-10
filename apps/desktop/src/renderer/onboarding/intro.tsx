import { useEffect, useState } from "react";

import { Logo } from "@ome-labs/brand/web";
import { Banner, Button, Tag } from "@ome-labs/ui-web";

import type { Preflight } from "../../bridge/contract.ts";
import { StepHeading } from "./layout.tsx";

/** The first screen: what Ome is, and whether this computer has what it needs to set up a profile. */
export function Intro({ onStart }: { onStart: () => void }) {
  const [preflight, setPreflight] = useState<Preflight>();
  useEffect(() => {
    void window.ome.session.preflight().then(setPreflight);
  }, []);
  const missing = preflight !== undefined && preflight.omed === null;

  return (
    <>
      <Logo variant="mark" title="Ome" className="size-10" />
      <StepHeading title="Welcome to Ome">
        A private multisig vault on Aztec: members approve together, and read together.
      </StepHeading>

      {missing ? (
        <Banner kind="warning">
          Ome's daemon (omed) isn't installed on this computer. Install Ome from ome.network, then
          open the app again.
        </Banner>
      ) : null}

      <div>
        <Button variant="primary" size="lg" disabled={!preflight || missing} onClick={onStart}>
          Set up Ome
        </Button>
      </div>

      <section className="flex flex-col rounded-lg bg-surface px-4 py-2 shadow-1">
        <h2 className="pt-2 pb-1 type-overline text-fg-subtle">This computer</h2>
        <Check label="Daemon" path={preflight?.omed} />
        <Check label="Keeper" path={preflight?.keeper} />
        <Check label="Profiles" path={preflight?.home} found />
      </section>
    </>
  );
}

function Check({
  label,
  path,
  found,
}: {
  label: string;
  path: string | null | undefined;
  found?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line-subtle py-2.5 first-of-type:border-t-0">
      <span className="type-body-s text-fg">{label}</span>
      {path === undefined ? (
        <span className="type-body-s text-fg-subtle">Checking…</span>
      ) : path === null ? (
        <Tag tone="warning">Not found</Tag>
      ) : (
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate type-mono-s text-fg-muted" title={path}>
            {path}
          </span>
          {found ? null : <Tag tone="success">Found</Tag>}
        </span>
      )}
    </div>
  );
}
