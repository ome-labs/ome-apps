import { Popover, cn } from "@ome-labs/ui-web";

import type { Preflight } from "../../bridge/contract.ts";

/** One program the setup needs, as a pill: a live dot when it's there, and the details in a popover. */
function ServicePill({
  label,
  path,
  missing,
}: {
  label: string;
  path: string | null;
  missing: string;
}) {
  const found = path !== null;
  return (
    <Popover
      side="top"
      title={found ? `${label} ready` : `${label} not installed`}
      trigger={
        <button
          type="button"
          className="focus-ring flex h-7 items-center gap-2 rounded-full bg-surface px-3 type-label-s text-fg-muted shadow-1 transition-[color] duration-fast ease-standard hover:text-fg"
        >
          <span className="relative flex size-2">
            {found ? (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-50 motion-reduce:hidden" />
            ) : null}
            <span
              className={cn("relative size-2 rounded-full", found ? "bg-success" : "bg-warning")}
            />
          </span>
          {label} {found ? "ready" : "missing"}
        </button>
      }
    >
      {found ? (
        <p className="flex flex-col gap-1 type-body-s text-fg-muted">
          Found at
          <span className="break-all type-mono-s text-fg">{path}</span>
        </p>
      ) : (
        <p className="type-body-s text-fg-muted">{missing}</p>
      )}
    </Popover>
  );
}

/** Whether the daemon and the keeper are installed, before anything is set up. */
export function ServicePills({ preflight }: { preflight: Preflight | undefined }) {
  if (!preflight) return null;
  return (
    <div className="flex items-center gap-2">
      <ServicePill
        label="Daemon"
        path={preflight.omed}
        missing="Ome's daemon (omed) keeps your wallet and signing key. Install Ome from ome.network, or set OME_DAEMON to where omed is, then open the app again."
      />
      <ServicePill
        label="Keeper"
        path={preflight.keeper}
        missing="The keeper holds your share of the vault's viewing key. Install Ome from ome.network, or set OME_KEEPER_BIN to where ome-keeper is."
      />
    </div>
  );
}
