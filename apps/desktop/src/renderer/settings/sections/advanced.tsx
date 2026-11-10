import { type FormEvent, useCallback, useState } from "react";

import type { KeeperState, Settings } from "@ome-labs/api";
import {
  Button,
  CopyButton,
  PasswordField,
  StatusBadge,
  Switch,
  TextField,
} from "@ome-labs/ui-web";

import { callOme } from "../../data/ome.ts";
import { Row, Section, Value } from "../parts.tsx";
import { useSave } from "../save.ts";

const ZERO_SALT = `0x${"0".repeat(64)}`;

/** Settings most members never touch: where the keeper runs, who pays fees, and `aztec-wallet`. */
export function Advanced({ keeper, settings }: { keeper: KeeperState; settings: Settings }) {
  return (
    <>
      <Keeper keeper={keeper} remote={settings.remoteKeeper} />
      <Fees salt={settings.feePayerSalt} />
      <AztecWallet dir={settings.aztecWalletDir} sync={settings.aztecWalletSync} />
    </>
  );
}

function Keeper({ keeper, remote }: { keeper: KeeperState; remote: Settings["remoteKeeper"] }) {
  const save = useSave();
  const useLocal = useCallback(
    () =>
      void save(() => callOme("keeper.connect", { remote: null }), "Using this computer's keeper"),
    [save],
  );

  return (
    <Section
      id="keeper"
      title="Keeper"
      description="Holds your share of each vault's viewing key and talks to the other members' keepers."
    >
      <Row
        title={remote ? "Keeper on your server" : "Keeper on this computer"}
        description={keeper.error ?? undefined}
      >
        <StatusBadge kind="service" status={keeper.status} />
      </Row>
      {keeper.version ? (
        <Row title="Version">
          <Value mono>{keeper.version}</Value>
        </Row>
      ) : null}
      {keeper.peerId ? (
        <Row title="Peer ID" description="How other keepers find this one.">
          <Value mono>{`${keeper.peerId.slice(0, 10)}…${keeper.peerId.slice(-6)}`}</Value>
          <CopyButton value={keeper.peerId} label="Copy peer ID" size="sm" />
        </Row>
      ) : null}
      {keeper.addresses.length > 0 ? (
        <Row
          title="Listening on"
          below={
            <ul className="flex flex-col gap-1">
              {keeper.addresses.map((address) => (
                <li key={address} className="break-all type-mono-s text-fg-muted">
                  {address}
                </li>
              ))}
            </ul>
          }
        />
      ) : null}
      {remote ? (
        <Row
          title={remote.address}
          description={
            <span className="break-all type-mono-s">{`Certificate ${remote.fingerprint}`}</span>
          }
        >
          <Button onClick={useLocal}>Use this computer's</Button>
        </Row>
      ) : (
        <RemoteKeeperForm />
      )}
    </Section>
  );
}

/** Connecting a keeper on the member's own server (`ome-keeper run --rpc-listen`): its address, pinned certificate, token. */
function RemoteKeeperForm() {
  const save = useSave();
  const [address, setAddress] = useState("");
  const [fingerprint, setFingerprint] = useState("");
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<{ address?: string; fingerprint?: string; token?: string }>(
    {},
  );

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const next: typeof errors = {};
      if (!/^[^\s:]+:[0-9]{1,5}$|^\[[0-9a-f:]+\]:[0-9]{1,5}$/iu.test(address.trim()))
        next.address = "Use host:port.";
      if (!/^[0-9a-f]{64}$/u.test(fingerprint.trim().toLowerCase().replaceAll(":", "")))
        next.fingerprint = "Use the certificate's SHA-256 fingerprint: 64 hex characters.";
      if (token.trim() === "") next.token = "Enter the keeper's token.";
      setErrors(next);
      if (Object.keys(next).length > 0) return;
      const ok = await save(
        () =>
          callOme("keeper.connect", {
            remote: {
              address: address.trim(),
              fingerprint: fingerprint.trim(),
              token: token.trim(),
            },
          }),
        `Connected to the keeper at ${address.trim()}`,
      );
      if (ok) setToken("");
    },
    [address, fingerprint, save, token],
  );

  return (
    <Row
      title="Use a keeper on your server"
      description="Vaults stay with the keeper holding their shares, so switch before founding or joining a vault."
      below={
        <form className="flex flex-col gap-3" onSubmit={submit} noValidate>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Address"
              value={address}
              onValueChange={setAddress}
              error={errors.address}
              placeholder="keeper.example:7400"
              mono
            />
            <PasswordField
              label="Token"
              value={token}
              onValueChange={setToken}
              error={errors.token}
            />
          </div>
          <TextField
            label="Certificate fingerprint"
            value={fingerprint}
            onValueChange={setFingerprint}
            error={errors.fingerprint}
            mono
          />
          <div className="flex justify-end">
            <Button type="submit">Connect</Button>
          </div>
        </form>
      }
    />
  );
}

