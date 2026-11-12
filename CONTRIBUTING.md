# Contributing

The rules follow [`ome/CONTRIBUTING.md`](https://github.com/ome-labs/ome/blob/main/CONTRIBUTING.md), adapted to a
TypeScript UI repo.

## Setup

- Node 24 (`.node-version`) and pnpm 12 (`packageManager` in `package.json`).
- `pnpm install` also installs the git hooks (lefthook): staged files are formatted and linted on commit, the message
  is checked by commitlint, and `pnpm check` runs before a push.
- `pnpm build` generates what other packages import: the token theme (`packages/tokens/dist`) and the brand
  components (`packages/brand/src/generated`). Turbo runs it before `typecheck`, `test` and `dev`.

## Workflow

- Commit after each coherent change with a [Conventional Commit](https://www.conventionalcommits.org/). Scopes:
  `desktop`, `landing`, `kit`, `tokens`, `brand`, `icons`, `format`, `ui-web`, `ui-native`, `repo`. Body lines are at most 100 characters.
- Run the narrowest check first (`pnpm --filter @ome-labs/format test`), then `pnpm check`, which formats, lints,
  typechecks and tests everything.
- Stop and ask before adding a dependency that duplicates one already chosen, changing a token value away from Figma,
  or showing data the UI guide forbids (fiat values, prices, token logos, ENS, fee amounts, seed phrases, mainnet).

## Code

- **One responsibility per file**, in domain-named folders (`values/amount.tsx`, `styling/class-names.ts`). No
  `utils`, `helpers`, `common`, `misc` or `shared`. A helper used by one component lives in that component's file.
- Files stay under roughly 400 lines; split them at real boundaries.
- **Spacing is part of the code**: blank lines separate a function's steps (inputs, checks, the main operation, side
  effects, the result).
- **Keep behaviour visible**: inline one-off logic; extract only for real reuse, an important domain concept, or
  substantial complexity behind a precise name.
- **Comment on reasoning** (why, invariants, platform quirks), never on what the code already says.
- TypeScript everywhere, including scripts, run by Node 24's type stripping. The one exception is a config a tool
  loads with `require()` (Metro's). Generated output goes in a gitignored folder and is never committed.
- Import other packages through their exports, never their `src/`, and icons only from `@ome-labs/icons` (oxlint
  enforces both).

## Data and words

Components take `@ome-labs/api` and `@ome-labs/format` shapes, so a screen can't show a format the guide forbids:

- amounts are base-unit strings formatted with `bigint`, never rounded and never in fiat;
- ids are `0x103b…c2c0` with the full value one hover, focus or tap away, and a copy button that copies all of it;
- statuses come from the daemon's enums with the kit's labels and tones;
- the words are the CLI's: "approvals to spend", "members to read", "keeper", "daemon".

## Dependencies

Use the latest stable version that fits, pinned to an exact version (no `^` or `~`):

- a dependency used by **two or more** packages goes in the `pnpm-workspace.yaml` catalog and is referenced as
  `catalog:`, so they can't drift apart;
- a dependency used by **one** package is pinned in that package's `package.json`.

Native modules follow Expo SDK 58's bundled versions (`expo/bundledNativeModules.json`), even when npm has newer ones.
pnpm holds back releases younger than a day; add a just-released version to `minimumReleaseAgeExclude` only when
it's needed.

## Tests

The smallest set that would catch a real regression, through each package's public API, with no mocks of our own
code and no tests of what types already guarantee. The website has none: it is checked by its typecheck, lint and
build, and by looking at it.

| Package     | Runner                         | Covers                                                                                              |
| ----------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `tokens`    | Vitest                         | every reference resolves, every colour has light and dark values, AA contrast, snapshots of the CSS |
| `brand`     | Vitest                         | the manifest matches the files, every component renders                                             |
| `icons`     | Vitest                         | every registry name renders a distinct Hugeicons icon                                               |
| `format`    | Vitest                         | table-driven: amounts (to u128 max, bad input), ids, times, thresholds, statuses, risks, checks     |
| `ui-web`    | Vitest + Testing Library       | keyboard, focus, copying, type-to-confirm, review gating, amounts; axe on each component domain     |
| `ui-native` | jest-expo + RN Testing Library | presses, disabled states, copying, type-to-confirm, review gating, amounts                          |
| `kit`       | Vitest                         | every example's code snippet is found in its source; search matching; contrast grading              |
