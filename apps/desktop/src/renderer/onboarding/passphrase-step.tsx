import { useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Banner, Button, PasswordField } from "@ome-labs/ui-web";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { callOme } from "../data/ome.ts";
import { StepHeading } from "./layout.tsx";
import { Reveal } from "./motion.tsx";
import type { ProfileDraft } from "./profile-step.tsx";

/** The daemon's only rule is the minimum length (`profile.create`). */
const MIN_LENGTH = 8;

const schema = z
  .object({
    passphrase: z.string().min(MIN_LENGTH, `Use at least ${MIN_LENGTH} characters.`),
    again: z.string(),
  })
  .refine((values) => values.again === values.passphrase, {
    path: ["again"],
    message: "This doesn't match.",
  });

type Values = z.input<typeof schema>;

const DEFAULTS: Values = { passphrase: "", again: "" };

/** How strong a passphrase looks, by length alone. */
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
  position,
  onBack,
  onCreated,
}: {
  draft: ProfileDraft;
  position: string;
  onBack: () => void;
  /** The profile exists; the first run decides what comes next (Touch ID, or the app). */
  onCreated: (passphrase: string) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });
  const passphrase = useWatch({ control, name: "passphrase" });
  const [error, setError] = useState<string>();
  // Stays on after success, while the app moves to the new profile.
  const [opening, setOpening] = useState(false);
  const pending = isSubmitting || opening;

  const create = useMemo(
    () =>
      handleSubmit(async (values) => {
        setError(undefined);
        try {
          await callOme("profile.create", {
            name: draft.member,
            nodeUrl: draft.nodeUrl,
            passphrase: values.passphrase,
          });
          // A picture is a nicety: failing to save it never stops the profile.
          if (draft.picture) {
            await window.ome.avatars
              .setArt({ kind: "profile" }, draft.picture)
              .catch(() => undefined);
          }
          // Ome proves on the member's device on every network, the local one included.
          await callOme("config.set", { proverEnabled: true });
          setOpening(true);
          await onCreated(values.passphrase);
        } catch (failure) {
          setOpening(false);
          setError(failure instanceof Error ? failure.message : String(failure));
        }
      }),
    [draft, handleSubmit, onCreated],
  );

  return (
    <form className="flex flex-col gap-6" onSubmit={create} noValidate>
      <StepHeading step={position} title="Choose a passphrase">
        It seals your signing key on this computer. Nobody can recover it, Ome included, so keep it
        somewhere safe.
      </StepHeading>

      {error ? (
        <Reveal>
          <Banner kind="alarm">{error}</Banner>
        </Reveal>
      ) : null}

      <Reveal className="flex flex-col gap-6">
        <PasswordField
          label="Passphrase"
          hint={strength(passphrase)}
          error={errors.passphrase?.message}
          autoComplete="new-password"
          disabled={pending}
          {...register("passphrase")}
        />
        <PasswordField
          label="Passphrase again"
          error={errors.again?.message}
          autoComplete="new-password"
          disabled={pending}
          {...register("again")}
        />
      </Reveal>

      <Reveal className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onBack} disabled={pending}>
          Back
        </Button>
        <Button variant="primary" type="submit" pending={pending}>
          {pending ? "Creating…" : "Create profile"}
        </Button>
      </Reveal>
    </form>
  );
}
