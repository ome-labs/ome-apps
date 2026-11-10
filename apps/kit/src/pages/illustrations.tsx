import { Illustration, illustrationUrls, manifest } from "@ome-labs/brand/web";

import { ActionButton } from "../bench/action-button.tsx";
import { AssetTile } from "../bench/asset-tile.tsx";
import { Page, Section } from "../bench/page.tsx";
import { copyText } from "../clipboard/copy-text.ts";
import { downloadFile } from "../download/file.ts";

const groups = [
  {
    id: "brand-onboarding",
    title: "Brand and onboarding",
    description: "Times of day on Lake Texcoco, then the first-run screens.",
  },
  {
    id: "vault-proposals",
    title: "Vaults and proposals",
    description: "Founding a vault, balances, and a proposal's life.",
  },
  {
    id: "members-keepers-states",
    title: "Members, keepers and states",
    description:
      "Members joining and leaving, keepers, peers and devices, alarms, and the waiting and empty states.",
  },
] as const;

type Scene = (typeof manifest.illustrations)[number];

function SceneTile({ scene }: { scene: Scene }) {
  const urls = illustrationUrls[scene.id];

  return (
    <AssetTile
      name={scene.title}
      caption={scene.id}
      stageClassName="p-0"
      actions={
        <>
          <ActionButton
            label="Copy JSX"
            icon="code"
            onClick={() => void copyText(`<Illustration id="${scene.id}" />`, "Copied JSX")}
          />
          <ActionButton
            label="Download WebP @1x"
            icon="download"
            onClick={() => void downloadFile(urls["1x"], `${scene.id}@1x.webp`)}
          />
          <ActionButton
            label="Download WebP @2x"
            icon="receive"
            onClick={() => void downloadFile(urls["2x"], `${scene.id}@2x.webp`)}
          />
        </>
      }
    >
      <Illustration id={scene.id} loading="lazy" className="h-auto w-full" />
    </AssetTile>
  );
}

export function IllustrationsPage() {
  return (
    <Page
      title="Illustrations"
      description={`${manifest.illustrations.length} pixel scenes of the lake, drawn on a 320 × 200 grid and shipped as lossless WebP at 2x and 4x of it. Scale them by whole numbers only, with no smoothing; the Illustration component does that for you.`}
    >
      {groups.map((group) => (
        <Section
          key={group.id}
          title={group.title}
          description={group.description}
          className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3"
        >
          {manifest.illustrations
            .filter((scene) => scene.group === group.id)
            .map((scene) => (
              <SceneTile key={scene.id} scene={scene} />
            ))}
        </Section>
      ))}

      <Section
        title="Spot"
        description="Empty states and long waits reuse a scene rather than ship their own file. This is where each one appears."
        className="grid gap-x-6 tablet:grid-cols-2"
      >
        {manifest.spot.map((spot) => (
          <div key={spot.id} className="flex items-center gap-4 border-b border-line-subtle py-3">
            <Illustration
              id={spot.id}
              alt=""
              loading="lazy"
              className="h-auto w-24 shrink-0 rounded-sm"
            />
            <div className="flex min-w-0 flex-col">
              <span className="type-label-m text-fg">{spot.use}</span>
              <span className="type-mono-s text-fg-subtle">{spot.id}</span>
            </div>
          </div>
        ))}
      </Section>
    </Page>
  );
}
