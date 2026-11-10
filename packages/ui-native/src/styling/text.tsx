import { createContext, use } from "react";

import { Text as NativeText, type TextProps as NativeTextProps } from "react-native";

import { cn } from "./class-names.ts";

/**
 * React Native doesn't inherit text styles from a parent View, so a control that wants its label in a given
 * style (a button's `on-accent` label) says so through this context, as React Native Reusables does.
 */
export const TextClassContext = createContext<string | undefined>(undefined);

export type TextProps = NativeTextProps & { className?: string | undefined };

/** Text in the kit's body style and colour unless told otherwise. Every string on screen goes through it. */
export function Text({ className, ...props }: TextProps) {
  const inherited = use(TextClassContext);

  return <NativeText className={cn("type-body-m text-fg", inherited, className)} {...props} />;
}
