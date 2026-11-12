import type { IllustrationArt } from "../art/art-files.ts";
import { hexToRgb, type SkyColour } from "./palette.ts";

// The colours at a scene's edges, averaged from its pixels (rows 0–6 for the sky at its top, 6–20 for the clouds
// below that, 192–200 for its foot), so the painted sky runs into each scene without a seam. Measured once from
// the 1x webp files; re-measure if a scene is redrawn.
const edges = {
  "hero-dawn": ["#10274f", "#19386e", "#274475"],
  "hero-night": ["#040911", "#060e1b", "#0b1526"],
  "hero-day": ["#3269cd", "#437bd8", "#315797"],
  "hero-dusk": ["#0e203e", "#182e56", "#323e5c"],
  chinampas: ["#346bcd", "#417ad8", "#2c508e"],
  alliance: ["#0e2247", "#173365", "#244070"],
  welcome: ["#10254b", "#1b396f", "#213b68"],
  starting: ["#0e2145", "#163161", "#152b53"],
} as const satisfies Partial<Record<IllustrationArt, readonly [string, string, string]>>;

export type SkySceneId = keyof typeof edges;

export const skySceneIds = Object.keys(edges) as SkySceneId[];

export function sceneTop(id: SkySceneId): SkyColour {
  const [sky, cloud] = edges[id];

  return { sky: hexToRgb(sky), cloud: hexToRgb(cloud), clouds: 0.35, stars: 0 };
}

export function sceneFoot(id: SkySceneId): SkyColour {
  const foot = hexToRgb(edges[id][2]);

  return { sky: foot, cloud: foot, clouds: 0, stars: 0 };
}

export function sceneTopHex(id: SkySceneId): string {
  return edges[id][0];
}
