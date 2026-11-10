import { useState } from "react";

import { TextInput, View, type TextInputProps } from "react-native";
import { useCSSVariable } from "uniwind";

import { cn } from "../styling/class-names.ts";
import { Text } from "../styling/text.tsx";

export type TextFieldProps = TextInputProps & {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  /** JetBrains Mono, for addresses, aliases, codes and amounts. */
  mono?: boolean | undefined;
  className?: string | undefined;
};

/** Page 25's field for touch: label, a 44 pt input, then the hint or the error. */
export function TextField({
  label,
  hint,
  error,
  mono,
  editable = true,
  className,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  // Placeholder colour is a prop, not a style, so it is read from the theme.
  const placeholder = useCSSVariable("--color-fg-subtle");

  return (
    <View className={cn("gap-1.5", className)}>
      <Text className={cn("type-label-m", !editable && "text-fg-disabled")}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        editable={editable}
        placeholderTextColor={typeof placeholder === "string" ? placeholder : undefined}
        autoCapitalize={mono ? "none" : undefined}
        autoCorrect={mono ? false : undefined}
        spellCheck={mono ? false : undefined}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        className={cn(
          "h-11 rounded-md border border-line bg-surface px-3 text-fg",
          mono ? "type-mono-m" : "type-body-m",
          focused && "border-accent",
          error && "border-danger",
          !editable && "bg-sunken text-fg-disabled",
        )}
        {...props}
      />
      {error ? (
        <Text className="type-caption text-danger">{error}</Text>
      ) : hint ? (
        <Text className="type-caption text-fg-subtle">{hint}</Text>
      ) : null}
    </View>
  );
}
