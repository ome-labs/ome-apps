import type { SkyKey } from "./field.ts";
import { skyAt } from "./palette.ts";
import type { Moon } from "./render.ts";
import { sceneFoot, sceneTop, skySceneIds, type SkySceneId } from "./scene-edges.ts";

// Reads the page's hours from the DOM: every `[data-hour]` section keys the sky to its hour, a section holding a
// `[data-sky-scene]` keys it to that scene's edges instead, `[data-moon]` hangs the moon over a section, and
// `[data-sky-plain]` paints a section's sky above its scene as a smooth gradient instead of dithered clouds. The
// Figma generator did the same from the frames' measured layout (website/gen_all.py).

/** CSS pixels per logical pixel: the 320-wide scenes span a desktop page and keep their size on a phone. */
export function pixelSize(viewportWidth: number): number {
  return Math.max(4.5, viewportWidth / 320);
}

export type MeasuredScene = {
  id: SkySceneId;
  element: HTMLElement;
  row: number;
  column: number;
  /** Rows at the scene's top that blend smoothly out of a plain sky, instead of dissolving in dithered. */
  smoothTop: number;
};

/** How much of a plain section's scene eases in from the plain sky: its own dithered sky and cloud band. */
const smoothTopRows = 64;

export type SkyLayout = {
  rowCount: number;
  keys: SkyKey[];
  scenes: MeasuredScene[];
  moons: Moon[];
  plain: [number, number][];
};

function isSkyScene(id: string | undefined): id is SkySceneId {
  return skySceneIds.includes(id as SkySceneId);
}

export function measureSky(root: Document, k: number, width: number): SkyLayout {
  const scrollY = root.defaultView?.scrollY ?? 0;
  const keys: SkyKey[] = [];
  const scenes: MeasuredScene[] = [];
  const moons: Moon[] = [];
  const plain: [number, number][] = [];

  for (const section of root.querySelectorAll<HTMLElement>("[data-hour]")) {
    const box = section.getBoundingClientRect();
    const top = box.top + scrollY;
    const scene = section.querySelector<HTMLElement>("[data-sky-scene]");
    const id = scene?.dataset.skyScene;

    if (scene && isSkyScene(id)) {
      const sceneBox = scene.getBoundingClientRect();
      const row = Math.round((sceneBox.top + scrollY) / k);
      const plainSky = section.dataset.skyPlain !== undefined;
      scenes.push({
        id,
        element: scene,
        row,
        column: Math.round(sceneBox.left / k),
        smoothTop: plainSky ? smoothTopRows : 0,
      });
      keys.push({ row: row + 4, colour: sceneTop(id) });

      // A plain section's sky is smooth down through the band where its scene eases in; below that the scene's
      // own pixels cover it.
      if (plainSky) plain.push([Math.floor(top / k), row + smoothTopRows]);
      keys.push({ row: Math.round((top + box.height) / k), colour: sceneFoot(id) });
    } else {
      keys.push({
        row: (top + box.height * 0.45) / k,
        colour: skyAt(section.dataset.hour ?? "12:00 pm"),
      });
    }

    if (section.dataset.moon !== undefined) {
      moons.push({
        row: Math.round((top + 170) / k),
        column: Math.round(width * 0.82),
        radius: width >= 200 ? 5.8 : 4,
      });
    }
  }

  return {
    rowCount: Math.ceil(root.documentElement.scrollHeight / k) + 2,
    keys,
    scenes,
    moons,
    plain,
  };
}
