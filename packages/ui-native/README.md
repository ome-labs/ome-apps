# @ome-labs/ui-native

The kit's components for React Native, for the phone app: a signing device, so the review panel, vote progress,
codes and QR, steps and the unlock flow come first. Same domain folders, names and props as
[`@ome-labs/ui-web`](../ui-web) where the platforms allow, so a screen reads the same on both.

## Stack

- **[Uniwind](https://uniwind.dev)** for Tailwind 4 classes on React Native, reading `@ome-labs/tokens/theme.native.css`.
  Uniwind 1.13 supports React Native 0.81 and later, so it covers Expo SDK 58 (React Native 0.88); NativeWind wasn't
  needed.
- **[RN Primitives](https://rnprimitives.com)** (switch, checkbox, toggle group, dialog, portal) in the shape React
  Native Reusables uses: components are copied in and owned here, restyled to the kit.
- **Reanimated** for the switch and the active step, **react-native-svg** for icons, the logo and QR codes,
  **@gorhom/bottom-sheet** for sheets, **FlashList** for long lists, **sonner-native** for toasts.

## Use

The app sets up Uniwind once:

```css
/* global.css, the Uniwind entry */
@import "tailwindcss";
@import "uniwind";
@import "@ome-labs/tokens/theme.native.css";
@source "../../packages/ui-native/src";
```

```js
// metro.config.js
module.exports = withUniwindConfig(getDefaultConfig(__dirname), { cssEntryFile: "./global.css" });
```

At the root: `GestureHandlerRootView`, `SafeAreaProvider`, `BottomSheetModalProvider`, a `PortalHost` (for
`Dialog`) and one `Toaster`. Load the brand fonts with `useFonts(fontFiles)` from `@ome-labs/brand/native` before
rendering: the type styles name the font files.

```tsx
import { Amount, ReviewPanel, setTheme } from "@ome-labs/ui-native";

setTheme("system"); // or "light" / "dark"
```

## What's here

| Folder        | Components                                                                                |
| ------------- | ----------------------------------------------------------------------------------------- |
| `actions/`    | `Button` (primary, secondary, ghost, danger × md, lg), `IconButton`                       |
| `forms/`      | `TextField` (sans or mono), `Switch`, `Checkbox`, `SegmentedControl`                      |
| `status/`     | `StatusBadge` (proposal, service, step, connection), `Tag`                                |
| `identity/`   | `MemberAvatar`, `TokenMonogram`                                                           |
| `values/`     | `Address` (with the "alias, unverified" marker), `Hash`, `Amount`, `CopyButton`           |
| `thresholds/` | `ThresholdChip`, `VoteProgress`, `HealthMeter`                                            |
| `steps/`      | `StepRow`, `StepList`                                                                     |
| `review/`     | `CheckRow`, `ReviewPanel`                                                                 |
| `codes/`      | `CodeBox`, `QrCode`                                                                       |
| `feedback/`   | `Banner`, `Toaster` and `toast`                                                           |
| `overlays/`   | `Dialog`, `Sheet` (bottom sheet), `TypeToConfirm`                                         |
| `data/`       | `ProposalRow`, `ProposalList` (FlashList), `ActivityRow`                                  |
| `surfaces/`   | `Card`, `CardHeader`, `DetailRow`, `EmptyState`                                           |
| `styling/`    | `cn`, `Text` and `TextClassContext`, `setTheme`, `useResolvedTheme`, the tone → class map |

## How it differs from the web kit

- **Touch targets.** Every control is at least 44 pt: buttons are 44 or 48 tall rather than the desktop's 28–40, and
  icon buttons put a 20 pt icon in a 44 pt square.
- **No hover.** Short values (`0x103b…c2c0`) expand to the full value on tap instead of a tooltip.
- **Text is explicit.** React Native doesn't inherit text styles, so every string goes through `Text`, and controls
  pass their label style down through `TextClassContext`.
- **Skipped:** the desktop shell (top bar, sidebar, vault switcher), wide tables, tabs, select, radio group, menu,
  popover, tooltip, and the dither-dissolve `Scene`. **Added:** `Sheet` and the FlashList `ProposalList`.

## Tests

`pnpm test` runs Jest with `jest-expo` and React Native Testing Library: presses and disabled buttons, `Amount` never
rounding, copying, type-to-confirm, and a failed review check disabling Approve. Jest can't run the gesture-handler and
bottom-sheet runtime, so the tests import the components they exercise directly; see `jest.config.ts` for the
pnpm-aware transform list and the asset mapping.
