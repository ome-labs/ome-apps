import { type FormEvent, useCallback, useMemo, useState } from "react";

import type { NodeStatus } from "@ome-labs/api";
import { Banner, Button, SegmentedControl, TextField } from "@ome-labs/ui-web";

import { unwrap } from "../data/session.ts";
import { StepHeading } from "./layout.tsx";
import {
  LOCAL_NODE,
  NETWORK_OPTIONS,
  type NetworkChoice,
  TESTNET_NODE,
  nodeFix,
} from "./networks.ts";

export interface ProfileDraft {
  member: string;
  nodeUrl: string;
}

/**
 * Step 1: who the member is and which node their account lives on. Continuing starts a daemon for the new profile,
 * points it at the node and checks the node answers, as `ome init` does, before anything is created.
 */
export function ProfileStep({
  draft,
  onBack,
  onReady,
}: {
  draft: ProfileDraft | undefined;
  onBack: () => void;
  onReady: (draft: ProfileDraft, node: NodeStatus) => void;
}) {
  const [member, setMember] = useState(draft?.member ?? "");
  const [network, setNetwork] = useState<NetworkChoice>(
    draft === undefined || draft.nodeUrl === LOCAL_NODE
      ? "local"
      : draft.nodeUrl === TESTNET_NODE
        ? "testnet"
        : "custom",
  );
  const [customUrl, setCustomUrl] = useState(
    draft && network === "custom" ? draft.nodeUrl : "https://",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [unreachable, setUnreachable] = useState<NodeStatus>();

  const nodeUrl =
    network === "local" ? LOCAL_NODE : network === "testnet" ? TESTNET_NODE : customUrl.trim();
  const nameError = member.trim().length > 48 ? "Use at most 48 characters." : undefined;
  const ready = member.trim().length > 0 && !nameError && /^https?:\/\/.+/u.test(nodeUrl);

  const submit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (!ready || pending) return;
      setPending(true);
      setError(undefined);
      setUnreachable(undefined);
      try {
        const next = { member: member.trim(), nodeUrl };
        const node = await unwrap(window.ome.session.setup(next));
        if (node.reachable) onReady(next, node);
        else setUnreachable(node);
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : String(failure));
      } finally {
        setPending(false);
      }
    },
    [member, nodeUrl, onReady, pending, ready],
  );
  const retry = useCallback(() => void submit(), [submit]);
  const retryAction = useMemo(() => ({ label: "Try again", onClick: retry }), [retry]);

  return (
    <form className="flex flex-col gap-6" onSubmit={submit}>
      <StepHeading step="Step 1 of 2" title="Create your profile">
        One profile is one member on this computer. Ome starts a daemon for it that keeps your
        wallet and signing key.
      </StepHeading>

      {unreachable ? (
        <Banner kind="alarm" action={retryAction}>
          Can't reach the node at {unreachable.url}. {nodeFix(unreachable.url)}
        </Banner>
      ) : null}
      {error ? <Banner kind="alarm">{error}</Banner> : null}

      <TextField
        label="Your name"
        hint="Shown to the other members on rosters and votes."
        value={member}
        onValueChange={setMember}
        error={nameError}
        maxLength={48}
        disabled={pending}
      />

      <div className="flex flex-col gap-2">
        <span className="type-label-m text-fg">Network</span>
        <SegmentedControl
          aria-label="Network"
          options={NETWORK_OPTIONS}
          value={network}
          onValueChange={setNetwork}
        />
        {network === "custom" ? (
          <TextField
            label="Node URL"
            hint="The JSON-RPC URL of an Aztec node."
            value={customUrl}
            onValueChange={setCustomUrl}
            mono
            disabled={pending}
          />
        ) : (
          <span className="type-mono-s text-fg-subtle">{nodeUrl}</span>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onBack} disabled={pending}>
          Back
        </Button>
        <Button variant="primary" type="submit" disabled={!ready || pending}>
          {pending ? "Starting your daemon…" : "Continue"}
        </Button>
      </div>
    </form>
  );
}
