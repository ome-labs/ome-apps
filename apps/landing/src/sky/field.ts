import { mixRgb, type SkyColour } from "./palette.ts";

/** The sky's colour at one logical row of the page. */
export type SkyKey = { row: number; colour: SkyColour };

/** Per logical row: sky RGB, cloud RGB, cloud amount and stars, interpolated between the keys. */
export type SkyRows = {
  count: number;
  sky: Float32Array;
  cloud: Float32Array;
  clouds: Float32Array;
  stars: Float32Array;
};

/** Spreads the keys over `count` rows, linearly, holding the first and last key's colour at the ends. */
export function interpolateRows(keys: readonly SkyKey[], count: number): SkyRows {
  const sorted = keys.toSorted((a, b) => a.row - b.row);
  const first = sorted[0];
  const rows: SkyRows = {
    count,
    sky: new Float32Array(count * 3),
    cloud: new Float32Array(count * 3),
    clouds: new Float32Array(count),
    stars: new Float32Array(count),
  };
  if (!first) return rows;

  let next = 0;
  for (let row = 0; row < count; row++) {
    while (next < sorted.length && (sorted[next]?.row ?? Infinity) <= row) next++;
    const before = sorted[Math.max(0, next - 1)] ?? first;
    const after = sorted[Math.min(sorted.length - 1, next)] ?? first;
    const span = after.row - before.row;
    const t = span > 0 ? Math.min(1, Math.max(0, (row - before.row) / span)) : 0;

    const sky = mixRgb(before.colour.sky, after.colour.sky, t);
    const cloud = mixRgb(before.colour.cloud, after.colour.cloud, t);
    rows.sky.set(sky, row * 3);
    rows.cloud.set(cloud, row * 3);
    rows.clouds[row] = before.colour.clouds + (after.colour.clouds - before.colour.clouds) * t;
    rows.stars[row] = before.colour.stars + (after.colour.stars - before.colour.stars) * t;
  }

  return rows;
}
