// Adding a contract a proposal can call. `aztec-wallet` already knows the contracts the member deployed or registered
// there, with the path of each artifact, so most are one click; any other takes its address and artifact file. The
// daemon checks the artifact is the code at the address, and shares it with the other members' daemons.
import { useCallback, useMemo, useState } from "react";

import type { ContractInstanceInput, ContractView, Hex32 } from "@ome-labs/api";
import { Icon } from "@ome-labs/icons/web";
import {
  Banner,
  Button,
  Dialog,
  Hash,
  IconButton,
  Tag,
  TextField,
  Tooltip,
} from "@ome-labs/ui-web";

import { useOme } from "../../data/ome.ts";
import { unwrap } from "../../data/session.ts";

const ADDRESS = /^0x[0-9a-fA-F]{64}$/u;

type Importable = { name: string; address: Hex32; artifactPath: string | null };

/** `aztec-wallet`'s contracts, each with the artifact it recorded (`artifacts:<name>` or `artifacts:<address>`). */
function importable(aliases: { key: string; value: string }[]): Importable[] {
  const artifacts = new Map(
    aliases
      .filter((alias) => alias.key.startsWith("artifacts:"))
      .map((alias) => [alias.key.slice("artifacts:".length).toLowerCase(), alias.value]),
  );
  return aliases
    .filter((alias) => alias.key.startsWith("contracts:") && ADDRESS.test(alias.value))
    .map((alias) => {
      const name = alias.key.slice("contracts:".length);
      const address = alias.value.toLowerCase() as Hex32;
      return {
        name,
        address,
        artifactPath: artifacts.get(name.toLowerCase()) ?? artifacts.get(address) ?? null,
      };
    });
}

const fileName = (path: string) => path.split(/[\\/]/u).at(-1) ?? path;

/** The `+` beside the contract picker, and the dialog it opens. `onAdded` picks the new contract. */
export function AddContract({
  registered,
  onAdded,
  disabled,
}: {
  registered: ContractView[];
  onAdded: (contract: ContractView) => void;
  disabled?: boolean | undefined;
}) {
  const [open, setOpen] = useState(false);
  const aliases = useOme("aztec.aliases", {}, { enabled: open });
  const known = useMemo(() => importable(aliases.data ?? []), [aliases.data]);
  const isRegistered = useCallback(
    (address: Hex32) => registered.some((contract) => contract.address === address),
    [registered],
  );
  const added = useCallback(
    (contract: ContractView) => {
      onAdded(contract);
      setOpen(false);
    },
    [onAdded],
  );

  const show = useCallback(() => setOpen(true), []);

  return (
    <>
      <Tooltip content="Add a contract">
        <IconButton
          icon="plus"
          label="Add a contract"
          variant="secondary"
          disabled={disabled}
          onClick={show}
        />
      </Tooltip>
      <Dialog
        title="Add a contract"
        description="Ome checks the artifact is the code at the address, then the other members' daemons can rebuild calls to it."
        open={open}
        onOpenChange={setOpen}
        wide
      >
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-2">
            <h3 className="type-overline text-fg-subtle">From aztec-wallet</h3>
            {aliases.isPending ? (
              <p className="type-body-s text-fg-subtle">Reading aztec-wallet's aliases…</p>
            ) : known.length === 0 ? (
              <p className="type-body-s text-fg-muted">
                aztec-wallet has no contract aliases on this computer. Deploy or register one with
                an alias (<code className="type-mono-s">--alias amm</code>), or add it by its
                artifact below.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-line-subtle rounded-md bg-sunken shadow-field">
                {known.map((entry) => (
                  <ImportRow
                    key={entry.address}
                    entry={entry}
                    registered={isRegistered(entry.address)}
                    onAdded={added}
                  />
                ))}
              </ul>
            )}
          </section>
          <ByArtifact onAdded={added} />
        </div>
      </Dialog>
    </>
  );
}

