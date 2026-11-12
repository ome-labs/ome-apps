// The brand's pixel scenes this site shows, as URLs. The brand package's own components look scenes up in its full
// catalog, which would ship every scene's URL and the whole manifest in the page script; the site names only the
// files it uses, and each one is a separate, cacheable file. A test checks every id here has both sizes.

export const illustrationIds = [
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

export const sceneIds = [
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

export type IllustrationArt = (typeof illustrationIds)[number];
export type SceneArt = (typeof sceneIds)[number];

// Globs must be literal, so the names repeat the lists above.
const illustrationFiles = import.meta.glob<string>(
  "@brand-assets/illustrations/*/{hero-dawn,hero-day,hero-dusk,hero-night,chinampas,causeway,alliance,ome-two,welcome,starting}@{1x,2x}.webp",
  { query: "?url", import: "default", eager: true },
);
const sceneFiles = import.meta.glob<string>(
  "@brand-assets/scenes/{lobby,invite,key-generation,vault-founded,new-proposal,review,ready,executed,peers,keeper,health-good,balances,share-plan,reshare,collecting,new-committee,proving,relay,locked,devices,removed,starting}@{1x,2x}.webp",
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
