/**
 * The kit's elevation on native, as class names.
 *
 * The tokens declare `--shadow-*` inside Uniwind's `@variant light` / `@variant dark` blocks so shadows follow the
 * theme. Uniwind 1.13 registers every variant variable in `@theme` as `unset`, and Tailwind's `shadow-*` utility
 * inlines that theme value instead of referencing the variable, so `shadow-1` compiles to `box-shadow: unset` and
 * draws nothing (checked against Uniwind 1.13.2's compiler output). An arbitrary `box-shadow` property keeps the
 * `var()` reference, which Uniwind resolves for the current theme and hands to React Native's `boxShadow` (inset and
 * several layers, both platforms on the New Architecture). Each class is written out in full so Tailwind's scanner
 * finds it in this file.
 *
 * `card`…`dialog`, `control` and `accent` already carry a 1 px ring, so surfaces that use them drop their border.
 */
export const depth = {
  /** Cards, panels, empty-state scenes, chips. */
  card: "[box-shadow:var(--shadow-1)]",
  /** Toasts and sticky bars. */
  toast: "[box-shadow:var(--shadow-3)]",
  /** Dialogs and sheets. */
  dialog: "[box-shadow:var(--shadow-4)]",
  /** Secondary controls and raised thumbs. */
  control: "[box-shadow:var(--shadow-control)]",
  /** Controls filled with a solid colour: a lit top edge, a darker rim and a short drop. */
  accent: "[box-shadow:var(--shadow-accent)]",
  /** Swaps a control's shadow for an inset one while a finger holds it (Uniwind's `active:` is Pressable's pressed). */
  pressed: "active:[box-shadow:var(--shadow-pressed)]",
  /** Wells: inputs, code boxes, tracks. */
  field: "[box-shadow:var(--shadow-field)]",
} as const;

/**
 * A soft bevel for small filled discs (avatars, monograms, activity icons): light catching the top edge and a shade
 * along the bottom, so a flat circle reads as a pressed token. Fixed rather than themed because it only shifts the
 * disc's own fill, and a style rather than a class so the rgba values reach React Native untouched.
 */
export const discBevel = {
  boxShadow:
    "inset 0px 1px 0px 0px rgba(255, 255, 255, 0.18), inset 0px -1px 1px 0px rgba(16, 24, 48, 0.12)",
} as const;
