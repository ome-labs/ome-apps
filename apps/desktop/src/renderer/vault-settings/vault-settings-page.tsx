import { type ReactNode, useCallback, useMemo, useState } from "react";

import { useNavigate, useParams } from "@tanstack/react-router";

import type { ContractView, Hex32, VaultSummary } from "@ome-labs/api";
import type { AvatarId } from "@ome-labs/brand/web";
import { shortHex } from "@ome-labs/format";
import {
  Banner,
  Button,
  Dialog,
  Hash,
  Switch,
  Tag,
  TextInput,
  TextField,
  cn,
  toast,
} from "@ome-labs/ui-web";

import { AvatarButton } from "../avatars/avatar-button.tsx";
import { AvatarPicker } from "../avatars/avatar-picker.tsx";
import { useAvatars, vaultAvatar } from "../avatars/avatars.ts";
import { callOme, useOme } from "../data/ome.ts";
import { AddContract } from "../proposals/calls/add-contract.tsx";
import { Page } from "../shell/page.tsx";
import { Internals } from "./internals.tsx";

const ALIAS = /^[a-z0-9_-]{1,32}$/u;

/** Why a vault name can't be used, if it can't. */
export function nameProblem(name: string): string | undefined {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "A vault needs a name.";
  if (trimmed.length > 48) return "At most 48 characters.";
  return undefined;
}

/** Why an alias can't be used, if it can't. */
export function aliasProblem(alias: string): string | undefined {
  if (alias.length === 0) return undefined;
  if (alias.length > 32) return "At most 32 characters.";
  if (!ALIAS.test(alias)) return "Lowercase letters, digits, - and _ only.";
  return undefined;
}

/** `/vaults/$vault/settings`: the vault's name and picture, how this computer refers to it, its contracts, internals. */
export function VaultSettingsPage() {
  const { vault } = useParams({ strict: false }) as { vault: Hex32 };
  const status = useOme("status", {});
  const details = useOme("vault.details", { vault });
  const summary = status.data?.vaults.find((item) => item.address === vault);

  return (
    <Page
      title="Vault settings"
      lead="How the vault is named and found, the contracts its proposals call, and its internals."
    >
      <div className="flex max-w-3xl flex-col gap-8">
        {details.error ? <Banner kind="alarm">{details.error.message}</Banner> : null}
        {summary ? (
          <>
            <Identity vault={vault} summary={summary} />
            <OnThisComputer vault={vault} summary={summary} />
          </>
        ) : null}
        <Contracts />
        {details.data ? <Internals details={details.data} /> : null}
        {summary && details.data ? (
          <Leave
            vault={vault}
            summary={summary}
            removed={details.data.committee.keeperStatus === "removed"}
          />
        ) : null}
      </div>
    </Page>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h2 className="type-heading-s text-fg">{title}</h2>
        {description ? <p className="type-body-s text-fg-muted">{description}</p> : null}
      </header>
      <div className="flex flex-col rounded-lg bg-surface px-5 shadow-1">{children}</div>
    </section>
  );
}

