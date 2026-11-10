# @ome-labs/ui-web

The kit's components (Figma pages 24–40) for React DOM, used by the website and the desktop app. Built on
[Base UI](https://base-ui.com) primitives, styled with Tailwind 4 and the `@ome-labs/tokens` theme, with Motion for
the dither dissolve and Sonner for toasts.

## Use

```css
/* the app's Tailwind entry */
@import "@ome-labs/ui-web/styles.css";
```

```tsx
import { ThemeProvider, Toaster, TooltipProvider, StatusBadge, Amount } from "@ome-labs/ui-web";

<ThemeProvider initial="system">
  <TooltipProvider>
    <StatusBadge kind="proposal" status={proposal.status} />
    <Amount amount={balance} token={token} />
    <Toaster />
  </TooltipProvider>
</ThemeProvider>;
```

`styles.css` brings Tailwind, the token theme and the brand fonts, and tells Tailwind to scan these components.
Dark mode follows `data-theme` on `<html>` (set by `ThemeProvider`), or the system setting when it is absent.

## What's here

Folders mirror the Figma pages:

| Folder        | Components                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `actions/`    | `Button` (primary, secondary, ghost, danger × sm, md, lg), `IconButton`                                               |
| `forms/`      | `Field`, `TextField` / `TextInput` (sans or mono), `Select`, `Checkbox`, `RadioGroup`, `Switch`, `SegmentedControl`   |
| `navigation/` | `SidebarItem`, `Tabs`, `FilterChip`, `Kbd` / `KbdCombo` (keycaps)                                                     |
| `status/`     | `StatusBadge` (proposal, service, step, connection), `Tag`                                                            |
| `identity/`   | `MemberAvatar`, `TokenMonogram`                                                                                       |
| `values/`     | `Address` (with the "alias, unverified" marker), `Hash`, `Amount`, `CopyButton`                                       |
| `thresholds/` | `ThresholdChip`, `VoteProgress`, `HealthMeter`                                                                        |
| `steps/`      | `StepRow`, `StepList`                                                                                                 |
| `review/`     | `CheckRow`, `ReviewPanel`                                                                                             |
| `codes/`      | `CodeBox`, `QrCode`                                                                                                   |
| `feedback/`   | `Banner` (alarm, warning, info, success), `Toaster` and `toast`                                                       |
| `overlays/`   | `Dialog`, `Sheet`, `TypeToConfirm`, `UnlockSheet`, `CommandMenu` (⌘K, bound by the app), `Menu`, `Popover`, `Tooltip` |
| `data/`       | `Table` parts, `ProposalRow` / `ProposalTable`, `ActivityRow`                                                         |
| `surfaces/`   | `Card`, `CardHeader`, `DetailRow`, `EmptyState`, `Scene` (the dither dissolve)                                        |
| `shell/`      | `AppShell`, `PageHeader`, `TopBar`, `Sidebar`, `SidebarGroup`, `VaultSwitcher`, `StatusChip`                          |
| `styling/`    | `cn` (clsx + tailwind-merge), `ThemeProvider`, the tone → class map                                                   |

Components take data in `@ome-labs/api` and `@ome-labs/format` shapes (`StatusBadge` takes a `ProposalStatus`,
`Amount` takes `{ amount, token }`, `HealthMeter` takes `readingHealth(…)`), so a screen can't show a status in the
wrong colour or a rounded amount.

## The kit

```sh
pnpm kit   # http://localhost:3001
```

The kit app ([`apps/kit`](../../apps/kit)) shows every component with each variant and state, in light, dark or both
side by side, with the code for each example, using the guide's sample data (Alice, Bob and Carol; Treasury; OMET;
proposals `3eb2`, `335c`, `868c`).

## Tests

`pnpm test` runs:

- behaviour tests (`tests/controls.test.tsx`): keyboard activation, dialog focus and Escape, copy buttons,
  type-to-confirm, `Amount` never rounding, a failed review check disabling Approve;
- the command menu and unlock sheet (`tests/command-and-unlock.test.tsx`): filtering on every word, arrow keys
  wrapping and Enter running the active command, the passphrase submitted with the chosen duration, Unlock off
  until a passphrase is typed, Touch ID, and durations above the ceiling left out;
- an axe check over one representative render per component domain (`tests/axe.test.tsx`), including disabled and
  invalid controls, every proposal status, a failed review check and an open dialog, with colour contrast left to
  the tokens package, whose tests compute it (jsdom can't).

## Notes

- The components follow shadcn/ui's shape (copy-in, owned here, `cn`, `cva` variants) on Base UI, but they were
  written by hand against the Figma kit rather than generated with the shadcn CLI, which needs network access to
  its registry. None keeps shadcn's default look.
- Motion follows page 18: 120 ms for hover and press, 200 ms for menus and tooltips, 320 ms for dialogs and sheets,
  and `prefers-reduced-motion` turns transitions off (the tokens' stylesheet) and swaps scenes without the dissolve.
  The command menu is the exception: it opens and closes instantly, because it is reached for from the keyboard.
- Icons come from `@ome-labs/icons`, the logo, fonts and art from `@ome-labs/brand`.
