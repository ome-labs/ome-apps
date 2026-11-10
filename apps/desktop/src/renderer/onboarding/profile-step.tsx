import { useCallback, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import type { NodeStatus } from "@ome-labs/api";
import type { AvatarId } from "@ome-labs/brand/web";
import { Avatar, Banner, Button, SegmentedControl, TextField } from "@ome-labs/ui-web";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { AvatarPicker } from "../avatars/avatar-picker.tsx";
import { defaultProfileArt } from "../avatars/avatars.ts";
import { unwrap } from "../data/session.ts";
import { StepHeading } from "./layout.tsx";
import { Reveal } from "./motion.tsx";
import { LOCAL_NODE, NETWORK_OPTIONS, NODE_URLS, type NetworkChoice, nodeFix } from "./networks.ts";

export interface ProfileDraft {
  member: string;
  nodeUrl: string;
  /** Picked here, saved once the profile exists; none means the default for the name. */
  picture?: AvatarId | undefined;
}

const schema = z.object({
  member: z.string().trim().min(1, "Enter your name.").max(48, "Use at most 48 characters."),
  network: z.enum(["testnet", "local"]),
});

type Values = z.input<typeof schema>;

/** Testnet first: it's where real vaults live. Coming back from step 2 keeps what was chosen. */
function defaultsFrom(draft: ProfileDraft | undefined): Values {
  return {
    member: draft?.member ?? "",
    network: draft?.nodeUrl === LOCAL_NODE ? "local" : "testnet",
  };
}

/**
 * Step 1: who the member is and which node their account lives on. Continuing starts a daemon for the new profile,
 * points it at the node and checks the node answers, as `ome init` does, before anything is created.
 */
export function ProfileStep({
  draft,
  position,
  onBack,
  onReady,
}: {
  draft: ProfileDraft | undefined;
  position: string;
  onBack: () => void;
  onReady: (draft: ProfileDraft) => void;
}) {
  const defaultValues = useMemo(() => defaultsFrom(draft), [draft]);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues });
  const [error, setError] = useState<string>();
  const [unreachable, setUnreachable] = useState<NodeStatus>();

  const network = useWatch({ control, name: "network" });
  const member = useWatch({ control, name: "member" });
  const [picture, setPicture] = useState<AvatarId | undefined>(draft?.picture);
  const [picking, setPicking] = useState(false);
  const openPicker = useCallback(() => setPicking(true), []);
  const shown = picture ?? defaultProfileArt(member.trim() || "member");
  const source = useMemo(() => ({ kind: "art" as const, id: shown }), [shown]);
  const pickNetwork = useCallback(
    (next: NetworkChoice) => setValue("network", next, { shouldValidate: false }),
    [setValue],
  );

  const submit = useMemo(
    () =>
      handleSubmit(async (values) => {
        setError(undefined);
        setUnreachable(undefined);
        try {
          const next = {
            member: values.member.trim(),
            nodeUrl: NODE_URLS[values.network],
            picture,
          };
          const node = await unwrap(
            window.ome.session.setup({ member: next.member, nodeUrl: next.nodeUrl }),
          );
          if (node.reachable) onReady(next);
          else setUnreachable(node);
        } catch (failure) {
          setError(failure instanceof Error ? failure.message : String(failure));
        }
      }),
    [handleSubmit, onReady, picture],
  );
  const retry = useCallback(() => void submit(), [submit]);
  const retryAction = useMemo(() => ({ label: "Try again", onClick: retry }), [retry]);
  const pending = isSubmitting;

  return (
    <form className="flex flex-col gap-6" onSubmit={submit} noValidate>
      <StepHeading step={position} title="Create your profile">
        One profile is one member on this computer. Ome starts a daemon for it that keeps your
        wallet and signing key.
      </StepHeading>

      {unreachable ? (
        <Reveal>
          <Banner kind="alarm" action={retryAction}>
            Can't reach the node at {unreachable.url}. {nodeFix(unreachable.url)}
          </Banner>
        </Reveal>
      ) : null}
      {error ? (
        <Reveal>
          <Banner kind="alarm">{error}</Banner>
        </Reveal>
      ) : null}

      <Reveal className="flex items-start gap-4">
        <button
          type="button"
          onClick={openPicker}
          disabled={pending}
          aria-label="Choose your picture"
          className="focus-ring mt-[22px] rounded-full transition-opacity duration-fast ease-standard hover:opacity-80"
        >
          <Avatar name={member || "?"} source={source} size={48} />
        </button>
        <TextField
          label="Your name"
          className="flex-1"
          error={errors.member?.message}
          maxLength={48}
          disabled={pending}
          {...register("member")}
        />
      </Reveal>
      <AvatarPicker
        kind="profile"
        name={member || "?"}
        open={picking}
        onOpenChange={setPicking}
        selected={shown}
        onPick={setPicture}
      />

      <Reveal className="flex flex-col gap-2">
        <span className="type-label-m text-fg">Network</span>
        <SegmentedControl
          aria-label="Network"
          options={NETWORK_OPTIONS}
          value={network}
          onValueChange={pickNetwork}
        />
        <span className="type-mono-s text-fg-subtle">{NODE_URLS[network]}</span>
      </Reveal>

      <Reveal className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onBack} disabled={pending}>
          Back
        </Button>
        <Button variant="primary" type="submit" pending={pending}>
          {pending ? "Starting…" : "Continue"}
        </Button>
      </Reveal>
    </form>
  );
}
