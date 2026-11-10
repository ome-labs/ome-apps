import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import type { Settings, SignerStatus } from "@ome-labs/api";
import {
  Banner,
  Button,
  Dialog,
  PasswordField,
  Select,
  type SelectOption,
  Switch,
  toast,
} from "@ome-labs/ui-web";

import type { TouchIdState } from "../../../bridge/contract.ts";
import { callOme } from "../../data/ome.ts";
import { unwrap } from "../../data/session.ts";
import { useNow } from "../../shell/now.ts";
import { Unlock } from "../../shell/unlock.tsx";
import { Row, Section } from "../parts.tsx";
import { useSave } from "../save.ts";

const WINDOWS: SelectOption<string>[] = [
  { value: "300", label: "5 minutes" },
  { value: "900", label: "15 minutes" },
  { value: "3600", label: "1 hour" },
  { value: "14400", label: "4 hours" },
  { value: "28800", label: "8 hours" },
  { value: "86400", label: "24 hours" },
];

function windowLabel(seconds: number): string {
  if (seconds % 3600 === 0) return `${seconds / 3600} hour${seconds === 3600 ? "" : "s"}`;
  if (seconds % 60 === 0) return `${seconds / 60} minutes`;
  return `${seconds} seconds`;
}

function remaining(until: number, now: number): string {
  const left = Math.max(0, until - now);
  return left >= 3600
    ? `${Math.floor(left / 3600)} h ${Math.floor((left % 3600) / 60)} min`
    : `${Math.ceil(left / 60)} min`;
}

/** The signing key: whether it's open now, for how long it may stay open, and Touch ID. */
export function Signer({ signer, settings }: { signer: SignerStatus; settings: Settings }) {
  const save = useSave();
  const now = useNow();
  const [unlocking, setUnlocking] = useState(false);
  const [touchId, setTouchId] = useState<TouchIdState>();
  const [askingPassphrase, setAskingPassphrase] = useState(false);

  // Asked when the page opens and after each change here (the CLI can turn it on or off too).
  const refreshTouchId = useCallback(async () => setTouchId(await window.ome.touchId.state()), []);
  useEffect(() => {
    let live = true;
    const check = async (): Promise<void> => {
      const state = await window.ome.touchId.state();
      if (live) setTouchId(state);
    };
    void check();
    return () => {
      live = false;
    };
  }, []);

  const options = useMemo(() => {
    const current = String(settings.unlockTimeoutSecs);
    return WINDOWS.some((option) => option.value === current)
      ? WINDOWS
      : [...WINDOWS, { value: current, label: windowLabel(settings.unlockTimeoutSecs) }];
  }, [settings.unlockTimeoutSecs]);

  const setWindow = useCallback(
    (value: string) =>
      void save(
        () => callOme("config.set", { unlockTimeoutSecs: Number(value) }),
        `Unlocking now lasts up to ${windowLabel(Number(value))}`,
      ),
    [save],
  );
  const lock = useCallback(
    () => void save(() => callOme("signer.lock", {}), "Signer locked"),
    [save],
  );
  const openUnlock = useCallback(() => setUnlocking(true), []);
  const toggleTouchId = useCallback(
    (on: boolean) => {
      if (on) {
        setAskingPassphrase(true);
        return;
      }
      void save(() => unwrap(window.ome.touchId.disable()), "Touch ID is off").then(refreshTouchId);
    },
    [refreshTouchId, save],
  );
  const touchIdOn = useCallback(async () => {
    setAskingPassphrase(false);
    await refreshTouchId();
  }, [refreshTouchId]);

  const open = !signer.locked && signer.unlockedUntil !== null && signer.unlockedUntil > now;

  return (
    <Section id="signer" title="Signer" description="Your signing key never leaves this computer.">
      <Row
        title={open ? "Unlocked" : "Locked"}
        description={
          open && signer.unlockedUntil !== null
            ? `Locks itself in ${remaining(signer.unlockedUntil, now)}.`
            : "Unlock to approve without typing your passphrase."
        }
      >
        {open ? (
          <Button icon="lock" onClick={lock}>
            Lock now
          </Button>
        ) : (
          <Button icon="unlock" onClick={openUnlock}>
            Unlock…
          </Button>
        )}
      </Row>
      <Row title="Stay unlocked for at most" description="The longest choice when unlocking.">
        <Select
          aria-label="Longest unlock"
          options={options}
          value={String(settings.unlockTimeoutSecs)}
          onValueChange={setWindow}
          className="w-40"
        />
      </Row>
      {touchId?.available ? (
        <Row title="Touch ID" description="Unlock with your fingerprint.">
          <Switch
            label={<span className="sr-only">Touch ID</span>}
            checked={touchId.enabled}
            onCheckedChange={toggleTouchId}
          />
        </Row>
      ) : null}
      <Unlock
        open={unlocking}
        onOpenChange={setUnlocking}
        maxSeconds={settings.unlockTimeoutSecs}
      />
      <TouchIdDialog
        open={askingPassphrase}
        onOpenChange={setAskingPassphrase}
        onDone={touchIdOn}
      />
    </Section>
  );
}

/** Turning Touch ID on takes the passphrase once, to derive the key it keeps. */
function TouchIdDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => Promise<void>;
}) {
  const [passphrase, setPassphrase] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const change = useCallback(
    (next: boolean) => {
      setPassphrase("");
      setError(undefined);
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (passphrase === "") {
        setError("Enter your passphrase.");
        return;
      }
      setPending(true);
      setError(undefined);
      try {
        await unwrap(window.ome.touchId.enable(passphrase));
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : String(failure));
        setPending(false);
        return;
      }
      setPending(false);
      setPassphrase("");
      toast.success("Touch ID is on");
      await onDone();
    },
    [onDone, passphrase],
  );

  return (
    <Dialog
      title="Turn on Touch ID"
      description="Enter your passphrase once to turn it on."
      open={open}
      onOpenChange={change}
    >
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        {error ? <Banner kind="alarm">{error}</Banner> : null}
        <PasswordField
          label="Passphrase"
          value={passphrase}
          onValueChange={setPassphrase}
          autoComplete="current-password"
          disabled={pending}
        />
        <div className="flex justify-end">
          <Button variant="primary" type="submit" icon="fingerprint" pending={pending}>
            {pending ? "Waiting…" : "Turn on"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
