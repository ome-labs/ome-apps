import { useState } from "react";

import { Icon } from "@ome-labs/icons/web";

import { cn } from "../styling/class-names.ts";
import { Field } from "./field.tsx";
import { TextInput, type TextFieldProps } from "./text-field.tsx";

export type PasswordFieldProps = Omit<TextFieldProps, "type" | "mono">;

/**
 * A labelled passphrase input with an eye to show what was typed. It starts hidden every time it mounts, and the
 * toggle stays out of the tab order's way after the input (it never takes focus from typing).
 */
export function PasswordField({
  label,
  hint,
  error,
  disabled,
  className,
  ...props
}: PasswordFieldProps) {
  const [shown, setShown] = useState(false);

  return (
    <Field label={label} hint={hint} error={error} disabled={disabled} className={className}>
      <div className="relative">
        <TextInput
          type={shown ? "text" : "password"}
          disabled={disabled}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="pr-10"
          {...props}
        />
        <button
          type="button"
          aria-label={shown ? "Hide passphrase" : "Show passphrase"}
          aria-pressed={shown}
          disabled={disabled}
          onClick={() => setShown((value) => !value)}
          className={cn(
            "focus-ring absolute inset-y-0 right-1 my-auto grid size-8 place-items-center rounded-sm text-fg-subtle",
            "transition-[color] duration-fast ease-standard hover:text-fg disabled:pointer-events-none",
          )}
        >
          <Icon name={shown ? "eye-off" : "eye"} size={16} />
        </button>
      </div>
    </Field>
  );
}
