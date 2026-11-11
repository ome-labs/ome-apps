// Adding a token to track: its address, typed or picked from the contracts this member knows and aztec-wallet's
// aliases. The daemon reads its name, symbol and decimals from the chain; a token whose instance was never published
// needs how it was deployed, which the daemon checks derives the same address.
import { useCallback, useMemo, useState } from "react";

import type { Hex32, TokenDeployment } from "@ome-labs/api";
import { Icon } from "@ome-labs/icons/web";
import { Banner, Button, Dialog, Field, TextField, toast } from "@ome-labs/ui-web";

import { callOme } from "../data/ome.ts";
import { useAddressBook } from "../proposals/calls/address-book.ts";
import { AddressInput } from "../proposals/calls/arg-field.tsx";

const ADDRESS = /^0x[0-9a-fA-F]{64}$/u;
const CONTRACTS = ["contract", "alias"] as const;

type DeploymentDraft = Record<keyof TokenDeployment, string>;
const EMPTY: DeploymentDraft = {
  salt: "",
  deployer: "",
  admin: "",
  name: "",
  symbol: "",
  decimals: "18",
};

/** The deployment, when the member filled any of it, or why it doesn't read yet. */
export function readDeployment(draft: DeploymentDraft): {
  deployment: TokenDeployment | undefined;
  error: string | undefined;
} {
  const given = (["salt", "deployer", "admin", "name", "symbol"] as const).some((key) =>
    draft[key].trim(),
  );
  if (!given) return { deployment: undefined, error: undefined };
  for (const key of ["salt", "deployer", "admin"] as const) {
    if (!ADDRESS.test(draft[key].trim()))
      return { deployment: undefined, error: `The ${key} is 0x and 64 hex characters.` };
  }
  if (!draft.name.trim() || !draft.symbol.trim())
    return { deployment: undefined, error: "Give the name and symbol it was deployed with." };
  const decimals = Number(draft.decimals);
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36)
    return { deployment: undefined, error: "Decimals are a whole number from 0 to 36." };
  return {
    deployment: {
      salt: draft.salt.trim().toLowerCase() as Hex32,
      deployer: draft.deployer.trim().toLowerCase() as Hex32,
      admin: draft.admin.trim().toLowerCase() as Hex32,
      name: draft.name.trim(),
      symbol: draft.symbol.trim(),
      decimals,
    },
    error: undefined,
  };
}

const FIELDS: { key: keyof TokenDeployment; label: string; mono: boolean }[] = [
  { key: "salt", label: "Salt", mono: true },
  { key: "deployer", label: "Deployer", mono: true },
  { key: "admin", label: "Admin", mono: true },
  { key: "name", label: "Name", mono: false },
  { key: "symbol", label: "Symbol", mono: false },
  { key: "decimals", label: "Decimals", mono: true },
];

export function AddToken({
  vault,
  open,
  onOpenChange,
}: {
  vault: Hex32;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const book = useAddressBook(vault);
  const [address, setAddress] = useState("");
  const [draft, setDraft] = useState<DeploymentDraft>(EMPTY);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const context = useMemo(() => ({ book, disabled: pending }), [book, pending]);
  const trimmed = address.trim();
  const addressError = trimmed && !ADDRESS.test(trimmed) ? "0x and 64 hex characters" : undefined;
  const deployment = readDeployment(draft);

  const change = useCallback(
    (next: boolean) => {
      onOpenChange(next);
      if (!next) {
        setAddress("");
        setDraft(EMPTY);
        setError(undefined);
      }
    },
    [onOpenChange],
  );
  const add = useCallback(async () => {
    setPending(true);
    setError(undefined);
    try {
      const token = await callOme("tokens.add", {
        vault,
        token: trimmed.toLowerCase() as Hex32,
        ...(deployment.deployment ? { deployment: deployment.deployment } : {}),
      });
      toast(`Now tracking ${token.symbol} (${token.name})`);
      change(false);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [change, deployment.deployment, trimmed, vault]);
  const cancel = useCallback(() => change(false), [change]);

  return (
    <Dialog
      title="Add a token"
      description="Ome reads its name, symbol and decimals from the network, then shows the vault's balance of it."
      open={open}
      onOpenChange={change}
      actions={
        <>
          <Button variant="ghost" onClick={cancel} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={add}
            pending={pending}
            disabled={!ADDRESS.test(trimmed) || Boolean(deployment.error)}
          >
            Add token
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Token address" error={addressError} disabled={pending}>
          <AddressInput
            value={address}
            onChange={setAddress}
            context={context}
            invalid={Boolean(addressError)}
            only={CONTRACTS}
          />
        </Field>
        <details className="group rounded-md bg-surface shadow-1">
          <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2.5 type-label-m text-fg transition-colors duration-fast ease-standard hover:bg-hover [&::-webkit-details-marker]:hidden">
            Never published on the network?
            <Icon
              name="chevron-down"
              size={16}
              className="text-fg-subtle transition-transform duration-fast ease-standard group-open:rotate-180"
            />
          </summary>
          <div className="flex flex-col gap-3 border-t border-line-subtle px-3 py-3">
            <p className="type-body-s text-fg-muted">
              A token deployed without publishing its instance needs how it was deployed, as its
              deployer has it. Ome checks it gives this address.
            </p>
            <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2">
              {FIELDS.map((field) => (
                <DeploymentField
                  key={field.key}
                  field={field.key}
                  label={field.label}
                  mono={field.mono}
                  value={draft[field.key]}
                  onChange={setDraft}
                  disabled={pending}
                />
              ))}
            </div>
            {deployment.error ? (
              <p className="type-caption text-danger">{deployment.error}</p>
            ) : null}
          </div>
        </details>
        {error ? <Banner kind="alarm">{error}</Banner> : null}
      </div>
    </Dialog>
  );
}

function DeploymentField({
  field,
  label,
  mono,
  value,
  onChange,
  disabled,
}: {
  field: keyof TokenDeployment;
  label: string;
  mono: boolean;
  value: string;
  onChange: (update: (current: DeploymentDraft) => DeploymentDraft) => void;
  disabled: boolean;
}) {
  const change = useCallback(
    (next: string) => onChange((current) => ({ ...current, [field]: next })),
    [field, onChange],
  );
  return (
    <TextField
      label={label}
      mono={mono}
      placeholder={mono && field !== "decimals" ? "0x…" : undefined}
      value={value}
      onValueChange={change}
      disabled={disabled}
    />
  );
}
