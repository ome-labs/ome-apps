# @ome-labs/brand

Every brand asset of the Ome kit, typed and in the right format for web and React Native: the logo
and mark, app icons, fonts, textures, pixel objects, state objects, illustrations, scenes and avatars (Figma pages 02–05, 08, 12–17b).

## Use

Web:

```tsx
import "@ome-labs/brand/fonts.css";
import { AvatarArt, Illustration, Logo, PixelObject, Scene, StateObject } from "@ome-labs/brand/web";

<Logo variant="lockup-horizontal" tone="light" height={28} />
<Logo variant="mark" tone="mono" title="" className="text-fg" height={20} /> {/* decorative, takes currentColor */}
<Illustration id="no-proposals" alt="" />
<PixelObject id="vault" size={64} />
<Scene id="key-generation" alt="" />
<AvatarArt id="heron" size={40} alt="" />
<StateObject id="no-proposals" theme="dark" size={120} alt="" /> {/* or ui-web's StateArt, which follows the theme */}
```

React Native (needs `react-native-svg`; load fonts with expo-font):

```tsx
import { fontFiles, Illustration, Logo } from "@ome-labs/brand/native";
import { useFonts } from "expo-font";

const [loaded] = useFonts(fontFiles);
<Logo variant="mark" tone="dark" width={32} height={32} />;
```

| Export                      | What                                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `@ome-labs/brand/web`       | `Logo`, `Illustration`, `PixelObject`, `StateObject`, `Scene`, `AvatarArt`, asset URLs, the manifest |
| `@ome-labs/brand/native`    | the same components for React Native, `require()` sources, `fontFiles` for expo-font                 |
| `@ome-labs/brand/fonts.css` | `@font-face` rules for Instrument Serif, Inter and JetBrains Mono (WOFF2)                            |
| `@ome-labs/brand/manifest`  | every asset's id, group, size, files and alt text                                                    |
| `@ome-labs/brand/assets/*`  | the raw files                                                                                        |
| `@ome-labs/brand/fonts/*`   | the font files and their licences                                                                    |

Logo tones follow page 02: `light` (Night sun, Lake reflection) on light surfaces, `dark` (white and
Haze) on dark ones, `mono` (one colour, `currentColor`) on illustrations and photos. Pixel art is
always scaled by whole numbers without smoothing; the components set that up.

## Assets

```text
assets/
  logo/           mark, wordmark, horizontal and stacked lockups × light, dark, mono (SVG masters)
  app-icon/       lake, night, paper, testnet SVG masters; macos/ (Apple's 824-on-1024 grid, 1024…16),
                  ios/ and android/ (full-bleed and adaptive layers), web/ (favicons, touch and PWA icons)
  illustrations/  67 scenes in brand-onboarding/, vault-proposals/, members-keepers-states/, WebP @1x @2x
  scenes/         57 app scenes (empty states, waits, flows), WebP @1x @2x
  avatars/        60 avatars in vaults/ and profiles/, 64 × 64 SVG in the kit's palette
  textures/       12 dither textures, WebP @1x @2x
  objects/        73 pixel objects in vault-and-keys/, proposals/, keepers/, lake/, craft/, SVG
  state-objects/  65 voxel state objects (empty, states, setup, things) in light/ and dark/, WebP @1x @2x
  fonts/          Instrument Serif, Inter, JetBrains Mono: WOFF2 for web, TTF per weight for native, OFL.txt
  catalog.json    every raster and pixel asset's id, group, title and alt text
```

Spot illustrations (page 17) reuse the scenes; `manifest.spot` lists which scene each empty state and
long wait uses, so there are no duplicate files.

## Regenerate

- `pnpm build` (runs `scripts/generate.ts`): SVGO and SVGR turn the logo SVGs into web and native
  components and write the manifest and asset maps to `src/generated/` (gitignored). Turbo runs it
  before `typecheck` and `test`.
- `pnpm export` (runs `scripts/export.ts`): rebuilds `assets/` from the art masters, at fixed sizes,
  so the output is reproducible. Masters come from Figma by layer name (`FIGMA_TOKEN` and
  `FIGMA_FILE_KEY`, downloaded into `.masters/`) or from a folder (`--from <dir>` with
  `illustrations/`, `textures/` and `objects/` PNGs named by id). Illustrations are drawn on a 320 × 200
  grid, textures on 240 × 150 and objects on 32 × 32; the script returns any master to its grid and
  scales by whole numbers (WebP lossless, SVG for objects). App icons are composed from the mark.
- `node scripts/import-art.ts --scenes <dir> --avatars <dir>` imports scene PNGs (320 × 200) as WebP
  at 2× and 4×, and avatar SVGs (checked for the 64-unit viewBox) into `assets/`. Add each new id to
  `catalog.json` with its alt text, then `pnpm build`.
- Logo SVGs are masters: the mark is the 48-unit construction from page 03, the wordmark is "Ome" in
  Instrument Serif Regular converted to outlines, the lockups follow page 02 (wordmark 1.08 × the mark,
  gap 0.28 × the mark; stacked 0.82 and 0.16).
- Fonts are vendored from Google Fonts (SIL OFL 1.1, licences beside them), subset to Latin, Latin
  Extended, punctuation and arrows. Inter (opsz 14) and JetBrains Mono were instanced to static TTFs
  per weight for React Native; the web uses their variable WOFF2.

## Tests

- the manifest matches the files on disk (nothing missing, nothing unlisted), with the kit's counts;
- every illustration, scene, avatar and object has alt text, avatar ids are unique, and spot entries point at real scenes;
- every native font family the tokens use has a file, every family ships its licence, and the web
  `@font-face` URLs resolve;
- every web component renders with the right accessible name (decorative logos are hidden).

React Native components render in `@ome-labs/ui-native`'s Jest suite (Vitest doesn't run React Native).
