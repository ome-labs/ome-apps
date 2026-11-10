import type { ReactNode } from "react";

import { cn } from "../styling/class-names.ts";

// Screen readers read some modifier glyphs as their Unicode names ("place of interest sign" for ⌘), so the
// glyph is shown and the key's name is read instead.
const spokenNames: Record<string, string> = {
  "⌘": "Command",
  "⇧": "Shift",
  "⌥": "Option",
  "⌃": "Control",
  "↵": "Enter",
  "⏎": "Enter",
  "⌫": "Delete",
  "⎋": "Escape",
  "↑": "Up arrow",
  "↓": "Down arrow",
  "←": "Left arrow",
  "→": "Right arrow",
};

export type KbdProps = {
  children: ReactNode;
  className?: string | undefined;
};

/**
 * One key, drawn as a small raised keycap: the control ring and drop of a secondary button, so it reads as
 * something pressable rather than a tag. Sans rather than mono: neither Inter nor JetBrains Mono has ⌘ or ⌥,
 * and the system glyphs they fall back to sit better beside Inter's letters.
 */
export function Kbd({ children, className }: KbdProps) {
  const spoken = typeof children === "string" ? spokenNames[children] : undefined;

  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 select-none items-center justify-center rounded-[5px] px-1",
        "bg-raised bg-linear-to-b from-brand-white/0 to-canvas/60 font-sans type-label-s text-fg-muted shadow-control",
        className,
      )}
    >
      {spoken ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span className="sr-only">{spoken}</span>
        </>
      ) : (
        children
      )}
    </kbd>
  );
}

export type KbdComboProps = {
  /** In the order they are pressed, such as `["⌘", "K"]`. */
  keys: string[];
  className?: string | undefined;
};

/** A shortcut of several keys. Nested `<kbd>`s are HTML's own way of writing a key combination. */
export function KbdCombo({ keys, className }: KbdComboProps) {
  // A combo can repeat a key (⌘ ⌘), so each is keyed by where it sits as well as what it is.
  const caps = keys.map((key, position) => ({ key, id: `${position}-${key}` }));

  return (
    <kbd className={cn("inline-flex shrink-0 items-center gap-0.5", className)}>
      {caps.map(({ key, id }) => (
        <Kbd key={id}>{key}</Kbd>
      ))}
    </kbd>
  );
}
