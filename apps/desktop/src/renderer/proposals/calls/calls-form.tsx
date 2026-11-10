// The calls a proposal makes, in order, and the authwits it grants. Each call is a card that can be moved or removed;
// the daemon's limits cap how many of each.
import { type ReactNode, useCallback, useMemo } from "react";

import { useQueries } from "@tanstack/react-query";

import type { ContractFunction, ContractView, Hex32, Limits, TokenInfo } from "@ome-labs/api";
import { Button, IconButton, Tooltip } from "@ome-labs/ui-web";

import { callOme, omeQueryKey, useOme } from "../../data/ome.ts";
import { AddContract } from "./add-contract.tsx";
import type { KnownAddress } from "./address-book.ts";
import { AddressInput } from "./arg-field.tsx";
import { CallEditor } from "./call-editor.tsx";
import {
  type AuthwitDraft,
  type CallDraft,
  type CallsDraft,
  type FunctionsOf,
  moved,
  newAuthwit,
  newCall,
} from "./composer.ts";

/** The functions of every contract the draft names, loaded as the member picks them. */
export function useFunctions(draft: CallsDraft): FunctionsOf {
  const contracts = useMemo(
    () => [
      ...new Set(
        [...draft.calls, ...draft.authwits.map((a) => a.call)]
          .map((call) => call.contract)
          .filter((c): c is Hex32 => c !== null),
      ),
    ],
    [draft],
  );
  const results = useQueries({
    queries: contracts.map((contract) => ({
      queryKey: omeQueryKey("contracts.functions", { contract }),
      queryFn: () => callOme("contracts.functions", { contract }),
    })),
  });
  return useCallback(
    (contract: Hex32) =>
      results[contracts.indexOf(contract)]?.data as ContractFunction[] | undefined,
    [contracts, results],
  );
}

export type CallsFormProps = {
  draft: CallsDraft;
  onChange: (update: (draft: CallsDraft) => CallsDraft) => void;
  functionsOf: FunctionsOf;
  errors: Record<string, string>;
  book: KnownAddress[];
  tokens: TokenInfo[];
  limits: Pick<Limits, "maxCalls" | "maxAuthwits">;
  disabled: boolean;
};

export function CallsForm({
  draft,
  onChange,
  functionsOf,
  errors,
  book,
  tokens,
  limits,
  disabled,
}: CallsFormProps) {
  const list = useOme("contracts.list", {});
  // The vault itself is reached through Ome's own proposals (thresholds, membership), not as a raw call.
  const contracts = useMemo(
    () => (list.data ?? []).filter((contract) => contract.source !== "vault"),
    [list.data],
  );
  const context = useMemo(() => ({ book, tokens, disabled }), [book, disabled, tokens]);

  const addCall = useCallback(
    () => onChange((d) => ({ ...d, calls: [...d.calls, newCall()] })),
    [onChange],
  );
  const addAuthwit = useCallback(
    () => onChange((d) => ({ ...d, authwits: [...d.authwits, newAuthwit()] })),
    [onChange],
  );

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-col gap-3">
        {draft.calls.map((call, at) => (
          <CallCard
            key={call.key}
            call={call}
            at={at}
            count={draft.calls.length}
            onChange={onChange}
            contracts={contracts}
            functions={call.contract ? functionsOf(call.contract) : undefined}
            errors={errors}
            context={context}
          />
        ))}
      </ol>
      <div className="flex items-center gap-3">
        <Button
          icon="plus"
          onClick={addCall}
          disabled={disabled || draft.calls.length >= limits.maxCalls}
        >
          Add call
        </Button>
        <span className="type-caption text-fg-subtle tabular-nums">
          {draft.calls.length} of {limits.maxCalls} calls, run in this order
        </span>
      </div>

      <section className="flex flex-col gap-3 border-t border-line-subtle pt-5">
        <div className="flex flex-col gap-1">
          <h3 className="type-label-m text-fg">Authwits</h3>
          <p className="type-body-s text-fg-muted">
            Let a contract make one private call as the vault during this transaction, such as an
            AMM taking the tokens a swap spends. Every member sees and signs each one.
          </p>
        </div>
        {draft.authwits.length > 0 ? (
          <ol className="flex flex-col gap-3">
            {draft.authwits.map((authwit, at) => (
              <AuthwitCard
                key={authwit.key}
                authwit={authwit}
                at={at}
                onChange={onChange}
                contracts={contracts}
                functions={authwit.call.contract ? functionsOf(authwit.call.contract) : undefined}
                errors={errors}
                context={context}
              />
            ))}
          </ol>
        ) : null}
        <div>
          <Button
            icon="signature"
            onClick={addAuthwit}
            disabled={disabled || draft.authwits.length >= limits.maxAuthwits}
          >
            Add authwit
          </Button>
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  actions,
  children,
}: {
  title: string;
  actions: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="@container flex flex-col gap-4 rounded-lg border border-line-subtle bg-surface p-4">
      <header className="flex items-center justify-between gap-2">
        <span className="type-overline text-fg-subtle">{title}</span>
        <div className="flex items-center gap-0.5">{actions}</div>
      </header>
      {children}
    </li>
  );
}

