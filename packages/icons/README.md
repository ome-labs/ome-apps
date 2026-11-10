# @ome-labs/icons

The kit's 85 icons (Figma page 11), drawn by [Hugeicons](https://hugeicons.com) and named for what they mean in Ome.
Apps import icons only from here; oxlint rejects direct `@hugeicons/*` imports elsewhere, so swapping an icon is a
one-line change in `src/registry.ts`.

## Use

```tsx
import { Icon } from "@ome-labs/icons/web"; // or "@ome-labs/icons/native"

<Icon name="vault" />                       // 20 px, decorative, takes the text colour
<Icon name="alert-triangle" tone="warning" label="Needs attention" size={16} />
```

| Prop    | Values                                                                 | Default                           |
| ------- | ---------------------------------------------------------------------- | --------------------------------- |
| `name`  | an `IconName` (see `iconNames`)                                        | required                          |
| `size`  | `16` dense rows · `20` interface · `24` headers · `32` feature moments | `20`                              |
| `tone`  | any colour role from `@ome-labs/tokens`                                | web: `currentColor`; native: `fg` |
| `label` | accessible name; omit for a decorative icon                            | none (hidden from assistive tech) |

Every icon draws with the kit's 1.5 stroke on the 24 grid; the stroke isn't a prop.

- **Web** colours through the token's CSS custom property, so it follows the active theme without re-rendering.
- **Native** reads the colour from the Uniwind theme (`useCSSVariable`), because React Native has no `currentColor`.
  Pass `color` for an icon sitting on art or inside a control that already chose its colour.

## Adding an icon

Add it to Figma page 11 first, then map the Ome name to a Hugeicons free-set export in `src/registry.ts`. The test
checks that every name renders and that no two names share an icon.
