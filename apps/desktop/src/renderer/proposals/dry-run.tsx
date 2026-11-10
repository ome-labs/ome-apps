// The dry run beside a proposal being written: the daemon simulates it on this device, and the panel shows what would
// happen (balances, fee, the calls as members will see them) or why it would fail, before anyone signs.
import { useMemo } from "react";

import type { ProposalPreview } from "@ome-labs/api";
import { type NameOf, formatCount, formatFee, simulationErrorText } from "@ome-labs/format";
import { AuthwitList, Banner, CallList, EffectsList, cn } from "@ome-labs/ui-web";

export type DryRunProps = {
  /** One line of what it does, once the form reads. */
  summary: string | undefined;
  /** What to fill in first, while it doesn't. */
  waiting: string;
  preview: ProposalPreview | undefined;
  checking: boolean;
  /** The daemon refused the draft itself (an argument it can't encode, an unknown contract). */
  failure: string | undefined;
  threshold: number | undefined;
  /** The description's size against the daemon's cap, for contract calls. */
  size?: { bytes: number; max: number } | undefined;
  /** Names for the contracts a failure mentions. */
  nameOf?: NameOf | undefined;
};

export function DryRun({
  summary,
  waiting,
  preview,
  checking,
  failure,
  threshold,
  size,
  nameOf,
}: DryRunProps) {
  const error = preview?.error ? simulationErrorText(preview.error, nameOf) : undefined;
  // The calls members will see, without the fee payer's call every proposal starts with.
  const calls = useMemo(() => preview?.calls.slice(1) ?? [], [preview]);

  return (
    <aside className="flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-1 @3xl:sticky @3xl:top-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="type-heading-s text-fg">Dry run</h2>
          {checking ? (
            <span className="type-caption text-fg-subtle motion-safe:animate-pulse">
              Simulating…
            </span>
          ) : preview ? (
            <span className={cn("type-caption", preview.ok ? "text-success" : "text-danger")}>
              {preview.ok ? "Would succeed" : "Would fail"}
            </span>
          ) : null}
        </div>
        <p className="type-body-s text-fg-muted">{summary ?? waiting}</p>
      </div>

      {failure ? <Banner kind="alarm">{failure}</Banner> : null}

      {preview ? (
        // A new run replaces the last one in place; while it runs the last result stays, dimmed.
        <div
          className={cn(
            "flex flex-col gap-4 transition-opacity duration-fast ease-standard",
            checking && "opacity-50",
          )}
        >
          {error ? (
            <Banner kind="alarm">
              <span className="flex flex-col gap-1">
                <span>{error.title}</span>
                {error.detail ? (
                  <span className="type-mono-s opacity-80 [overflow-wrap:anywhere]">
                    {error.detail}
                  </span>
                ) : null}
              </span>
            </Banner>
          ) : null}
          {preview.effects ? (
            <Section title="Balances">
              <EffectsList effects={preview.effects} />
            </Section>
          ) : null}
          {preview.fee ? (
            <Section title="Fee">
              <p className="type-body-s text-fg-muted">
                About <span className="type-mono-s text-fg">{formatFee(preview.fee)}</span>, at most{" "}
                <span className="type-mono-s text-fg">
                  {formatFee({ fee: preview.fee.maxFee })}
                </span>
                , paid by the fee payer, never from the vault.
              </p>
              <p className="type-caption text-fg-subtle">
                {formatCount(preview.fee.gas.da)} DA gas, {formatCount(preview.fee.gas.l2)} L2 gas
              </p>
            </Section>
          ) : null}
          {calls.length > 0 ? (
            <Section title={calls.length === 1 ? "The call" : `The calls · ${calls.length}`}>
              <CallList calls={calls} />
            </Section>
          ) : null}
          {preview.authwits.length > 0 ? (
            <Section title={`Authwits · ${preview.authwits.length}`}>
              <AuthwitList authwits={preview.authwits} />
            </Section>
          ) : null}
        </div>
      ) : null}

      {size ? <SizeMeter bytes={size.bytes} max={size.max} /> : null}

      <p className="border-t border-line-subtle pt-4 type-caption text-fg-subtle">
        Proposing signs your approval, so it starts at 1 of {threshold ?? "the"} approvals
        {threshold ? "" : " needed"}.
      </p>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="type-overline text-fg-subtle">{title}</h3>
      {children}
    </section>
  );
}

/** How much of the proposal's description the calls take: every argument travels in it, to every member. */
function SizeMeter({ bytes, max }: { bytes: number; max: number }) {
  const share = Math.min(1, bytes / max);
  const over = bytes > max;
  const fill = useMemo(() => ({ transform: `scaleX(${share})` }), [share]);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between type-caption">
        <span className="text-fg-subtle">Description size</span>
        <span className={cn("tabular-nums", over ? "text-danger" : "text-fg-muted")}>
          {formatCount(bytes)} of {formatCount(max)} bytes
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-sunken">
        <div
          className={cn(
            "h-full origin-left rounded-full transition-transform duration-base ease-standard",
            over ? "bg-danger" : share > 0.8 ? "bg-warning" : "bg-accent",
          )}
          style={fill}
        />
      </div>
      {over ? (
        <span className="type-caption text-danger">
          Too large to propose: use fewer or shorter arguments.
        </span>
      ) : null}
    </div>
  );
}
