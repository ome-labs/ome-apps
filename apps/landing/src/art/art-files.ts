// The brand's pixel scenes this site shows, as URLs. The brand package's own components look scenes up in its full
// catalog, which would ship every scene's URL and the whole manifest in the page script; the site names only the
// files it uses, and each one is a separate, cacheable file.

const illustrationIds = [
  "hero-dawn",
  "hero-day",
  "hero-dusk",
  "hero-night",
  "chinampas",
  "causeway",
  "alliance",
  "ome-two",
  "welcome",
  "starting",
] as const;

const sceneIds = [
  "lobby",
  "invite",
  "key-generation",
  "vault-founded",
  "new-proposal",
  "review",
  "ready",
  "executed",
  "peers",
  "keeper",
  "health-good",
  "balances",
  "share-plan",
  "reshare",
  "collecting",
  "new-committee",
  "proving",
  "relay",
  "locked",
  "devices",
  "removed",
  "starting",
] as const;

/** The kit's avatars the site shows: the story's members and their vault. */
const avatarIds = ["heron", "axolotl", "fox", "owl", "jaguar", "lantern-tower"] as const;

/** The kit's pixel objects the site shows. */
const objectIds = ["laptop", "server", "phone", "approve-stone", "lantern", "share"] as const;

export type IllustrationArt = (typeof illustrationIds)[number];
export type SceneArt = (typeof sceneIds)[number];
export type AvatarArt = (typeof avatarIds)[number];
export type ObjectArt = (typeof objectIds)[number];

// Globs must be literal, so the names repeat the lists above.
const illustrationFiles = import.meta.glob<string>(
  "@brand-assets/illustrations/*/{hero-dawn,hero-day,hero-dusk,hero-night,chinampas,causeway,alliance,ome-two,welcome,starting}@{1x,2x}.webp",
  { query: "?url", import: "default", eager: true },
);
const sceneFiles = import.meta.glob<string>(
  "@brand-assets/scenes/{lobby,invite,key-generation,vault-founded,new-proposal,review,ready,executed,peers,keeper,health-good,balances,share-plan,reshare,collecting,new-committee,proving,relay,locked,devices,removed,starting}@{1x,2x}.webp",
  { query: "?url", import: "default", eager: true },
);

const avatarFiles = import.meta.glob<string>(
  "@brand-assets/avatars/*/{heron,axolotl,fox,owl,jaguar,lantern-tower}.svg",
  { query: "?url", import: "default", eager: true },
);
const objectFiles = import.meta.glob<string>(
  "@brand-assets/objects/*/{laptop,server,phone,approve-stone,lantern,share}.svg",
  { query: "?url", import: "default", eager: true },
);

export type ArtSource = { "1x": string; "2x": string };

function find(files: Record<string, string>, id: string): ArtSource | undefined {
  const at = (size: string) =>
    Object.entries(files).find(([path]) => path.endsWith(`/${id}@${size}.webp`))?.[1];
  const one = at("1x");
  const two = at("2x");

  return one && two ? { "1x": one, "2x": two } : undefined;
}

export function illustrationSource(id: IllustrationArt): ArtSource | undefined {
  return find(illustrationFiles, id);
}

export function sceneSource(id: SceneArt): ArtSource | undefined {
  return find(sceneFiles, id);
}

function findDrawing(files: Record<string, string>, id: string): string | undefined {
  return Object.entries(files).find(([path]) => path.endsWith(`/${id}.svg`))?.[1];
}

export function avatarSource(id: AvatarArt): string | undefined {
  return findDrawing(avatarFiles, id);
}

export function objectSource(id: ObjectArt): string | undefined {
  return findDrawing(objectFiles, id);
}
