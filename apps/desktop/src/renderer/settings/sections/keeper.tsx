import { type FormEvent, useCallback, useState } from "react";

import type { KeeperState, Settings } from "@ome-labs/api";
import {
  Button,
  CopyButton,
  PasswordField,
  QrButton,
  StatusBadge,
  TextField,
} from "@ome-labs/ui-web";

import { callOme } from "../../data/ome.ts";
import { Row, Section, Value } from "../parts.tsx";
import { useSave } from "../save.ts";

export function Keeper({
  keeper,
  remote,
}: {
  keeper: KeeperState;
  remote: Settings["remoteKeeper"];
}) {
  const save = useSave();
  const useLocal = useCallback(
    () =>
      void save(() => callOme("keeper.connect", { remote: null }), "Using this computer's keeper"),
    [save],
  );

  return (
    <Section id="keeper" title="Keeper" description="Holds your share of each vault's viewing key.">
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
        <Row title="Peer ID">
          <Value mono>{`${keeper.peerId.slice(0, 10)}…${keeper.peerId.slice(-6)}`}</Value>
          <CopyButton value={keeper.peerId} label="Copy peer ID" size="sm" />
          <QrButton
            value={keeper.peerId}
            label="peer ID"
            title="Your keeper's peer ID"
            description="How other members' keepers find this one."
          />
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
      description="Switch before founding or joining a vault."
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
