// One argument's input, chosen by its ABI type: an address with the member's address book, a number with token units,
// a switch for a bool, and nested fields for arrays, tuples and structs. Errors arrive by path from `readCalls`.
import { useCallback, useMemo, useState } from "react";

import type { AbiType, TokenInfo } from "@ome-labs/api";
import { abiTypeName, formatAmount, shortHex } from "@ome-labs/format";
import {
  Button,
  IconButton,
  Menu,
  type MenuItem,
  Select,
  Switch,
  TextInput,
  cn,
} from "@ome-labs/ui-web";

import { type ArgDraft, placeholderOf, toBaseUnits } from "./abi.ts";
import { type KnownAddress, nameIn } from "./address-book.ts";

export type ArgContext = {
  book: KnownAddress[];
  /** The vault's tokens, whose decimals turn whole units into base units. */
  tokens: TokenInfo[];
  /** Errors by path within the call (`amount`, `route[1]`). */
  errors: Record<string, string>;
  disabled: boolean;
};

type Props = {
  name: string;
  type: AbiType;
  path: string;
  draft: ArgDraft;
  onChange: (draft: ArgDraft) => void;
  context: ArgContext;
  /** A token this number is probably an amount of, for its default unit. */
  amountOf?: TokenInfo | undefined;
};

export function ArgField(props: Props) {
  const { name, type, path, context } = props;
  const error = context.errors[path];
  const nested =
    type.kind === "array" || type.kind === "tuple" || (type.kind === "struct" && !type.known);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="type-mono-s text-fg">{name}</span>
        <span className="type-mono-s text-fg-subtle">{abiTypeName(type)}</span>
      </div>
      {nested ? <Nested {...props} /> : <Leaf {...props} invalid={Boolean(error)} />}
      {error ? <span className="type-caption text-danger">{error}</span> : null}
    </div>
  );
}

function Nested({ type, path, draft, onChange, context }: Props) {
  const entries = useMemo(() => {
    if (type.kind === "array")
      return Array.from({ length: type.length }, (_, at) => ({
        name: `[${at}]`,
        type: type.item,
        path: `${path}[${at}]`,
        at,
      }));
    if (type.kind === "tuple")
      return type.items.map((item, at) => ({
        name: `.${at}`,
        type: item,
        path: `${path}.${at}`,
        at,
      }));
    if (type.kind === "struct")
      return type.fields.map((field, at) => ({
        name: field.name,
        type: field.type,
        path: `${path}.${field.name}`,
        at,
      }));
    return [];
  }, [path, type]);
  const keyed = type.kind === "struct";

  return (
    <div className="flex flex-col gap-3 border-l border-line pl-3">
      {entries.map((entry) => (
        <NestedEntry
          key={entry.path}
          entry={entry}
          keyed={keyed}
          draft={draft}
          onChange={onChange}
          context={context}
        />
      ))}
    </div>
  );
}

function NestedEntry({
  entry,
  keyed,
  draft,
  onChange,
  context,
}: {
  entry: { name: string; type: AbiType; path: string; at: number };
  keyed: boolean;
  draft: ArgDraft;
  onChange: (draft: ArgDraft) => void;
  context: ArgContext;
}) {
  const value = keyed
    ? (draft as Record<string, ArgDraft>)[entry.name]
    : (draft as ArgDraft[])[entry.at];
  const change = useCallback(
    (next: ArgDraft) => {
      if (keyed) onChange({ ...(draft as Record<string, ArgDraft>), [entry.name]: next });
      else onChange((draft as ArgDraft[]).map((item, at) => (at === entry.at ? next : item)));
    },
    [draft, entry.at, entry.name, keyed, onChange],
  );
  return (
    <ArgField
      name={entry.name}
      type={entry.type}
      path={entry.path}
      draft={value ?? ""}
      onChange={change}
      context={context}
    />
  );
}

function Leaf({
  name,
  type,
  draft,
  onChange,
  context,
  amountOf,
  invalid,
}: Props & { invalid: boolean }) {
  if (type.kind === "boolean") {
    return (
      <Switch
        label={draft === true ? "true" : "false"}
        checked={draft === true}
        onCheckedChange={onChange}
        disabled={context.disabled}
      />
    );
  }
  if (type.kind === "struct" && type.known === "aztecAddress") {
    return (
      <AddressInput
        value={typeof draft === "string" ? draft : ""}
        onChange={onChange}
        context={context}
        invalid={invalid}
      />
    );
  }
  if (type.kind === "integer" && !type.signed && type.width >= 64) {
    return (
      <AmountInput
        value={typeof draft === "string" ? draft : ""}
        onChange={onChange}
        context={context}
        invalid={invalid}
        amountOf={amountOf}
      />
    );
  }
  if (type.kind === "field" && /nonce/u.test(name)) {
    return (
      <NonceInput
        value={typeof draft === "string" ? draft : ""}
        onChange={onChange}
        invalid={invalid}
        disabled={context.disabled}
      />
    );
  }
  return (
    <TextInput
      mono={type.kind !== "string"}
      value={typeof draft === "string" ? draft : ""}
      onValueChange={onChange}
      placeholder={placeholderOf(type)}
      aria-invalid={invalid || undefined}
      disabled={context.disabled}
    />
  );
}

/** A random 31-byte value: below the field modulus, and unlikely to meet a nonce already used. */
function randomNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(31));
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * A nonce, which only has to be fresh, and the same in a call and the authwit it uses: one click makes one, and the
 * member copies it to the other field.
 */
