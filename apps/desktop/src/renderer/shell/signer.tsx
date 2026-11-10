import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { failureKind } from "../data/failure.ts";
import { Unlock } from "./unlock.tsx";

type Signer = {
  /** Opens the unlock sheet; true once the member unlocked, false if they closed it. */
  unlock: () => Promise<boolean>;
};

const SignerContext = createContext<Signer | undefined>(undefined);

/** The unlock sheet, for the top bar and ⌘K, and for any action that needs the signer while it is locked. */
export function SignerProvider({
  maxSeconds,
  children,
}: {
  maxSeconds: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const waiting = useRef<((unlocked: boolean) => void) | undefined>(undefined);

  const settle = useCallback((unlocked: boolean) => {
    waiting.current?.(unlocked);
    waiting.current = undefined;
  }, []);
  const unlock = useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        settle(false);
        waiting.current = resolve;
        setOpen(true);
      }),
    [settle],
  );
  const change = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) settle(false);
    },
    [settle],
  );
  const unlocked = useCallback(() => settle(true), [settle]);
  const value = useMemo(() => ({ unlock }), [unlock]);

  return (
    <SignerContext.Provider value={value}>
      {children}
      <Unlock open={open} onOpenChange={change} onUnlocked={unlocked} maxSeconds={maxSeconds} />
    </SignerContext.Provider>
  );
}

export function useUnlock(): () => Promise<boolean> {
  const signer = useContext(SignerContext);
  if (!signer) throw new Error("useUnlock needs a SignerProvider.");
  return signer.unlock;
}

/**
 * Runs an action that signs. When the signer is locked it asks the member to unlock, then runs it once more; it
 * returns undefined if they don't.
 */
export function useWithSigner(): <T>(action: () => Promise<T>) => Promise<T | undefined> {
  const unlock = useUnlock();
  return useCallback(
    async <T,>(action: () => Promise<T>) => {
      try {
        return await action();
      } catch (failure) {
        if (failureKind(failure) !== "locked") throw failure;
        return (await unlock()) ? action() : undefined;
      }
    },
    [unlock],
  );
}
