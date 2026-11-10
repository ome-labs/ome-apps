import { useCallback, useState } from "react";

import { Banner, Button } from "@ome-labs/ui-web";

import { failureKind } from "../data/failure.ts";
import { openNewProfile, unwrap } from "../data/session.ts";
import { StepHeading } from "./layout.tsx";
import { Reveal } from "./motion.tsx";

/**
 * The last step on a Mac with Touch ID: keep the signer's sealing key in the keychain behind a fingerprint, so
 * unlocking doesn't need the passphrase. The passphrase it was just given derives the key once; then the app opens
 * the profile either way.
 */
export function TouchIdStep({ position, passphrase }: { position: string; passphrase: string }) {
  const [pending, setPending] = useState<"enabling" | "opening">();
  const [error, setError] = useState<string>();

  const open = useCallback(async () => {
    setPending("opening");
    try {
      await openNewProfile();
    } catch (failure) {
      setPending(undefined);
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  }, []);

  const enable = useCallback(async () => {
    setPending("enabling");
    setError(undefined);
    try {
      await unwrap(window.ome.touchId.enable(passphrase));
    } catch (failure) {
      setPending(undefined);
      setError(
        failureKind(failure) === "auth"
          ? "Touch ID was cancelled. Try again, or skip it for now."
          : failure instanceof Error
            ? failure.message
            : String(failure),
      );
      return;
    }
    await open();
  }, [open, passphrase]);

  const skip = useCallback(() => void open(), [open]);
  const turnOn = useCallback(() => void enable(), [enable]);

  return (
    <>
      <StepHeading step={position} title="Unlock with Touch ID">
        Approve with your fingerprint instead of your passphrase.
      </StepHeading>

      {error ? (
        <Reveal>
          <Banner kind="alarm">{error}</Banner>
        </Reveal>
      ) : null}

      <Reveal className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={skip} disabled={pending !== undefined}>
          Not now
        </Button>
        <Button
          variant="primary"
          icon="fingerprint"
          onClick={turnOn}
          pending={pending === "enabling"}
          disabled={pending === "opening"}
        >
          {pending === "enabling" ? "Waiting…" : "Use Touch ID"}
        </Button>
      </Reveal>
    </>
  );
}