function CallCard({
  call,
  at,
  count,
  onChange,
  contracts,
  functions,
  errors,
  context,
}: {
  call: CallDraft;
  at: number;
  count: number;
  onChange: CallsFormProps["onChange"];
  contracts: ContractView[];
  functions: ContractFunction[] | undefined;
  errors: Record<string, string>;
  context: { book: KnownAddress[]; tokens: TokenInfo[]; disabled: boolean };
}) {
  const set = useCallback(
    (next: CallDraft) =>
      onChange((d) => ({ ...d, calls: d.calls.map((c) => (c.key === next.key ? next : c)) })),
    [onChange],
  );
  const up = useCallback(
    () => onChange((d) => ({ ...d, calls: moved(d.calls, at, -1) })),
    [at, onChange],
  );
  const down = useCallback(
    () => onChange((d) => ({ ...d, calls: moved(d.calls, at, 1) })),
    [at, onChange],
  );
  const remove = useCallback(
    () => onChange((d) => ({ ...d, calls: d.calls.filter((c) => c.key !== call.key) })),
    [call.key, onChange],
  );
  const added = useCallback(
    (contract: ContractView) => set({ ...call, contract: contract.address, fn: null, args: [] }),
    [call, set],
  );

  return (
    <Card
      title={`Call ${at + 1}`}
      actions={
        <>
          <Tooltip content="Move up">
            <IconButton
              icon="chevron-up"
              label="Move up"
              size="sm"
              onClick={up}
              disabled={at === 0}
            />
          </Tooltip>
          <Tooltip content="Move down">
            <IconButton
              icon="chevron-down"
              label="Move down"
              size="sm"
              onClick={down}
              disabled={at === count - 1}
            />
          </Tooltip>
          <Tooltip content="Remove call">
            <IconButton
              icon="trash"
              label="Remove call"
              size="sm"
              onClick={remove}
              disabled={count === 1}
            />
          </Tooltip>
        </>
      }
    >
      <CallEditor
        call={call}
        onChange={set}
        contracts={contracts}
        functions={functions}
        errors={errors}
        context={context}
        addContract={
          <AddContract registered={contracts} onAdded={added} disabled={context.disabled} />
        }
      />
    </Card>
  );
}

function AuthwitCard({
  authwit,
  at,
  onChange,
  contracts,
  functions,
  errors,
  context,
}: {
  authwit: AuthwitDraft;
  at: number;
  onChange: CallsFormProps["onChange"];
  contracts: ContractView[];
  functions: ContractFunction[] | undefined;
  errors: Record<string, string>;
  context: { book: KnownAddress[]; tokens: TokenInfo[]; disabled: boolean };
}) {
  const set = useCallback(
    (next: AuthwitDraft) =>
      onChange((d) => ({
        ...d,
        authwits: d.authwits.map((a) => (a.key === next.key ? next : a)),
      })),
    [onChange],
  );
  const setCaller = useCallback((caller: string) => set({ ...authwit, caller }), [authwit, set]);
  const setCall = useCallback((call: CallDraft) => set({ ...authwit, call }), [authwit, set]);
  const remove = useCallback(
    () => onChange((d) => ({ ...d, authwits: d.authwits.filter((a) => a.key !== authwit.key) })),
    [authwit.key, onChange],
  );
  const callerError = errors[`${authwit.key}.caller`];

  return (
    <Card
      title={`Authwit ${at + 1}`}
      actions={
        <Tooltip content="Remove authwit">
          <IconButton icon="trash" label="Remove authwit" size="sm" onClick={remove} />
        </Tooltip>
      }
    >
      <div className="flex flex-col gap-1.5">
        <span className="type-label-m text-fg">Who may use it</span>
        <AddressInput
          value={authwit.caller}
          onChange={setCaller}
          context={context}
          invalid={Boolean(callerError)}
          only={CALLERS}
        />
        {callerError ? <span className="type-caption text-danger">{callerError}</span> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="type-label-m text-fg">The call it allows, once</span>
        <CallEditor
          call={authwit.call}
          onChange={setCall}
          contracts={contracts}
          functions={functions}
          errors={errors}
          context={context}
          privateOnly
        />
      </div>
    </Card>
  );
}

const CALLERS = ["contract", "alias"] as const;
