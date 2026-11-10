import type { ComponentProps } from "react";

import { Input } from "@base-ui/react/input";

import { cn } from "../styling/class-names.ts";
import { Field } from "./field.tsx";

export type TextInputProps = ComponentProps<typeof Input> & {
  /** JetBrains Mono, for addresses, aliases, codes and amounts: anything compared character by character. */
  mono?: boolean | undefined;
};

/** The input of page 25. Put it inside a `Field` for its label, hint and error. */
export function TextInput({ mono, className, ...props }: TextInputProps) {
  return (
    <Input
      className={cn(
        // A field is a well cut into the surface, the opposite of a raised button.
        "h-control-md w-full rounded-md border border-line bg-surface px-2.5 text-fg shadow-field placeholder:text-fg-subtle",
        "outline-none transition-[border-color,box-shadow] duration-fast ease-standard hover:border-line-strong",
        "focus:border-accent focus:shadow-focus",
        "data-[invalid]:border-danger data-[invalid]:focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-danger)_25%,transparent)] data-[disabled]:cursor-not-allowed data-[disabled]:border-line data-[disabled]:bg-sunken data-[disabled]:text-fg-disabled data-[disabled]:shadow-none",
        mono ? "type-mono-m" : "type-body-s",
        className,
      )}
      spellCheck={mono ? false : undefined}
      autoCapitalize={mono ? "off" : undefined}
      autoCorrect={mono ? "off" : undefined}
      {...props}
    />
  );
}

export type TextFieldProps = Omit<TextInputProps, "className"> & {
  className?: string | undefined;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
};

/** A labelled text input: the common case of `Field` around `TextInput`. */
export function TextField({ label, hint, error, disabled, className, ...props }: TextFieldProps) {
  return (
    <Field label={label} hint={hint} error={error} disabled={disabled} className={className}>
      <TextInput disabled={disabled} {...props} />
    </Field>
  );
}