function NonceInput({
  value,
  onChange,
  invalid,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  disabled: boolean;
}) {
  const fresh = useCallback(() => onChange(randomNonce()), [onChange]);
  return (
    <div className="flex items-center gap-1.5">
      <TextInput
        mono
        value={value}
        onValueChange={onChange}
        placeholder="0 or 0x…"
        aria-invalid={invalid || undefined}
        disabled={disabled}
        className="flex-1"
      />
      <Button size="sm" variant="ghost" icon="refresh" onClick={fresh} disabled={disabled}>
        Random
      </Button>
    </div>
  );
}

const KIND_ICON = { vault: "vault", member: "user", contract: "contract", alias: "link" } as const;
const KIND_WORD = {
  vault: "this vault",
  member: "member",
  contract: "contract",
  alias: "aztec-wallet alias",
};

/** An Aztec address: typed or pasted, or picked from the address book; the name it has shows under it. */
export function AddressInput({
  value,
  onChange,
  context,
  invalid,
  only,
}: {
  value: string;
  onChange: (value: string) => void;
  context: Pick<ArgContext, "book" | "disabled">;
  invalid: boolean;
  /** Offer only these kinds (an authwit's caller is a contract). */
  only?: readonly KnownAddress["kind"][] | undefined;
}) {
  const known = nameIn(context.book, value);
  const items = useMemo<MenuItem[]>(
    () =>
      context.book
        .filter((entry) => !only || only.includes(entry.kind))
        .map((entry) => ({
          label: `${entry.name} · ${shortHex(entry.address)}`,
          icon: KIND_ICON[entry.kind],
          checked: entry.address === value.trim().toLowerCase(),
          onSelect: () => onChange(entry.address),
        })),
    [context.book, onChange, only, value],
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <TextInput
          mono
          value={value}
          onValueChange={onChange}
          placeholder="0x… or pick"
          aria-invalid={invalid || undefined}
          disabled={context.disabled}
          className="flex-1"
        />
        {items.length > 0 ? (
          <Menu
            trigger={
              <IconButton
                icon="search"
                label="Pick a known address"
                variant="secondary"
                disabled={context.disabled}
              />
            }
            items={items}
          />
        ) : null}
      </div>
      {known ? (
        <span className="type-caption text-fg-muted">
          {known.name}, {KIND_WORD[known.kind]}
          {known.kind === "alias" ? " (unverified)" : ""}
        </span>
      ) : null}
    </div>
  );
}

const BASE = "base";

/**
 * A large unsigned number, usually an amount. It starts in base units, what members sign and what the CLI takes, so
 * two fields with the same number always mean the same amount (a swap's `amount_in` and the authwit that pays it).
 * It can be switched to a token's whole units ("250 OMET"), which become base units exactly. Under it is the other
 * reading: the token amount for base units, the base units for a token amount.
 */
function AmountInput({
  value,
  onChange,
  context,
  invalid,
  amountOf,
}: {
  value: string;
  onChange: (value: string) => void;
  context: ArgContext;
  invalid: boolean;
  amountOf: TokenInfo | undefined;
}) {
  const [unit, setUnit] = useState<string>(BASE);
  const token = context.tokens.find((t) => t.address === unit);
  // Shown text in the chosen unit; the draft holds base units.
  const [text, setText] = useState(() =>
    token && /^\d+$/u.test(value) && value
      ? formatAmount(value, token.decimals).replaceAll(",", "")
      : value,
  );
  const [unitError, setUnitError] = useState<string>();

  const type = useCallback(
    (next: string) => {
      setText(next);
      if (!token) {
        setUnitError(undefined);
        onChange(next);
        return;
      }
      const base = next.trim() ? toBaseUnits(next, token.decimals) : "";
      setUnitError(
        base === undefined
          ? `A ${token.symbol} amount, at most ${token.decimals} decimals`
          : undefined,
      );
      onChange(base ?? next);
    },
    [onChange, token],
  );
  const pickUnit = useCallback(
    (next: string) => {
      setUnit(next);
      const picked = context.tokens.find((t) => t.address === next);
      // Keep the amount: re-express the base units in the new unit.
      setText(
        picked && /^\d+$/u.test(value) && value
          ? formatAmount(value, picked.decimals).replaceAll(",", "")
          : value,
      );
      setUnitError(undefined);
    },
    [context.tokens, value],
  );
  const units = useMemo(
    () => [
      { value: BASE, label: "base units" },
      ...context.tokens.map((t) => ({ value: t.address, label: t.symbol })),
    ],
    [context.tokens],
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <TextInput
          mono
          inputMode="decimal"
          value={text}
          onValueChange={type}
          placeholder="0"
          aria-invalid={invalid || Boolean(unitError) || undefined}
          disabled={context.disabled}
          className="flex-1"
        />
        {context.tokens.length > 0 ? (
          <Select
            aria-label="Unit"
            options={units}
            value={unit}
            onValueChange={pickUnit}
            disabled={context.disabled}
            className="w-32"
          />
        ) : null}
      </div>
      {unitError ? (
        <span className="type-caption text-danger">{unitError}</span>
      ) : token && /^\d+$/u.test(value) ? (
        <span className={cn("type-mono-s text-fg-subtle")}>{value} base units</span>
      ) : amountOf && /^\d+$/u.test(value) ? (
        <span className="type-mono-s text-fg-subtle">
          = {formatAmount(value, amountOf.decimals)} {amountOf.symbol}
        </span>
      ) : null}
    </div>
  );
}
