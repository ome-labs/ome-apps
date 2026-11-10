import { Scene, manifest, sceneUrls } from "@ome-labs/brand/web";

import { ActionButton } from "../bench/action-button.tsx";
import { AssetTile } from "../bench/asset-tile.tsx";
import { Page, Section } from "../bench/page.tsx";
import { copyText } from "../clipboard/copy-text.ts";
import { downloadFile } from "../download/file.ts";

type SceneEntry = (typeof manifest.scenes)[number];

function SceneTile({ scene }: { scene: SceneEntry }) {
  const urls = sceneUrls[scene.id];
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
            onClick={() => void copyText(`<Scene id="${scene.id}" />`, "Copied JSX")}
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
      <Scene id={scene.id} loading="lazy" className="h-auto w-full" />
    </AssetTile>
  );
}

export function ScenesPage() {
  return (
    <Page
      title="Scenes"
      description={`${manifest.scenes.length} in-app scenes, drawn after the onboarding illustrations and in their style: the vault is one stone storehouse, members are canoes, keepers are lanterns. 320 × 200, shipped as lossless WebP at 2x and 4x.`}
    >
      <Section title="All scenes" className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
        {manifest.scenes.map((scene) => (
          <SceneTile key={scene.id} scene={scene} />
        ))}
      </Section>
    </Page>
  );
}
