# @ome-labs/tokens

Every design value of the Ome kit in one place: colours (light and dark), type, spacing, radii,
elevation, control heights, motion and layout. The source is W3C Design Tokens (DTCG) JSON in
[`tokens/`](tokens); `pnpm build` generates the CSS and TypeScript the apps use.

## Use

Web (Tailwind 4), in the app's stylesheet:

```css
@import "tailwindcss";
@import "@ome-labs/tokens/theme.web.css";
```

React Native (Uniwind), in the app's `global.css`:

```css
@import "tailwindcss";
@import "uniwind";
@import "@ome-labs/tokens/theme.native.css";
```

Both expose the same utility names, so a class reads the same on both platforms:

| Role                        | Utilities                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Backgrounds                 | `bg-canvas` `bg-surface` `bg-raised` `bg-sunken` `bg-hover` `bg-selected`          |
| Text                        | `text-fg` `text-fg-muted` `text-fg-subtle` `text-fg-disabled` `text-fg-inverse`    |
| Borders                     | `border-line-subtle` `border-line` `border-line-strong`                            |
| Accent                      | `bg-accent` `bg-accent-hover` `bg-accent-subtle` `text-accent-fg` `text-on-accent` |
| Status (text on its tint)   | `text-success` on `bg-success-subtle`, and `warning`, `danger`, `info`, `neutral`  |
| Text styles (Figma page 08) | `type-display-hero` … `type-numeric-m`: family, size, line height, tracking        |
| Sizes                       | `h-control-sm` (28) `h-control-md` (32) `h-control-lg` (40), `rounded-md`, …       |

The web theme switches on `data-theme="dark"` on any ancestor (the `dark:` variant follows it) and
falls back to the system setting until a theme is set. Uniwind switches with `Uniwind.setTheme`.
CSS custom properties keep the kit's code names (`--ome-text-primary`, Figma page 20).

Code that needs numbers (Motion and Reanimated durations, React Native shadows, layout constants):

```ts
import { tokens } from "@ome-labs/tokens";

tokens.motion.duration.base; // 200
tokens.shadow["3"].native; // { shadowColor, shadowOpacity, shadowRadius, shadowOffset, elevation }
tokens.layout.app.sidebar; // 240
```

## Change a token

1. Edit the JSON in `tokens/` to match Figma (pages 06–08, 18, 20–22). Semantic colours keep their
   light value in `$value` and their dark value and utility name in `$extensions["network.ome"]`.
2. `pnpm --filter @ome-labs/tokens build`.
3. `pnpm --filter @ome-labs/tokens test`, and review the snapshot diff: it shows exactly what changed
   in the generated CSS and object (`vitest run -u` accepts it).

The JSON was transcribed from the Figma kit's variables (Primitives, Dimensions, Theme · Light,
Theme · Dark), text styles and effect styles. The file is on Figma's Starter plan, where the Variables
REST API isn't available, so there is no automatic extraction script.

## Tests

- every semantic colour resolves in both themes and has a unique utility name;
- text roles meet AA (4.5:1) on their surfaces and status tints in both themes (Figma pages 07, 23);
- snapshots of the web CSS, the native CSS and the TypeScript object.