function ImportRow({
  entry,
  registered,
  onAdded,
}: {
  entry: Importable;
  registered: boolean;
  onAdded: (contract: ContractView) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const register = useCallback(async () => {
    if (!entry.artifactPath) return;
    setPending(true);
    setError(undefined);
    try {
      onAdded(
        await unwrap(
          window.ome.contracts.register({
            address: entry.address,
            artifactPath: entry.artifactPath,
          }),
        ),
      );
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [entry.address, entry.artifactPath, onAdded]);

  return (
    <li className="flex flex-col gap-2 px-3 py-2.5">
      <div className="flex items-center gap-3">
        <Icon name="contract" size={20} className="text-fg-subtle" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-2">
            <span className="type-label-m text-fg">{entry.name}</span>
            <Hash value={entry.address} noun="contract" tone="quiet" />
          </span>
          <span
            className="truncate type-mono-s text-fg-subtle"
            title={entry.artifactPath ?? undefined}
          >
            {entry.artifactPath ? fileName(entry.artifactPath) : "no artifact recorded"}
          </span>
        </div>
        {registered ? (
          <Tag tone="success">Added</Tag>
        ) : (
          <Button size="sm" onClick={register} pending={pending} disabled={!entry.artifactPath}>
            Add
          </Button>
        )}
      </div>
      {error ? <Banner kind="alarm">{error}</Banner> : null}
    </li>
  );
}

const INSTANCE_FIELDS = [
  { key: "salt", label: "Salt" },
  { key: "deployer", label: "Deployer" },
  { key: "initializationHash", label: "Initialization hash" },
  { key: "immutablesHash", label: "Immutables hash" },
  { key: "publicKeys", label: "Public keys" },
] as const;

type InstanceDraft = Record<(typeof INSTANCE_FIELDS)[number]["key"], string>;
const EMPTY_INSTANCE: InstanceDraft = {
  salt: "",
  deployer: "",
  initializationHash: "",
  immutablesHash: "",
  publicKeys: "",
};

/** Any contract: its address and its artifact file, and its deployment when the node doesn't publish it. */
function ByArtifact({ onAdded }: { onAdded: (contract: ContractView) => void }) {
  const [address, setAddress] = useState("");
  const [path, setPath] = useState<string>();
  const [instance, setInstance] = useState<InstanceDraft>(EMPTY_INSTANCE);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const addressError =
    address.trim() && !ADDRESS.test(address.trim()) ? "0x and 64 hex" : undefined;
  const withInstance = Object.values(instance).some((value) => value.trim());

  const choose = useCallback(async () => {
    setError(undefined);
    try {
      const picked = await unwrap(window.ome.contracts.chooseArtifact());
      if (picked) setPath(picked);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  }, []);
  const register = useCallback(async () => {
    if (!path) return;
    setPending(true);
    setError(undefined);
    try {
      onAdded(
        await unwrap(
          window.ome.contracts.register({
            address: address.trim().toLowerCase() as Hex32,
            artifactPath: path,
            instance: withInstance
              ? (Object.fromEntries(
                  Object.entries(instance).map(([key, value]) => [key, value.trim()]),
                ) as ContractInstanceInput)
              : undefined,
          }),
        ),
      );
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [address, instance, onAdded, path, withInstance]);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="type-overline text-fg-subtle">By its artifact</h3>
      <TextField
        label="Address"
        mono
        placeholder="0x…"
        value={address}
        onValueChange={setAddress}
        error={addressError}
        disabled={pending}
      />
      <div className="flex items-center gap-3">
        <Button icon="file" onClick={choose} disabled={pending}>
          {path ? "Choose another…" : "Choose artifact…"}
        </Button>
        <span className="min-w-0 truncate type-mono-s text-fg-muted" title={path}>
          {path ? fileName(path) : "The JSON aztec compile writes to target/"}
        </span>
      </div>
      <details className="group rounded-md bg-surface shadow-1">
        <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2.5 type-label-m text-fg transition-colors duration-fast ease-standard hover:bg-hover [&::-webkit-details-marker]:hidden">
          Not published on the node?
          <Icon
            name="chevron-down"
            size={16}
            className="text-fg-subtle transition-transform duration-fast ease-standard group-open:rotate-180"
          />
        </summary>
        <div className="flex flex-col gap-3 border-t border-line-subtle px-3 py-3">
          <p className="type-body-s text-fg-muted">
            A contract deployed without publishing its instance needs its deployment, as the
            deployer has it.
          </p>
          {INSTANCE_FIELDS.map((field) => (
            <InstanceField
              key={field.key}
              field={field.key}
              label={field.label}
              value={instance[field.key]}
              onChange={setInstance}
              disabled={pending}
            />
          ))}
        </div>
      </details>
      {error ? <Banner kind="alarm">{error}</Banner> : null}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={register}
          pending={pending}
          disabled={!path || !ADDRESS.test(address.trim())}
        >
          Add contract
        </Button>
      </div>
    </section>
  );
}

function InstanceField({
  field,
  label,
  value,
  onChange,
  disabled,
}: {
  field: keyof InstanceDraft;
  label: string;
  value: string;
  onChange: (update: (current: InstanceDraft) => InstanceDraft) => void;
  disabled: boolean;
}) {
  const change = useCallback(
    (next: string) => onChange((current) => ({ ...current, [field]: next })),
    [field, onChange],
  );
  return (
    <TextField
      label={label}
      mono
      placeholder="0x…"
      value={value}
      onValueChange={change}
      disabled={disabled}
    />
  );
}
