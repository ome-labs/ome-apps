# ome-apps

Everything people see of [Ome](https://ome.network): the website, the desktop app and the phone app (a signing
device), and the UI they share. Ome itself (the protocol, the member's daemon `omed`, the CLI and `@ome-labs/api`)
lives in [`ome-labs/ome`](https://github.com/ome-labs/ome).

This repo holds the shared foundations so far; the apps come next and build on them.

## Packages

| Package                                     | What it is                                                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [`@ome-labs/tokens`](packages/tokens)       | Design tokens: one DTCG JSON source → Tailwind 4 theme (web), Uniwind theme (native), typed TS object    |
| [`@ome-labs/brand`](packages/brand)         | Logo, app icons, favicons, fonts, textures, pixel objects, illustrations, with web and native components |
| [`@ome-labs/icons`](packages/icons)         | The kit's 85 Hugeicons under Ome names, for web and native                                               |
| [`@ome-labs/format`](packages/format)       | Amounts, addresses, times, thresholds, statuses and wording, as the UI guide writes them                 |
| [`@ome-labs/ui-web`](packages/ui-web)       | React DOM components on Base UI and Tailwind 4, with Storybook                                           |
| [`@ome-labs/ui-native`](packages/ui-native) | React Native components on RN Primitives and Uniwind                                                     |

```text
tokens ─┬─► ui-web ◄── icons, brand, format
        └─► ui-native ◄── icons, brand, format
format ──► @ome-labs/api (types only)
```

Every package is private; nothing here is published to npm.

## Sources of truth

- **The Figma brand kit** for everything visual: tokens (page 20), type and colour (06–08), motion (18), layout and
  accessibility (21–23), brand assets (02–05, 11–17) and components (24–40).
- **`ome/research/desktop/ui-guide.md`** and **`@ome-labs/api`** for data: what may be shown, the words to use, the
  number, address and time formats, and the sample data set.

When they disagree, Figma wins on visuals and the guide and API win on data.

## Getting started

Node 24 (see `.node-version`) and pnpm 12.

```sh
pnpm install
pnpm build        # generates the token theme and the brand components
pnpm storybook    # the web kit, http://localhost:6006
pnpm check        # format, lint, typecheck and test
```

## What isn't built yet

The foundations cover the kit's tokens, brand assets, icons and components. Compared with the Figma kit, these are
still missing or unverified:

- **Checked against Figma frame by frame.** The components follow the kit's source (sizes, colours, states and copy),
  and the stories were reviewed in light and dark, but they haven't been compared with each frame through the Figma
  MCP (`get_screenshot`) as the plan asks.
- **On a simulator or device.** `@ome-labs/ui-native` typechecks and its jest-expo tests pass, but no app shows it on a
  simulator or phone yet; the phone app will.
- **Web components:** the `Kbd` shortcut chips and the shortcut list of page 23, a command menu (⌘K), a dedicated
  `UnlockSheet` component (Storybook composes it from `Dialog`, a passphrase field and the segmented control), and the
  macOS window controls (the desktop app draws them natively).
- **Native components:** the desktop shell, tables, tabs, select, radio group, menu, popover, tooltip, and the
  dither-dissolve `Scene`.
- **Textures and pixel objects** ship in `@ome-labs/brand` with components, but no UI component uses them yet; they
  are for the website and marketing pages.
- **Pages:** the desktop pages (Figma's desktop screens), the website and the phone app's screens; they come next.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the code rules.
