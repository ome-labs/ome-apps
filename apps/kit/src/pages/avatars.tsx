import { avatarUrls, manifest } from "@ome-labs/brand/web";
import { Avatar } from "@ome-labs/ui-web";

import { ActionButton } from "../bench/action-button.tsx";
import { AssetTile } from "../bench/asset-tile.tsx";
import { Page, Section } from "../bench/page.tsx";
import { copyText } from "../clipboard/copy-text.ts";
import { downloadFile } from "../download/file.ts";

const kinds = [
  {
    kind: "vault",
    title: "Vaults",
    description: "Places and things that keep something. Shown in rounded squares.",
  },
  {
    kind: "profile",
    title: "Profiles",
    description: "Figures and creatures of the lake. Shown in circles.",
  },
] as const;

type AvatarEntry = (typeof manifest.avatars)[number];

function AvatarTile({ avatar }: { avatar: AvatarEntry }) {
  const shape = avatar.kind === "vault" ? "square" : "circle";
  return (
    <AssetTile
      name={avatar.title}
      caption={avatar.id}
      actions={
        <>
          <ActionButton
            label="Copy JSX"
            icon="code"
            onClick={() =>
              void copyText(
                `<Avatar name="" shape="${shape}" source={{ kind: "art", id: "${avatar.id}" }} />`,
                "Copied JSX",
              )
            }
          />
          <ActionButton
            label="Download SVG"
            icon="download"
            onClick={() => void downloadFile(avatarUrls[avatar.id], `${avatar.id}.svg`)}
          />
        </>
      }
    >
      <div className="flex items-end gap-3">
        <Avatar
          name={avatar.title}
          shape={shape}
          size={96}
          source={{ kind: "art", id: avatar.id }}
        />
        <Avatar
          name={avatar.title}
          shape={shape}
          size={32}
          source={{ kind: "art", id: avatar.id }}
        />
        <Avatar
          name={avatar.title}
          shape={shape}
          size={20}
          source={{ kind: "art", id: avatar.id }}
        />
      </div>
    </AssetTile>
  );
}

export function AvatarsPage() {
  return (
    <Page
      title="Avatars"
      description={`${manifest.avatars.length} pixel avatars on a 64 grid, in the seven Ome colours: one set for vaults, one for profiles. Use them through Avatar, which rounds them and falls back to an initial; AvatarArt is the bare drawing.`}
    >
      {kinds.map((group) => (
        <Section
          key={group.kind}
          title={group.title}
          description={group.description}
          className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4"
        >
          {manifest.avatars
            .filter((avatar) => avatar.kind === group.kind)
            .map((avatar) => (
              <AvatarTile key={avatar.id} avatar={avatar} />
            ))}
        </Section>
      ))}
      <Section
        title="Without a picture"
        description="Avatar shows the initial on a fill picked from the name, so it stays the same everywhere."
      >
        <div className="flex items-center gap-3">
          <Avatar name="Alice" size={40} />
          <Avatar name="Bob" size={40} />
          <Avatar name="Treasury" shape="square" size={40} />
        </div>
      </Section>
    </Page>
  );
}
