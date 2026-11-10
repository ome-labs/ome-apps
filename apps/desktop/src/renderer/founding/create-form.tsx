import { useCallback, useMemo, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { type AvatarId, Scene } from "@ome-labs/brand/web";
import { Avatar, Banner, Button, NumberStepper, TextField } from "@ome-labs/ui-web";
import { type Control, useController, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { AvatarPicker } from "../avatars/avatar-picker.tsx";
import { VAULT_ART } from "../avatars/avatars.ts";
import { callOme } from "../data/ome.ts";
import { FlowPage } from "./flow-page.tsx";
import { rememberPicture, rememberPlanned } from "./planned.ts";
import { LIMITS } from "./thresholds.ts";

const schema = z
  .object({
    name: z.string().trim().min(1, "Name the vault.").max(48, "Use at most 48 characters."),
    members: z.number().int().min(LIMITS.members.min).max(LIMITS.members.max),
    approvals: z.number().int().min(LIMITS.approvals.min).max(LIMITS.approvals.max),
    read: z.number().int().min(LIMITS.read.min).max(LIMITS.read.max),
  })
  .refine((v) => v.approvals <= v.members && v.read <= v.members, {
    path: ["members"],
    message: "Thresholds can't be more than the members.",
  });
type Values = z.input<typeof schema>;
const DEFAULTS: Values = { name: "", members: 3, approvals: 2, read: 2 };

const NEXT = [
  { title: "Share the invite", text: "Send it to each co-founder." },
  { title: "Co-founders join", text: "You see them arrive, then start once all are in." },
  {
    title: "Found it together",
    text: "Everyone's Ome generates the shared key and the vault is deployed.",
  },
];

/** Stage 1 for the host: the vault's name and the thresholds it proposes. Opening the lobby makes the invite. */
export function CreateForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  // The vault has no address yet, so its default can't be the address-based one: pick one now and keep it.
  const [picture, setPicture] = useState<AvatarId>(
    () => (VAULT_ART[Math.floor(Math.random() * VAULT_ART.length)] as { id: AvatarId }).id,
  );
  const [picking, setPicking] = useState(false);
  const openPicker = useCallback(() => setPicking(true), []);
  const source = useMemo(() => ({ kind: "art" as const, id: picture }), [picture]);
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });

  const submit = useMemo(
    () =>
      handleSubmit(async (values) => {
        setError(undefined);
        try {
          const lobby = await callOme("lobby.create", {
            name: values.name.trim(),
            threshold: values.approvals,
            viewingThreshold: values.read,
          });
          rememberPlanned(lobby.lobby, values.members);
          rememberPicture(lobby.lobby, picture);
          await navigate({ to: "/create", search: { lobby: lobby.lobby } });
        } catch (failure) {
          setError(failure instanceof Error ? failure.message : String(failure));
        }
      }),
    [handleSubmit, navigate, picture],
  );
  const cancel = useCallback(() => void navigate({ to: "/home" }), [navigate]);
  const members = useWatch({ control, name: "members" });
  const name = useWatch({ control, name: "name" });
  // Fewer members pulls the thresholds down with it, so the form never holds an impossible vault.
  const setMembers = useCallback(
    (next: number) => {
      setValue("members", next);
      if (getValues("approvals") > next) setValue("approvals", next);
      if (getValues("read") > next) setValue("read", next);
    },
    [getValues, setValue],
  );

  return (
    <FlowPage
      title="Create a vault"
      lead="You host the lobby. Co-founders join with your invite, then everyone founds the vault together."
    >
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-[minmax(0,1fr)_340px]">
        <form className="flex flex-col rounded-lg bg-surface shadow-1" onSubmit={submit} noValidate>
          <div className="flex flex-col gap-3 border-b border-line-subtle p-6">
            {error ? <Banner kind="alarm">{error}</Banner> : null}
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={openPicker}
                disabled={isSubmitting}
                aria-label="Choose the vault's picture"
                className="focus-ring mt-[22px] rounded-md transition-opacity duration-fast ease-standard hover:opacity-80"
              >
                <Avatar name={name || "?"} source={source} shape="square" size={48} />
              </button>
              <TextField
                label="Vault name"
                className="flex-1"
                placeholder="Treasury"
                error={errors.name?.message}
                maxLength={48}
                disabled={isSubmitting}
                {...register("name")}
              />
            </div>
            <AvatarPicker
              kind="vault"
              name={name || "?"}
              open={picking}
              onOpenChange={setPicking}
              selected={picture}
              onPick={setPicture}
            />
          </div>

          <ThresholdRow title="Members" text="How many people the vault is for, you included.">
            <NumberStepper
              aria-label="Members"
              value={members}
              onValueChange={setMembers}
              min={LIMITS.members.min}
              max={LIMITS.members.max}
            />
          </ThresholdRow>
          <ThresholdRow title="Approvals to spend" text="How many members must approve a payment.">
            <StepperField
              control={control}
              name="approvals"
              label="Approvals to spend"
              max={members}
            />
          </ThresholdRow>
          <ThresholdRow
            title="Members to read"
            text="How many members' keepers must answer to read balances."
          >
            <StepperField control={control} name="read" label="Members to read" max={members} />
          </ThresholdRow>

          <div className="flex items-center justify-end gap-2 px-6 py-4">
            <Button variant="ghost" onClick={cancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" pending={isSubmitting}>
              {isSubmitting ? "Opening…" : "Open lobby"}
            </Button>
          </div>
        </form>

        <aside className="flex flex-col gap-5 rounded-lg bg-surface p-5 shadow-1">
          <Scene
            id="create-vault"
            alt=""
            className="aspect-[16/10] w-full rounded-md object-cover"
          />
          <div className="flex flex-col gap-3">
            <span className="type-label-m text-fg">What happens next</span>
            <ol className="flex flex-col gap-3">
              {NEXT.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sunken type-label-s text-fg-muted">
                    {index + 1}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="type-label-m text-fg">{step.title}</span>
                    <span className="type-body-s text-fg-muted">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </FlowPage>
  );
}

function ThresholdRow({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-line-subtle px-6 py-5">
      <div className="flex flex-col gap-0.5">
        <span className="type-label-m text-fg">{title}</span>
        <span className="type-body-s text-fg-muted">{text}</span>
      </div>
      {children}
    </div>
  );
}

function StepperField({
  control,
  name,
  label,
  max,
}: {
  control: Control<Values>;
  name: "approvals" | "read";
  label: string;
  max: number;
}) {
  const { field } = useController({ control, name });
  return (
    <NumberStepper
      aria-label={label}
      value={field.value}
      onValueChange={field.onChange}
      min={LIMITS[name].min}
      max={Math.min(LIMITS[name].max, max)}
    />
  );
}
