import { useCallback, useMemo, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { Illustration } from "@ome-labs/brand/web";
import { Banner, Button, NumberStepper, TextField, cn } from "@ome-labs/ui-web";
import { type Control, useController, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { callOme } from "../data/ome.ts";
import { FlowPage } from "./stages.tsx";
import { LIMITS, PRESETS } from "./thresholds.ts";

const schema = z.object({
  name: z.string().trim().min(1, "Name the vault.").max(48, "Use at most 48 characters."),
  approvals: z.number().int().min(LIMITS.approvals.min).max(LIMITS.approvals.max),
  read: z.number().int().min(LIMITS.read.min).max(LIMITS.read.max),
});
type Values = z.input<typeof schema>;
const DEFAULTS: Values = { name: "", approvals: 2, read: 2 };

const NEXT = [
  { title: "Share the invite", text: "Send it to each co-founder." },
  { title: "Co-founders join", text: "You see them arrive, then set the final thresholds." },
  {
    title: "Found it together",
    text: "Everyone's Ome generates the shared key and the vault is deployed.",
  },
];

/** Stage 1 for the host: the vault's name and the thresholds it proposes. Opening the lobby makes the invite. */
export function CreateForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });
  const [approvals, read] = useWatch({ control, name: ["approvals", "read"] });

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
          await navigate({ to: "/create", search: { lobby: lobby.lobby } });
        } catch (failure) {
          setError(failure instanceof Error ? failure.message : String(failure));
        }
      }),
    [handleSubmit, navigate],
  );
  const cancel = useCallback(() => void navigate({ to: "/home" }), [navigate]);
  const apply = useCallback(
    (preset: (typeof PRESETS)[number]) => {
      setValue("approvals", preset.approvals);
      setValue("read", preset.read);
    },
    [setValue],
  );

  return (
    <FlowPage
      stage="details"
      title="Create a vault"
      lead="You host the lobby. Co-founders join with your invite, then everyone founds the vault together."
    >
      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-[minmax(0,1fr)_340px]">
        <form className="flex flex-col rounded-lg bg-surface shadow-1" onSubmit={submit} noValidate>
          <div className="flex flex-col gap-1 border-b border-line-subtle p-6">
            {error ? <Banner kind="alarm">{error}</Banner> : null}
            <TextField
              label="Vault name"
              placeholder="Treasury"
              error={errors.name?.message}
              maxLength={48}
              disabled={isSubmitting}
              {...register("name")}
            />
          </div>

          <ThresholdRow title="Approvals to spend" text="How many members must approve a payment.">
            <StepperField control={control} name="approvals" label="Approvals to spend" />
          </ThresholdRow>
          <ThresholdRow
            title="Members to read"
            text="How many members' keepers must answer to read balances."
          >
            <StepperField control={control} name="read" label="Members to read" />
          </ThresholdRow>

          <div className="flex flex-col gap-3 border-b border-line-subtle px-6 py-5">
            <span className="type-label-m text-fg">Common shapes</span>
            <div className="grid grid-cols-2 gap-3">
              {PRESETS.map((preset) => (
                <Preset
                  key={preset.members}
                  preset={preset}
                  selected={preset.approvals === approvals && preset.read === read}
                  onPick={apply}
                />
              ))}
            </div>
            <p className="type-caption text-fg-subtle">
              The final numbers are set in the lobby, once you know how many have joined.
            </p>
          </div>

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
          <Illustration
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

function Preset({
  preset,
  selected,
  onPick,
}: {
  preset: (typeof PRESETS)[number];
  selected: boolean;
  onPick: (preset: (typeof PRESETS)[number]) => void;
}) {
  const pick = useCallback(() => onPick(preset), [onPick, preset]);
  return (
    <button
      type="button"
      onClick={pick}
      aria-pressed={selected}
      className={cn(
        "focus-ring flex flex-col gap-1 rounded-md px-4 py-3 text-left transition-[background-color,box-shadow] duration-fast ease-standard",
        selected
          ? "bg-accent-subtle shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-accent-fg)_30%,transparent)]"
          : "bg-sunken shadow-field hover:bg-hover",
      )}
    >
      <span className={cn("type-label-m", selected ? "text-accent-fg" : "text-fg")}>
        {preset.members} members
      </span>
      <span className="type-body-s text-fg-muted">
        {preset.approvals} to approve · {preset.read} to read
      </span>
      <span className="type-caption text-fg-subtle">{preset.survives}</span>
    </button>
  );
}

function StepperField({
  control,
  name,
  label,
}: {
  control: Control<Values>;
  name: "approvals" | "read";
  label: string;
}) {
  const { field } = useController({ control, name });
  return (
    <NumberStepper
      aria-label={label}
      value={field.value}
      onValueChange={field.onChange}
      {...LIMITS[name]}
    />
  );
}
