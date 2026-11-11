import { StateObject, manifest, stateObjectUrls, type StateObjectGroup } from "@ome-labs/brand/web";

import { ActionButton } from "../bench/action-button.tsx";
import { AssetTile } from "../bench/asset-tile.tsx";
import { Page, Section } from "../bench/page.tsx";
import { copyText } from "../clipboard/copy-text.ts";
import { downloadFile } from "../download/file.ts";
import { ThemeFrame } from "../theme/theme-frame.tsx";

const groups: { group: StateObjectGroup; title: string; description: string }[] = [
  {
    group: "empty",
    title: "Empty states",
    description: "What an empty page shows: the thing that will fill up, standing empty.",
  },
  {
    group: "states",
    title: "States",
    description:
      "Waits, failures, alarms and outcomes, beside banners, toasts and whole-window states.",
  },
  {
    group: "setup",
    title: "Setup",
    description:
      "First run, founding, pairing, and the ideas behind a vault: shares, thresholds, members.",
  },
  {
    group: "things",
    title: "Things",
    description:
      "Everyday objects for actions and features, in the desktop app, the phone app and the extension.",
  },
];

type StateObjectEntry = (typeof manifest.stateObjects)[number];

function StateObjectTile({ item }: { item: StateObjectEntry }) {
  const urls = stateObjectUrls[item.id];
  return (
    <AssetTile
      name={item.title}
      caption={item.id}
      stageClassName="p-0"
      actions={
        <>
          <ActionButton
            label="Copy JSX"
            icon="code"
            onClick={() =>
              void copyText(`<StateArt id="${item.id}" size={120} alt="" />`, "Copied JSX")
            }
          />
          <ActionButton
            label="Download light @2x"
            icon="sun"
            onClick={() => void downloadFile(urls.light["2x"], `${item.id}-light@2x.webp`)}
          />
          <ActionButton
            label="Download dark @2x"
            icon="moon"
            onClick={() => void downloadFile(urls.dark["2x"], `${item.id}-dark@2x.webp`)}
          />
        </>
      }
    >
      <div className="grid w-full grid-cols-2">
        <ThemeFrame theme="light" className="flex h-44 items-center justify-center">
          <StateObject id={item.id} theme="light" size={128} alt="" loading="lazy" />
        </ThemeFrame>
        <ThemeFrame theme="dark" className="flex h-44 items-center justify-center">
          <StateObject id={item.id} theme="dark" size={128} loading="lazy" />
        </ThemeFrame>
      </div>
    </AssetTile>
  );
}

export function StateObjectsPage() {
  return (
    <Page
      title="State objects"
      description={`${manifest.stateObjects.length} voxel objects for the app's states, each drawn for the light theme (ink outline) and the dark one (rim light, lit parts glow). Use them through StateArt, which shows the drawing for the theme in effect, or EmptyState's state prop. Shipped as lossless WebP at 1x and 2x.`}
    >
      {groups.map(({ group, title, description }) => (
        <Section
          key={group}
          title={title}
          description={description}
          className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3"
        >
          {manifest.stateObjects
            .filter((item) => item.group === group)
            .map((item) => (
              <StateObjectTile key={item.id} item={item} />
            ))}
        </Section>
      ))}
    </Page>
  );
}
