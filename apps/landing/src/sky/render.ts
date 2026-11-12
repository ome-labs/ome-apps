import type { SkyRows } from "./field.ts";

// Paints the visible rows of the page's sky into an ImageData, one logical pixel per canvas pixel. Everything is
// in page rows, not screen rows, so the dither pattern and the stars stay put while the page scrolls.

/** Ordered dithering (Bayer 8 × 8), as the brand's scenes are dithered. */
const bayer = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28,
  52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7,
  39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((value) => value / 64);

/** Colour levels the sky is quantised to before dithering; coarser looks more like the scenes. */
const step = 18;
/** How many rows at a scene's top dissolve into the sky. */
const fadeRows = 46;

export function threshold(row: number, column: number): number {
  return bayer[(row & 7) * 8 + (column & 7)] ?? 0;
}

export type PaintedScene = {
  /** The scene's top-left, in page rows and columns. */
  row: number;
  column: number;
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
};

export type Moon = { row: number; column: number; radius: number };

export type SkyFrame = {
  width: number;
  rows: SkyRows;
  noise: Float32Array;
  scenes: readonly PaintedScene[];
  moons: readonly Moon[];
  /** Columns the clouds have drifted; wraps at the width. */
  drift: number;
};

export function paintSky(target: ImageData, firstRow: number, frame: SkyFrame): void {
  const { width, rows, noise, drift } = frame;
  const out = target.data;

  for (let y = 0; y < target.height; y++) {
    const row = firstRow + y;
    const r = Math.min(rows.count - 1, Math.max(0, row));
    const skyR = rows.sky[r * 3] ?? 0;
    const skyG = rows.sky[r * 3 + 1] ?? 0;
    const skyB = rows.sky[r * 3 + 2] ?? 0;
    const cloudR = rows.cloud[r * 3] ?? 0;
    const cloudG = rows.cloud[r * 3 + 1] ?? 0;
    const cloudB = rows.cloud[r * 3 + 2] ?? 0;
    const cover = 1 - (rows.clouds[r] ?? 0) * 0.62;
    const starChance = (rows.stars[r] ?? 0) * 0.0022;

    for (let x = 0; x < target.width; x++) {
      const v = noise[r * width + ((x + drift) % width)] ?? 0;
      // A darker cloud body, then a lit top where the noise runs highest, like the clouds in the scenes.
      const body = clamp01((v - cover) * 4);
      const lit = clamp01((v - cover - 0.12) * 5);
      let red = skyR + (skyR * 0.55 + cloudR * 0.45 - skyR) * body;
      let green = skyG + (skyG * 0.55 + cloudG * 0.45 - skyG) * body;
      let blue = skyB + (skyB * 0.55 + cloudB * 0.45 - skyB) * body;
      red += (cloudR - red) * lit;
      green += (cloudG - green) * lit;
      blue += (cloudB - blue) * lit;

      for (const moon of frame.moons) {
        const distance = Math.hypot(x - moon.column, row - moon.row);
        const glow =
          distance > moon.radius
            ? clamp01(1 - (distance - moon.radius) / (moon.radius * 3.5)) ** 2 * 0.55
            : 0;
        red += (44 - red) * glow;
        green += (71 - green) * glow;
        blue += (180 - blue) * glow;
      }

      const t = threshold(row, x);
      const i = (y * target.width + x) * 4;
      out[i] = Math.floor(red / step + t) * step;
      out[i + 1] = Math.floor(green / step + t) * step;
      out[i + 2] = Math.floor(blue / step + t) * step;
      out[i + 3] = 255;

      if (starChance > 0 && hash(row, x) < starChance) {
        const bright = hash(x, row) < 0.12;
        out[i] = bright ? 255 : 157;
        out[i + 1] = bright ? 255 : 180;
        out[i + 2] = bright ? 255 : 242;
      }

      for (const moon of frame.moons) {
        if (Math.hypot(x - moon.column, row - moon.row) > moon.radius) continue;
        // A crescent: the disc minus a second disc up and to the right, filled with the sky beside it.
        const bite = Math.hypot(
          x - moon.column - moon.radius * 0.55,
          row - moon.row + moon.radius * 0.35,
        );
        if (bite <= moon.radius * 0.95) continue;
        out[i] = 243;
        out[i + 1] = 244;
        out[i + 2] = 248;
      }
    }
  }

  for (const scene of frame.scenes) pasteScene(target, firstRow, scene);
}

/** Copies a scene's pixels over the sky; its top rows dissolve in through the same dither pattern. */
function pasteScene(target: ImageData, firstRow: number, scene: PaintedScene): void {
  const out = target.data;
  const from = Math.max(0, scene.row - firstRow);
  const to = Math.min(target.height, scene.row + scene.height - firstRow);

  for (let y = from; y < to; y++) {
    const row = firstRow + y;
    const sceneRow = row - scene.row;
    const opacity = sceneRow < fadeRows ? sceneRow / fadeRows : 1;

    for (let x = 0; x < target.width; x++) {
      const sceneColumn = x - scene.column;
      if (sceneColumn < 0 || sceneColumn >= scene.width) continue;
      if (opacity < 1 && threshold(row, x) >= opacity) continue;

      const source = (sceneRow * scene.width + sceneColumn) * 4;
      const i = (y * target.width + x) * 4;
      out[i] = scene.pixels[source] ?? 0;
      out[i + 1] = scene.pixels[source + 1] ?? 0;
      out[i + 2] = scene.pixels[source + 2] ?? 0;
    }
  }
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** A stable 0..1 value per pixel, for stars that don't move or twinkle between frames. */
function hash(a: number, b: number): number {
  let h = Math.imul(a, 374761393) + Math.imul(b, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);

  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