function Fees({ salt }: { salt: string }) {
  const save = useSave();
  const [draft, setDraft] = useState(salt);
  const [error, setError] = useState<string>();

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const next = draft.trim().toLowerCase();
      if (!/^0x[0-9a-f]{64}$/u.test(next)) {
        setError("Use 0x and 64 hex characters.");
        return;
      }
      setError(undefined);
      await save(
        () => callOme("config.set", { feePayerSalt: next as `0x${string}` }),
        "Fee payer changed",
      );
    },
    [draft, save],
  );
  const reset = useCallback(() => setDraft(ZERO_SALT), []);

  return (
    <Section
      id="fees"
      title="Fees"
      description="Transactions are paid by a fee payer contract, never by the vault and never in public."
    >
      <Row
        title="Fee payer salt"
        description="Zero is the network's sponsored fee payer, right for Testnet and the local network. Another salt is your own funded deployment."
        below={
          <form className="flex items-start gap-2" onSubmit={submit} noValidate>
            <TextField
              label="Salt"
              className="flex-1"
              value={draft}
              onValueChange={setDraft}
              error={error}
              mono
            />
            <Button
              className="mt-[26px]"
              variant="ghost"
              onClick={reset}
              disabled={draft === ZERO_SALT}
            >
              Zero
            </Button>
            <Button
              type="submit"
              className="mt-[26px]"
              disabled={draft.trim().toLowerCase() === salt}
            >
              Save
            </Button>
          </form>
        }
      />
    </Section>
  );
}

function AztecWallet({ dir, sync }: { dir: string | null; sync: boolean }) {
  const save = useSave();
  const [draft, setDraft] = useState(dir ?? "");

  const submit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      void save(
        () => callOme("config.set", { aztecWalletDir: draft.trim() }),
        draft.trim() ? "aztec-wallet folder changed" : "Using aztec-wallet's default folder",
      );
    },
    [draft, save],
  );
  const toggleSync = useCallback(
    (on: boolean) =>
      void save(
        () => callOme("config.set", { aztecWalletSync: on }),
        on ? "Vault aliases go to aztec-wallet" : "Vault aliases stay in Ome",
      ),
    [save],
  );

  return (
    <Section
      id="aztec-wallet"
      title="aztec-wallet"
      description="For using vaults from Aztec's own command line wallet."
    >
      <Row
        title="Write vault aliases into aztec-wallet"
        description="So aztec-wallet can pay a vault by its alias, such as accounts:treasury."
      >
        <Switch
          label={<span className="sr-only">Write vault aliases</span>}
          checked={sync}
          onCheckedChange={toggleSync}
        />
      </Row>
      <Row
        title="Data folder"
        description="Leave it empty for aztec-wallet's own default, ~/.aztec/wallet."
        below={
          <form className="flex items-start gap-2" onSubmit={submit} noValidate>
            <TextField
              label="Folder"
              className="flex-1"
              value={draft}
              onValueChange={setDraft}
              placeholder="~/.aztec/wallet"
              mono
            />
            <Button type="submit" className="mt-[26px]" disabled={draft.trim() === (dir ?? "")}>
              Save
            </Button>
          </form>
        }
      />
    </Section>
  );
}
