import { PixelObject, manifest, objectUrls, textureUrls } from "@ome-labs/brand/web";

import { ActionButton } from "../bench/action-button.tsx";
import { AssetTile } from "../bench/asset-tile.tsx";
import { Page, Section } from "../bench/page.tsx";
import { copyText } from "../clipboard/copy-text.ts";
import { downloadFile } from "../download/file.ts";
import { SvgDownloads } from "../download/png-actions.tsx";

const objectGroups = [
  { id: "vault-and-keys", title: "Vault and keys" },
  { id: "proposals", title: "Proposals" },
  { id: "keepers", title: "Keepers" },
  { id: "lake", title: "Lake" },
  { id: "craft", title: "Craft" },
] as const;

const pixelated = { imageRendering: "pixelated" } as const;

async function objectSvg(url: string) {
  const response = await fetch(url);
  return response.text();
}

export function TexturesObjectsPage() {
  return (
    <Page
      title="Textures & objects"
      description="Dither textures for backs and banners, and pixel objects on a 32 grid for lists and empty states. Both scale by whole numbers without smoothing."
    >
      <Section
        title="Textures"
        description={`${manifest.textures.length} ordered-dither textures, drawn on 240 × 150 and shipped as WebP at 2x and 4x of it.`}
        className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3"
      >
        {manifest.textures.map((texture) => {
          const urls = textureUrls[texture.id];

          return (
            <AssetTile
              key={texture.id}
              name={texture.title}
              caption={texture.use}
              stageClassName="p-0"
              actions={
                <>
                  <ActionButton
                    label="Download WebP @1x"
                    icon="download"
                    onClick={() => void downloadFile(urls["1x"], `${texture.id}@1x.webp`)}
                  />
                  <ActionButton
                    label="Download WebP @2x"
                    icon="receive"
                    onClick={() => void downloadFile(urls["2x"], `${texture.id}@2x.webp`)}
                  />
                </>
              }
            >
              <img
                src={urls["1x"]}
                srcSet={`${urls["1x"]} 1x, ${urls["2x"]} 2x`}
                alt=""
                width={texture.width}
                height={texture.height}
                loading="lazy"
                style={pixelated}
                className="h-auto w-full"
              />
            </AssetTile>
          );
        })}
      </Section>

      {objectGroups.map((group) => (
        <Section
          key={group.id}
          title={group.title}
          className="grid grid-cols-2 gap-3 tablet:grid-cols-3 desktop:grid-cols-4"
        >
          {manifest.objects
            .filter((object) => object.group === group.id)
            .map((object) => (
              <AssetTile
                key={object.id}
                name={object.title}
                caption={object.id}
                stageClassName="min-h-28 p-4"
                actions={
                  <>
                    <ActionButton
                      label="Copy JSX"
                      icon="code"
                      onClick={() =>
                        void copyText(`<PixelObject id="${object.id}" />`, "Copied JSX")
                      }
                    />
                    <SvgDownloads
                      markup={() => objectSvg(objectUrls[object.id])}
                      name={object.id}
                      height={32}
                      pixelated
                    />
                  </>
                }
              >
                <PixelObject id={object.id} size={64} loading="lazy" />
              </AssetTile>
            ))}
        </Section>
      ))}
    </Page>
  );
}
