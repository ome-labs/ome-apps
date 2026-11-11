// One call being built: which contract, which of its functions, then that function's arguments as typed fields.
import { type ReactNode, useCallback, useMemo } from "react";

import type { ContractFunction, ContractView, Hex32, TokenInfo } from "@ome-labs/api";
import { shortHex } from "@ome-labs/format";
import { Field, Select, Tag } from "@ome-labs/ui-web";

import { emptyArg } from "./abi.ts";
import { type ArgContext, ArgField } from "./arg-field.tsx";
import { type CallDraft, withFunction } from "./composer.ts";

/**
 * The token an amount is in, read from the call itself: `amount_in` is in the token `token_in` names, as AMMs and
 * routers name them.
 */
function amountTokenOf(
  name: string,
  params: ContractFunction["params"],
  args: CallDraft["args"],
  tokens: TokenInfo[],
): TokenInfo | undefined {
  if (!/amount/u.test(name)) return undefined;
  const at = params.findIndex((param) => param.name === name.replace("amount", "token"));
  const named = at === -1 ? undefined : args[at];
  return typeof named === "string"
    ? tokens.find((token) => token.address === named.trim().toLowerCase())
    : undefined;
}

const KIND_TONE = { private: "accent", public: "info", utility: "neutral" } as const;

export type CallEditorProps = {
  call: CallDraft;
  onChange: (call: CallDraft) => void;
  contracts: ContractView[];
  /** The functions of the chosen contract, once loaded. */
  functions: ContractFunction[] | undefined;
  /** Errors by `<call key>.<path>`. */
  errors: Record<string, string>;
  context: Omit<ArgContext, "errors">;
  /** An authwit allows one private call, so only private functions are offered. */
  privateOnly?: boolean | undefined;
  /** Next to the contract picker: adding a contract. */
  addContract?: ReactNode | undefined;
};

export function CallEditor({
  call,
  onChange,
  contracts,
  functions,
  errors,
  context,
  privateOnly,
  addContract,
}: CallEditorProps) {
  const tokens = context.tokens;
  const contractOptions = useMemo(
    () =>
      contracts.map((contract) => {
        const token = tokens.find((t) => t.address === contract.address);
        return {
          value: contract.address,
          label: token ? `${token.symbol} · ${contract.name}` : contract.name,
          meta: shortHex(contract.address),
        };
      }),
    [contracts, tokens],
  );
  const offered = useMemo(
    () => (functions ?? []).filter((fn) => !privateOnly || fn.kind === "private"),
    [functions, privateOnly],
  );
  const functionOptions = useMemo(
    () =>
      offered.map((fn) => ({
        value: fn.name,
        label: fn.name,
        meta: `${fn.kind}${fn.params.length ? ` · ${fn.params.length} args` : ""}`,
      })),
    [offered],
  );
  const fn = offered.find((candidate) => candidate.name === call.fn);
  // A token's own amounts are in that token: the unit starts there.
  const amountOf = tokens.find((t) => t.address === call.contract);

  const pickContract = useCallback(
    (contract: Hex32) => onChange({ ...call, contract, fn: null, args: [] }),
    [call, onChange],
  );
  const pickFunction = useCallback(
    (name: string) =>
      onChange(
        withFunction(
          call,
          offered.find((candidate) => candidate.name === name),
        ),
      ),
    [call, offered, onChange],
  );
  const argContext = useMemo(() => {
    const prefix = `${call.key}.`;
    const own = Object.fromEntries(
      Object.entries(errors)
        .filter(([path]) => path.startsWith(prefix))
        .map(([path, message]) => [path.slice(prefix.length), message]),
    );
    return { ...context, errors: own };
  }, [call.key, context, errors]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-2">
        <Field label="Contract" disabled={context.disabled}>
          <div className="flex items-center gap-1.5">
            <Select
              aria-label="Contract"
              options={contractOptions}
              value={call.contract}
              onValueChange={pickContract}
              placeholder={contracts.length ? "Choose a contract" : "No contracts yet"}
              disabled={context.disabled || contracts.length === 0}
              className="min-w-0 flex-1"
            />
            {addContract}
          </div>
        </Field>
        <Field
          label="Function"
          disabled={context.disabled || !call.contract}
          error={errors[`${call.key}.fn`]}
        >
          <Select
            aria-label="Function"
            options={functionOptions}
            value={call.fn}
            onValueChange={pickFunction}
            placeholder={
              !call.contract
                ? "Choose a contract first"
                : functions === undefined
                  ? "Loading…"
                  : offered.length === 0
                    ? privateOnly
                      ? "No private functions"
                      : "No callable functions"
                    : "Choose a function"
            }
            disabled={context.disabled || !call.contract || offered.length === 0}
          />
        </Field>
      </div>

      {fn ? (
        <div className="flex flex-col gap-3 rounded-md bg-sunken p-3 shadow-field">
          <div className="flex items-center gap-2">
            <code className="type-mono-m text-fg">{fn.name}</code>
            <Tag tone={KIND_TONE[fn.kind]}>{fn.kind}</Tag>
            {fn.isStatic ? <Tag>static</Tag> : null}
          </div>
          {fn.params.length === 0 ? (
            <p className="type-body-s text-fg-subtle">Takes no arguments.</p>
          ) : (
            fn.params.map((param, at) => (
              <ParamField
                key={param.name}
                at={at}
                name={param.name}
                type={param.type}
                call={call}
                onChange={onChange}
                context={argContext}
                amountOf={
                  amountTokenOf(param.name, fn.params, call.args, tokens) ??
                  (/amount/u.test(param.name) ? amountOf : undefined)
                }
              />
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function ParamField({
  at,
  name,
  type,
  call,
  onChange,
  context,
  amountOf,
}: {
  at: number;
  name: string;
  type: ContractFunction["params"][number]["type"];
  call: CallDraft;
  onChange: (call: CallDraft) => void;
  context: ArgContext;
  amountOf: TokenInfo | undefined;
}) {
  const change = useCallback(
    (draft: CallDraft["args"][number]) =>
      onChange({ ...call, args: call.args.map((arg, i) => (i === at ? draft : arg)) }),
    [at, call, onChange],
  );
  return (
    <ArgField
      name={name}
      type={type}
      path={name}
      draft={call.args[at] ?? emptyArg(type)}
      onChange={change}
      context={context}
      amountOf={amountOf}
    />
  );
}
