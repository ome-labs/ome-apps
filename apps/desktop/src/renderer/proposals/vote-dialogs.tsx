import { useCallback, useState } from "react";

import { Banner, Button, Dialog, TextField } from "@ome-labs/ui-web";

const REASON_LIMIT = 280;

/** Rejecting, with an optional reason the other members see. A rejection can't be taken back. */
export function RejectDialog({
  open,
  onOpenChange,
  onReject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const reject = useCallback(async () => {
    setPending(true);
    setError(undefined);
    try {
      await onReject(reason);
      setReason("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [onReject, reason]);

  return (
    <Dialog
      title="Reject this proposal?"
      description="The other members see your rejection and its reason. It can't be taken back."
      open={open}
      onOpenChange={onOpenChange}
      actions={
        <>
          <Button variant="ghost" onClick={close} disabled={pending}>
            Keep it
          </Button>
          <Button variant="danger" onClick={reject} pending={pending}>
            Reject
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {error ? <Banner kind="alarm">{error}</Banner> : null}
        <TextField
          label="Reason"
          hint="Optional."
          value={reason}
          onValueChange={setReason}
          maxLength={REASON_LIMIT}
          disabled={pending}
        />
      </div>
    </Dialog>
  );
}

/** Cancelling makes a cancel proposal, which needs the same approvals as any other. */
export function CancelDialog({
  open,
  onOpenChange,
  threshold,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threshold: number;
  onCancel: () => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const cancel = useCallback(async () => {
    setPending(true);
    setError(undefined);
    try {
      await onCancel();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setPending(false);
    }
  }, [onCancel]);

  return (
    <Dialog
      title="Cancel this proposal?"
      description={`Cancelling is a proposal of its own. It takes effect once ${threshold} ${threshold === 1 ? "member approves" : "members approve"} it, and your approval counts as the first.`}
      open={open}
      onOpenChange={onOpenChange}
      actions={
        <>
          <Button variant="ghost" onClick={close} disabled={pending}>
            Keep it
          </Button>
          <Button variant="danger" onClick={cancel} pending={pending}>
            Propose to cancel
          </Button>
        </>
      }
    >
      {error ? <Banner kind="alarm">{error}</Banner> : null}
    </Dialog>
  );
}
