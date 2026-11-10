import { useCallback, useState } from "react";

import { UnlockSheet, type UnlockRequest } from "@ome-labs/ui-web";

import { callOme } from "../data/ome.ts";

/**
 * Unlocking the signer with the passphrase, for as long as the member picks up to the daemon's ceiling. Touch ID needs
 * the sealing key kept in the keychain, which arrives with the real daemon (Phase 7).
 */
export function Unlock({
  open,
  onOpenChange,
  maxSeconds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxSeconds: number;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const change = useCallback(
    (next: boolean) => {
      setError(undefined);
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const unlock = useCallback(
    async (request: UnlockRequest) => {
      if (request.method !== "passphrase") return;
      setPending(true);
      try {
        await callOme("signer.unlock", {
          secret: { passphrase: request.passphrase },
          ttlSecs: request.ttlSecs,
        });
        change(false);
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : String(failure));
      } finally {
        setPending(false);
      }
    },
    [change],
  );

  return (
    <UnlockSheet
      open={open}
      onOpenChange={change}
      onUnlock={unlock}
      maxDuration={maxSeconds}
      error={error}
      pending={pending}
    />
  );
}
