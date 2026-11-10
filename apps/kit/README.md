# Ome Kit (`apps/kit`)

A small Expo Router app whose only job is to show every `@ome-labs/ui-native` component and state, in light and dark,
with the UI guide's sample data (Alice, Bob and Carol; Treasury; OMET; proposals `3eb2`, `335c`, `868c`). It will
become a hidden developer screen of the real phone app.

## Run it

It runs as a development build (`expo-dev-client`), so build it once for a simulator or device:

```sh
pnpm install
pnpm --filter @ome-labs/kit ios       # or: android
pnpm kit                              # later: start Metro for the installed build
```

The home screen switches the theme (system, light, dark) and lists the sections:

| Section               | Shows                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Review and signing    | the review panel in a bottom sheet, checks, the execution steps, a QR code and a code box        |
| Values and statuses   | every status pill, avatars and monograms, addresses (tap to expand), amounts, thresholds, health |
| Lists                 | proposal rows and activity rows                                                                  |
| Actions               | buttons and icon buttons, enabled and disabled                                                   |
| Forms                 | text fields (normal, error, secure, read-only), switches, a checkbox, the segmented control      |
| Feedback and surfaces | banners, a toast, the typed confirmation, a card, an empty state                                 |

## Setup worth knowing

- `global.css` is Uniwind's entry: Tailwind, Uniwind, the token theme, and `@source` lines so the classes used in
  `packages/ui-native` are generated.
- `metro.config.js` wraps Expo's config with `withUniwindConfig`; it is the one CommonJS file, because Metro loads
  its config with `require()`.
- `app/_layout.tsx` loads the brand fonts before anything renders, and mounts the gesture, safe-area, bottom-sheet,
  portal and toast providers the components need.
- The app icon is the Testnet icon from `@ome-labs/brand`, so the kit is never mistaken for the real app.
