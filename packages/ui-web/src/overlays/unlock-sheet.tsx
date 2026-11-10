import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

import { Icon } from "@ome-labs/icons/web";

import { Button } from "../actions/button.tsx";
import { SegmentedControl } from "../forms/segmented-control.tsx";
import { TextField } from "../forms/text-field.tsx";
import { Dialog, DialogClose } from "./dialog.tsx";

export type UnlockRequest =
  | { method: "passphrase"; passphrase: string; ttlSecs: number }
  | { method: "touchId"; ttlSecs: number };

export type UnlockSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: (request: UnlockRequest) => void | Promise<void>;
  /** Offer Touch ID beside the passphrase, when the signer was sealed with it. */
  touchId?: boolean | undefined;
  /** The choices of how long to stay unlocked, in seconds. */
  durations?: number[] | undefined;
  defaultDuration?: number | undefined;
  /** The daemon's ceiling; longer choices are left out. */
  maxDuration?: number | undefined;
  /** Why the last attempt failed. The field shakes each time a new one arrives. */
  error?: string | undefined;
  pending?: boolean | undefined;
  title?: string | undefined;
  description?: string | undefined;
};

const defaultDurations = [300, 900, 3600];

/** "5 min", "15 min", "1 h": what the segmented control shows for a number of seconds. */
function durationLabel(seconds: number) {
  if (seconds >= 3600 && seconds % 3600 === 0) return `${seconds / 3600} h`;
  if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60} min`;
  return `${seconds} s`;
}

/**
 * Page 37's unlock sheet: the passphrase, how long to stay unlocked, and Touch ID where the signer has it.
 * The passphrase lives only in this sheet's state while it is open (it unmounts on close) and is handed to
 * `onUnlock` once; nothing here logs or keeps it.
 */
export function UnlockSheet({
  open,
  onOpenChange,
  title = "Unlock to sign",
  description = "Your signing key never leaves this computer. Unlock it to approve and reject without your passphrase until the time runs out.",
  ...form
}: UnlockSheetProps) {
  const field = useRef<HTMLInputElement>(null);

  return (
    <Dialog
      title={title}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      initialFocus={field}
    >
      <UnlockForm field={field} {...form} />
    </Dialog>
  );
}

function UnlockForm({
  field,
  onUnlock,
  touchId,
  durations = defaultDurations,
  defaultDuration = 900,
  maxDuration,
  error,
  pending,
}: Omit<UnlockSheetProps, "open" | "onOpenChange" | "title" | "description"> & {
  field: RefObject<HTMLInputElement | null>;
}) {
  const choices = useMemo(() => {
    const allowed = durations.filter(
      (seconds) => maxDuration === undefined || seconds <= maxDuration,
    );
    // A ceiling below every choice still leaves one: the ceiling itself.
    return allowed.length ? allowed : maxDuration ? [maxDuration] : durations;
  }, [durations, maxDuration]);
  const options = useMemo(
    () => choices.map((seconds) => ({ value: String(seconds), label: durationLabel(seconds) })),
    [choices],
  );
  const initial = choices.includes(defaultDuration) ? defaultDuration : choices.at(-1);

  const [passphrase, setPassphrase] = useState("");
  const [duration, setDuration] = useState(String(initial));
  const shaking = useRef<HTMLDivElement>(null);

  const ttlSecs = Number(duration);
  const canUnlock = passphrase.length > 0 && !pending;

  // A wrong passphrase gets a short sideways shake, the way a login field refuses: the error text alone is
  // easy to miss when the eyes are on the field. Reduced motion keeps the text and drops the shake.
  useEffect(() => {
    const element = shaking.current;
    if (!error || !element || typeof element.animate !== "function") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    element.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(5px)" },
        { transform: "translateX(-3px)" },
        { transform: "translateX(2px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 280, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
  }, [error]);

  return (
    <form
      className="flex flex-col gap-[18px]"
      aria-busy={pending ? true : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        if (canUnlock) void onUnlock({ method: "passphrase", passphrase, ttlSecs });
      }}
    >
      <div ref={shaking}>
        <TextField
          ref={field}
          label="Passphrase"
          type="password"
          autoComplete="current-password"
          value={passphrase}
          onValueChange={(value) => setPassphrase(value)}
          error={error}
          readOnly={pending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="type-label-m text-fg">Unlock for</span>
        <SegmentedControl
          aria-label="Unlock for"
          className="self-start"
          value={duration}
          onValueChange={setDuration}
          options={options}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {touchId ? (
          <Button
            icon="fingerprint"
            disabled={pending}
            onClick={() => void onUnlock({ method: "touchId", ttlSecs })}
          >
            Use Touch ID
          </Button>
        ) : null}
        <span className="flex-1" />
        <DialogClose render={<Button variant="ghost">Cancel</Button>} />
        <Button type="submit" variant="primary" disabled={!canUnlock}>
          {pending ? (
            <>
              <Icon name="loader" size={16} className="motion-safe:animate-spin" />
              Unlocking…
            </>
          ) : (
            <>
              <Icon name="unlock" size={16} />
              Unlock
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