function Row({
  title,
  description,
  children,
  below,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  below?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line-subtle py-4 last:border-b-0">
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="type-label-m text-fg">{title}</span>
          {description ? <span className="type-body-s text-fg-muted">{description}</span> : null}
        </div>
        {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
      </div>
      {below}
    </div>
  );
}

/** The name every member sees, and the picture only this computer shows. */
function Identity({ vault, summary }: { vault: Hex32; summary: VaultSummary }) {
  const avatars = useAvatars();
  const picture = vaultAvatar(avatars, vault);
  const [picking, setPicking] = useState(false);
  const openPicker = useCallback(() => setPicking(true), []);
  const target = useMemo(() => ({ kind: "vault" as const, vault }), [vault]);
  const selected = picture.kind === "art" ? (picture.id as AvatarId) : undefined;

  return (
    <Card title="Name and picture">
      <Row title="Picture" description="Only on this computer.">
        <AvatarButton
          name={summary.name}
          source={picture}
          shape="square"
          size={40}
          label="Change the vault's picture"
          onClick={openPicker}
        />
      </Row>
      <Rename vault={vault} current={summary.name} />
      <AvatarPicker
        kind="vault"
        name={summary.name}
        open={picking}
        onOpenChange={setPicking}
        selected={selected}
        target={target}
        removable={Boolean(avatars?.vaults[vault])}
      />
    </Card>
  );
}

function Rename({ vault, current }: { vault: Hex32; current: string }) {
  const [name, setName] = useState(current);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const problem = name === current ? undefined : nameProblem(name);
  const changed = name.trim() !== current && !problem;

  const save = useCallback(async () => {
    setPending(true);
    setError(undefined);
    try {
      const renamed = await callOme("vault.rename", { vault, name: name.trim() });
      toast(`Renamed to ${renamed.name} for every member`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [name, vault]);

  const submit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (changed) void save();
    },
    [changed, save],
  );

  return (
    <Row
      title="Name"
      description="Every member sees it: the change is signed and sent to their keepers."
      below={
        <form className="flex items-start gap-2" onSubmit={submit}>
          <TextField
            label="Vault name"
            className="flex-1"
            value={name}
            onValueChange={setName}
            maxLength={48}
            error={problem ?? error}
            disabled={pending}
          />
          <Button type="submit" className="mt-[26px]" pending={pending} disabled={!changed}>
            Rename
          </Button>
        </form>
      }
    />
  );
}

/** How this computer refers to the vault: its alias for the command line, and whether it opens at launch. */
function OnThisComputer({ vault, summary }: { vault: Hex32; summary: VaultSummary }) {
  const [alias, setAlias] = useState(summary.alias ?? "");
  const [pending, setPending] = useState<"alias" | "default">();
  const [error, setError] = useState<string>();
  const problem = aliasProblem(alias);
  const changed = alias !== (summary.alias ?? "") && alias.length > 0 && !problem;

  const saveAlias = useCallback(async () => {
    setPending("alias");
    setError(undefined);
    try {
      await callOme("vault.alias", { vault, alias });
      toast(`Alias set: ome --vault ${alias}`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(undefined);
    }
  }, [alias, vault]);
  const submitAlias = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (changed) void saveAlias();
    },
    [changed, saveAlias],
  );
  const typeAlias = useCallback((next: string) => setAlias(next.toLowerCase()), []);
  const makeDefault = useCallback(async () => {
    setPending("default");
    try {
      await callOme("vault.use", { vault });
      toast(`${summary.name} opens when Ome starts`);
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(undefined);
    }
  }, [summary.name, vault]);

  const useAsDefault = useCallback(() => void makeDefault(), [makeDefault]);

  return (
    <Card title="On this computer" description="Only for you; the other members choose their own.">
      <Row
        title="Alias"
        description={
          <>
            A short name for the command line:{" "}
            <code className="type-mono-s">
              ome --vault {summary.alias ?? (alias || "treasury")}
            </code>
          </>
        }
        below={
          <form className="flex items-start gap-2" onSubmit={submitAlias}>
            <div className="flex flex-1 flex-col gap-1">
              <TextInput
                aria-label="Alias"
                mono
                value={alias}
                onValueChange={typeAlias}
                placeholder="treasury"
                maxLength={32}
                aria-invalid={Boolean(problem ?? error) || undefined}
                disabled={pending !== undefined}
              />
              {(problem ?? error) ? (
                <span className="type-caption text-danger">{problem ?? error}</span>
              ) : null}
            </div>
            <Button type="submit" pending={pending === "alias"} disabled={!changed}>
              Set alias
            </Button>
          </form>
        }
      />
      <Row title="Default vault" description="The vault Ome opens when it starts.">
        {summary.isDefault ? (
          <Tag tone="success">Default</Tag>
        ) : (
          <Switch
            label="Open at start"
            checked={false}
            onCheckedChange={useAsDefault}
            disabled={pending !== undefined}
          />
        )}
      </Row>
    </Card>
  );
}

const SOURCES = { registered: "Added by you", token: "A vault token", vault: "The vault" } as const;

/** The contracts this member's proposals can call; a member's list is their own. */
function Contracts() {
  const contracts = useOme("contracts.list", {});
  const list = useMemo(() => contracts.data ?? [], [contracts.data]);
  const added = useCallback((contract: ContractView) => toast(`Added ${contract.name}`), []);

  return (
    <Card
      title="Contracts for proposals"
      description="The contracts your proposals can call. Other members' daemons fetch a proposal's contracts when they review it."
    >
      {contracts.error ? (
        <Banner kind="alarm" className="my-4">
          {contracts.error.message}
        </Banner>
      ) : null}
      <ul className="flex flex-col">
        {list.map((contract) => (
          <ContractRow key={contract.address} contract={contract} />
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3 py-4">
        <span className="type-caption text-fg-subtle">
          {list.length === 0
            ? "No contracts yet."
            : `${list.length} ${list.length === 1 ? "contract" : "contracts"}`}
        </span>
        <AddContract registered={list} onAdded={added} label="Add a contract" />
      </div>
    </Card>
  );
}

function ContractRow({ contract }: { contract: ContractView }) {
  const [pending, setPending] = useState(false);
  const remove = useCallback(async () => {
    setPending(true);
    try {
      await callOme("contracts.remove", { contract: contract.address });
      toast(`${contract.name} is no longer offered in new proposals`);
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : String(failure));
      setPending(false);
    }
  }, [contract.address, contract.name]);

  return (
    <li className="flex items-center gap-3 border-b border-line-subtle py-3">
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2">
          <span className="type-label-m text-fg">{contract.name}</span>
          <span className="type-caption text-fg-subtle">{SOURCES[contract.source]}</span>
        </span>
        <span className="flex items-center gap-2 type-caption text-fg-subtle">
          <Hash value={contract.address} noun="contract" tone="quiet" />
          {contract.functions} functions
        </span>
      </span>
      {contract.source === "registered" ? (
        <Button size="sm" variant="ghost" onClick={remove} pending={pending}>
          Remove
        </Button>
      ) : null}
    </li>
  );
}

/**
 * Retiring destroys this member's share of the viewing key for good. The keeper refuses while the chain still names
 * the committee the share serves, so it only goes through once this member was removed.
 */
function Leave({
  vault,
  summary,
  removed,
}: {
  vault: Hex32;
  summary: VaultSummary;
  removed: boolean;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const confirmed = typed.trim() === summary.name;

  const show = useCallback(() => setOpen(true), []);
  const change = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setTyped("");
      setError(undefined);
    }
  }, []);
  const keep = useCallback(() => change(false), [change]);
  const retire = useCallback(async () => {
    setPending(true);
    setError(undefined);
    try {
      const left = await callOme("vault.retire", { vault });
      setOpen(false);
      toast(`Your share of ${summary.name} is gone`);
      const next = left.find((item) => item.isDefault) ?? left[0];
      await navigate(
        next ? { to: "/vaults/$vault", params: { vault: next.address } } : { to: "/home" },
      );
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [navigate, summary.name, vault]);

  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-lg px-5 py-4",
        removed ? "bg-danger-subtle inset-ring inset-ring-danger/25" : "bg-surface shadow-1",
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="type-heading-s text-fg">Retire your share</h2>
          <p className="type-body-s text-fg-muted">
            {removed
              ? `You were removed from ${summary.name}, and your keeper still holds its old share. It no longer works with the new committee; retiring erases it for good.`
              : `Only after you've been removed from ${summary.name}. While the vault on chain names your keeper's committee, the keeper refuses, so a working vault can't be broken by mistake.`}
          </p>
        </div>
        <Button variant={removed ? "danger" : "ghost"} onClick={show}>
          Retire…
        </Button>
      </div>
      <Dialog
        title={`Retire your share of ${summary.name}?`}
        description="This erases your keeper's share for good. You won't be able to read anything in this vault again, and it leaves your list."
        open={open}
        onOpenChange={change}
        actions={
          <>
            <Button variant="ghost" onClick={keep} disabled={pending}>
              Keep it
            </Button>
            <Button variant="danger" onClick={retire} pending={pending} disabled={!confirmed}>
              Retire share
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <TextField
            label={`Type ${summary.name} to confirm`}
            value={typed}
            onValueChange={setTyped}
            placeholder={summary.name}
            disabled={pending}
          />
          {error ? <Banner kind="alarm">{error}</Banner> : null}
          <p className="type-caption text-fg-subtle">{shortHex(vault)}</p>
        </div>
      </Dialog>
    </section>
  );
}
