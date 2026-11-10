import type { ReactNode } from "react";

import { Field as BaseField } from "@base-ui/react/field";

import { cn } from "../styling/class-names.ts";

export type FieldProps = {
  label: ReactNode;
  /** Help under the control (page 25's hint line). Replaced by `error` when there is one. */
  hint?: ReactNode | undefined;
  error?: ReactNode | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
  children: ReactNode;
};

/** A labelled control with its hint or error, wired so the label and messages describe the control. */
export function Field({ label, hint, error, disabled, className, children }: FieldProps) {
  const invalid = Boolean(error);

  return (
    <BaseField.Root
      invalid={invalid}
      disabled={disabled}
      className={cn("flex flex-col gap-1.5", className)}
    >
      <BaseField.Label className="type-label-m text-fg data-[disabled]:text-fg-disabled">
        {label}
      </BaseField.Label>
      {children}
      {invalid ? (
        <BaseField.Error match className="type-caption text-danger">
          {error}
        </BaseField.Error>
      ) : hint ? (
        <BaseField.Description className="type-caption text-fg-subtle">
          {hint}
        </BaseField.Description>
      ) : null}
    </BaseField.Root>
  );
}
