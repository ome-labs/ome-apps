import type { DecodedAuthwit, DecodedCall, Effects } from "@ome-labs/api";
import { abiTypeName, formatAmount, formatArg } from "@ome-labs/format";

import { cn } from "../styling/class-names.ts";
import { Hash } from "../values/hash.tsx";

const kinds = {
  private: "text-accent",
  public: "text-info",
  utility: "text-fg-subtle",
} as const;

export type CallCardProps = {
  call: DecodedCall;
  /** 1-based position in the payload: calls run in this order. */
  position?: number | undefined;
  className?: string | undefined;
};

/**
 * One call as the daemon decoded it: the contract, the function with its kind, then each argument by name with the
 * daemon's label when it has one. An undecoded call shows its selector, since that is all the payload says.
 */
export function CallCard({ call, position, className }: CallCardProps) {
  return (
    <div
      className={cn("flex flex-col gap-2 rounded-md bg-sunken px-3 py-2.5 shadow-field", className)}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {position === undefined ? null : (
          <span className="type-mono-s text-fg-subtle tabular-nums">{position}</span>
        )}
        <span className="type-label-m text-fg">{call.toLabel ?? "Contract"}</span>
        <Hash value={call.to} noun="contract" tone="quiet" />
        <span className={cn("ml-auto type-caption", kinds[call.kind])}>
          {call.isStatic ? `${call.kind}, static` : call.kind}
        </span>
      </div>
      <code className="type-mono-m text-fg">
        {call.decoded ? call.fn : call.selector}
        <span className="text-fg-subtle">({call.args.length === 0 ? "" : "…"})</span>
      </code>
      {call.args.length > 0 ? (
        <dl className="grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)] gap-x-3 gap-y-1">
          {call.args.map((arg, index) => (
            // Arguments are positional; two may share a name in an undecoded call.
            // oxlint-disable-next-line no-array-index-key
            <div key={index} className="contents">
              <dt className="truncate type-mono-s text-fg-subtle" title={abiTypeName(arg.type)}>
                {arg.name}
              </dt>
              <dd className="type-mono-s text-fg-muted [overflow-wrap:anywhere]">
                {formatArg(arg)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {call.decoded ? null : (
        <p className="type-caption text-warning">
          This member has no artifact for this contract, so the arguments are shown raw.
        </p>
      )}
    </div>
  );
}

export type CallListProps = {
  calls: DecodedCall[];
  className?: string | undefined;
};

/** The calls in the order the payload runs them. */
export function CallList({ calls, className }: CallListProps) {
  return (
    <ol className={cn("flex flex-col gap-2", className)}>
      {calls.map((call, index) => (
        // oxlint-disable-next-line no-array-index-key
        <li key={index}>
          <CallCard call={call} position={index + 1} />
        </li>
      ))}
    </ol>
  );
}

export type AuthwitListProps = {
  authwits: DecodedAuthwit[];
  className?: string | undefined;
};

/** Each authwit: who may make the call, then the call it allows, once. */
export function AuthwitList({ authwits, className }: AuthwitListProps) {
  return (
    <ol className={cn("flex flex-col gap-2", className)}>
      {authwits.map((authwit, index) => (
        // oxlint-disable-next-line no-array-index-key
        <li key={index} className="flex flex-col gap-1.5">
          <p className="flex flex-wrap items-center gap-x-1.5 type-body-s text-fg-muted">
            Lets
            <span className="type-label-s text-fg">{authwit.callerLabel ?? "a contract"}</span>
            <Hash value={authwit.caller} noun="caller" tone="quiet" />
            make this call once:
          </p>
          <CallCard call={authwit.call} />
        </li>
      ))}
    </ol>
  );
}

export type EffectsListProps = {
  effects: Effects;
  className?: string | undefined;
};

/** What the simulation says changes: the vault's balances, and the notes it creates and spends. */
export function EffectsList({ effects, className }: EffectsListProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {effects.balances.length === 0 ? (
        <p className="type-body-s text-fg-subtle">No balance the vault tracks changes.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line-subtle rounded-md bg-sunken shadow-field">
          {effects.balances.map((change) => {
            const delta = BigInt(change.after) - BigInt(change.before);
            const sign = delta < 0n ? "−" : "+";
            const magnitude = (delta < 0n ? -delta : delta).toString();

            return (
              <li
                key={`${change.token.address}-${change.visibility}`}
                className="flex items-baseline gap-3 px-3 py-2"
              >
                <span className="type-label-m text-fg">{change.token.symbol}</span>
                <span className="type-caption text-fg-subtle">{change.visibility}</span>
                <span
                  className={cn(
                    "ml-auto type-mono-m tabular-nums",
                    delta < 0n ? "text-danger" : delta > 0n ? "text-success" : "text-fg-muted",
                  )}
                >
                  {delta === 0n
                    ? "no change"
                    : `${sign}${formatAmount(magnitude, change.token.decimals)}`}
                </span>
                <span className="w-40 truncate text-right type-mono-s text-fg-subtle tabular-nums">
                  → {formatAmount(change.after, change.token.decimals)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="type-caption text-fg-subtle">
        {effects.notes.created} {effects.notes.created === 1 ? "note" : "notes"} created,{" "}
        {effects.notes.nullified} spent
        {effects.complete ? "" : " · some effects couldn't be read"}
      </p>
    </div>
  );
}
