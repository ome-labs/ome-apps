import { type FormEvent, useCallback, useState } from "react";

import type { NodeStatus } from "@ome-labs/api";
import { Banner, Button, TextField } from "@ome-labs/ui-web";

import { callOme } from "../data/ome.ts";
import { unwrap } from "../data/session.ts";
import { StepHeading } from "./layout.tsx";
import { Reveal } from "./motion.tsx";
import { describeNode, isLocal } from "./networks.ts";
import type { ProfileDraft } from "./profile-step.tsx";

const MIN_LENGTH = 8;

/** How strong a passphrase looks, by length alone: the daemon's only rule is the minimum. */
function strength(passphrase: string): string {
  if (passphrase.length < MIN_LENGTH) return `At least ${MIN_LENGTH} characters.`;
  if (passphrase.length < 14) return "Long enough. A few more words make it much harder to guess.";
  return "Strong.";
}

/**
 * Step 2: the passphrase that seals the signing key. Creating the profile seals a new key under it, makes the keeper's
 * master key and the member's Aztec account; then the app opens the profile.
 */
export function PassphraseStep({
  draft,
  node,
  onBack,
}: {
  draft: ProfileDraft;
  node: NodeStatus;
  onBack: () => void;
}) {
  const [passphrase, setPassphrase] = useState("");
  const [again, setAgain] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const mismatch = again.length > 0 && again !== passphrase.slice(0, again.length);
  const ready = passphrase.length >= MIN_LENGTH && again === passphrase;

  const create = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!ready || pending) return;
      setPending(true);
      setError(undefined);
      try {
        await callOme("profile.create", {
          name: draft.member,
          nodeUrl: draft.nodeUrl,
          passphrase,
        });
        // A local network has no prover worth running; Testnet proofs are real.
        await callOme("config.set", { proverEnabled: !isLocal(draft.nodeUrl) });
        const state = await window.ome.session.state();
        if (state.phase !== "choose") await unwrap(window.ome.session.open(state.profile));
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : String(failure));
        setPending(false);
      }
    },
    [draft, passphrase, pending, ready],
  );

  return (
    <form className="flex flex-col gap-6" onSubmit={create}>
      <StepHeading step="Step 2 of 2" title="Choose a passphrase">
        It seals your signing key on this computer. Nobody can recover it, Ome included, so keep it
        somewhere safe.
      </StepHeading>

      <Reveal>
        <p className="type-body-s text-fg-muted">
          {draft.member} on {describeNode(node)}
        </p>
      </Reveal>

      {error ? (
        <Reveal>
          <Banner kind="alarm">{error}</Banner>
        </Reveal>
      ) : null}

      <Reveal className="flex flex-col gap-6">
        <TextField
          label="Passphrase"
          type="password"
          hint={strength(passphrase)}
          value={passphrase}
          onValueChange={setPassphrase}
          autoComplete="new-password"
          disabled={pending}
        />
        <TextField
          label="Passphrase again"
          type="password"
          value={again}
          onValueChange={setAgain}
          error={mismatch ? "This doesn't match." : undefined}
          autoComplete="new-password"
          disabled={pending}
        />
      </Reveal>

      <Reveal className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onBack} disabled={pending}>
          Back
        </Button>
        <Button variant="primary" type="submit" disabled={!ready || pending}>
          {pending ? "Sealing your key and creating your account…" : "Create profile"}
        </Button>
      </Reveal>
    </form>
  );
}
