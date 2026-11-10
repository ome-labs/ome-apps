import { Logo, type LogoTone, type LogoVariant } from "@ome-labs/brand/web";
import { tokens } from "@ome-labs/tokens";
import { Tooltip } from "@ome-labs/ui-web";

import { AssetTile } from "../bench/asset-tile.tsx";
import { Page, Section } from "../bench/page.tsx";
import { appIconFiles, appIconVariants } from "../brand/app-icon-files.ts";
import { logoSvg } from "../brand/logo-files.ts";
import { downloadFile } from "../download/file.ts";
import { SvgDownloads } from "../download/png-actions.tsx";
import { resolveSvg } from "../download/svg.ts";

const variants: { variant: LogoVariant; title: string; wide: boolean }[] = [
  { variant: "lockup-horizontal", title: "Horizontal lockup", wide: true },
  { variant: "lockup-stacked", title: "Stacked lockup", wide: false },
  { variant: "mark", title: "Mark", wide: false },
  { variant: "wordmark", title: "Wordmark", wide: true },
];

const night = tokens.color.light["brand-night"];
const white = tokens.color.light["brand-white"];

// Each logo shown where it belongs: two-tone on paper and on night, one colour on lake and on paper. The one-colour
// master draws in currentColor, so its downloads resolve it to the colour shown.
const surfaces: {
  key: string;
  label: string;
  tone: LogoTone;
  stage: string;
  ink?: string;
}[] = [
  { key: "light", label: "On paper", tone: "light", stage: "bg-brand-paper" },
  { key: "dark", label: "On night", tone: "dark", stage: "bg-brand-night" },
  {
    key: "mono-white",
    label: "One colour on lake",
    tone: "mono",
    stage: "bg-brand-lake text-brand-white",
    ink: white,
  },
  {
    key: "mono-night",
    label: "One colour on paper",
    tone: "mono",
    stage: "bg-brand-white text-brand-night",
    ink: night,
  },
];

/** The 1x height of a PNG export; 2x and 4x multiply it. */
const pngHeight = 128;

const masters = appIconFiles.filter((file) => file.folder === "masters");
const platforms = ["macos", "ios", "android", "web"] as const;
const platformTitle = { macos: "macOS", ios: "iOS", android: "Android", web: "Web" };

export function LogoPage() {
  return (
    <Page
      title="Logo & app icons"
      description="The mark is a sun over its reflection on the lake. Use the two-tone logo on paper and night, and the one-colour logo on lake, art and photos. Downloads are the brand package's SVG masters; PNGs render in your browser at 1x (128 px tall), 2x and 4x."
    >
      {variants.map(({ variant, title, wide }) => (
        <Section
          key={variant}
          title={title}
          className={
            wide ? "grid gap-4 tablet:grid-cols-2" : "grid grid-cols-2 gap-4 desktop:grid-cols-4"
          }
        >
          {surfaces.map((surface) => {
            const name = surface.ink
              ? `ome-${variant}-${surface.key}`
              : `ome-${variant}-${surface.tone}`;
            const markup = () => {
              const master = logoSvg(variant, surface.tone);
              return surface.ink ? resolveSvg(master, surface.ink) : master;
            };

            return (
              <AssetTile
                key={surface.key}
                name={surface.label}
                caption={`tone="${surface.tone}"`}
                stageClassName={`${surface.stage} min-h-44`}
                actions={<SvgDownloads markup={markup} name={name} height={pngHeight} />}
              >
                <Logo variant={variant} tone={surface.tone} height={variant === "mark" ? 56 : 48} />
              </AssetTile>
            );
          })}
        </Section>
      ))}

      <Section title="Use" className="grid gap-4 tablet:grid-cols-3">
        {[
          [
            "Minimum size",
            "The mark at 16 px; a lockup with its mark at 20 px. Below that, use the mark alone.",
          ],
          [
            "Construction",
            "The wordmark is Instrument Serif in outline at 1.08 × the mark, set 0.28 × the mark away. Stacked: 0.82 and 0.16.",
          ],
          [
            "Clear space",
            "Not yet specified in @ome-labs/brand. Ask design before placing the logo tight to other marks.",
          ],
        ].map(([title, body]) => (
          <div key={title} className="flex flex-col gap-1.5 rounded-xl bg-surface p-5 shadow-1">
            <h3 className="type-heading-s text-fg">{title}</h3>
            <p className="type-body-s text-fg-muted">{body}</p>
          </div>
        ))}
      </Section>

      <Section
        title="App icons"
        description="Four icons composed from the mark: lake, night, paper and testnet. The masters are 1024 px SVGs; each platform's files follow."
        className="grid grid-cols-2 gap-4 desktop:grid-cols-4"
      >
        {masters.map((file) => (
          <AssetTile
            key={file.path}
            name={file.name.replace(".svg", "")}
            caption={file.path}
            actions={
              <Tooltip content="Download SVG">
                <button
                  type="button"
                  aria-label={`Download ${file.name}`}
                  onClick={() => void downloadFile(file.url, `ome-app-icon-${file.name}`)}
                  className="focus-ring h-7 cursor-pointer rounded-sm px-1.5 type-label-s text-fg-muted transition-colors duration-fast hover:bg-hover hover:text-fg"
                >
                  SVG
                </button>
              </Tooltip>
            }
          >
            <img src={file.url} alt="" width={112} height={112} className="drop-shadow-md" />
          </AssetTile>
        ))}
      </Section>

      {platforms.map((platform) => {
        const files = appIconFiles.filter((file) => file.folder === platform);

        return (
          <Section
            key={platform}
            title={`${platformTitle[platform]} files`}
            description={
              platform === "macos"
                ? "Apple's 824-on-1024 grid, at every size the icon set needs."
                : undefined
            }
            className="flex flex-col gap-3"
          >
            {(platform === "macos" ? appIconVariants : [null]).map((variant) => (
              <div
                key={variant ?? platform}
                className="flex flex-wrap items-end gap-3 rounded-xl bg-surface p-4 shadow-1"
              >
                {variant ? (
                  <span className="w-20 type-label-m text-fg capitalize">{variant}</span>
                ) : null}
                {files
                  .filter((file) => !variant || file.name.startsWith(`${variant}-`))
                  .map((file) => (
                    <Tooltip key={file.path} content={`Download ${file.name}`}>
                      <button
                        type="button"
                        onClick={() => void downloadFile(file.url, file.name)}
                        className="focus-ring flex cursor-pointer flex-col items-center gap-1.5 rounded-md p-2 transition-colors duration-fast hover:bg-hover"
                      >
                        <img
                          src={file.url}
                          alt=""
                          width={Math.min(file.size ?? 64, 64)}
                          height={Math.min(file.size ?? 64, 64)}
                          className="[image-rendering:auto]"
                        />
                        <span className="type-mono-s text-fg-subtle">
                          {variant && file.size ? `${file.size}` : file.name}
                        </span>
                      </button>
                    </Tooltip>
                  ))}
              </div>
            ))}
          </Section>
        );
      })}
    </Page>
  );
}
