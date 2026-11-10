import { useCallback, useEffect, useState } from "react";

import { UnlockSheet, type UnlockRequest } from "@ome-labs/ui-web";

import { callOme } from "../data/ome.ts";
import { unwrap } from "../data/session.ts";

/**
 * Unlocking the signer for as long as the member picks, up to the daemon's ceiling: with the passphrase, or with
 * Touch ID when this profile keeps its sealing key in the keychain (the key never leaves the main process).
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
  const [touchId, setTouchId] = useState(false);

  // Asked each time the sheet opens: Touch ID can be turned on or off in the meantime (from the CLI too).
  useEffect(() => {
    if (!open) return;
    let live = true;
    const check = async (): Promise<void> => {
      const state = await window.ome.touchId.state();
      if (live) setTouchId(state.available && state.enabled);
    };
    void check();
    return () => {
      live = false;
    };
  }, [open]);

  const change = useCallback(
    (next: boolean) => {
      setError(undefined);
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const unlock = useCallback(
    async (request: UnlockRequest) => {
      setPending(true);
      setError(undefined);
      try {
        if (request.method === "touchId") {
          await unwrap(window.ome.touchId.unlock(request.ttlSecs));
        } else {
          await callOme("signer.unlock", {
            secret: { passphrase: request.passphrase },
            ttlSecs: request.ttlSecs,
          });
        }
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
      touchId={touchId}
      error={error}
      pending={pending}
    />
  );
}
