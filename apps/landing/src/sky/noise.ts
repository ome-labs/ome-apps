// Value noise for the clouds, as the Figma generator draws them (website/sky.py): a few octaves of smoothstepped
// random grids, wider than tall so clouds lie in bands. It wraps left to right, so the clouds can drift sideways
// forever by turning the columns.

/** A small seeded generator (mulberry32): the same seed paints the same sky on every visit. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Octaves = { seed: number; scaleX: number; scaleY: number; octaves: number };

/** Noise in 0..1 for a `width` × `height` field, row by row. */
function valueNoise(width: number, height: number, { seed, scaleX, scaleY, octaves }: Octaves) {
  const out = new Float32Array(width * height);
  const random = seededRandom(seed);
  let amplitude = 1;
  let total = 0;

  for (let octave = 0; octave < octaves; octave++) {
    const columns = Math.max(2, Math.round((width / scaleX) * 2 ** octave));
    const rows = Math.ceil((height / scaleY) * 2 ** octave) + 3;
    const grid = new Float32Array(columns * rows);
    for (let i = 0; i < grid.length; i++) grid[i] = random();

    for (let y = 0; y < height; y++) {
      const gy = (y / height) * (rows - 2);
      const y0 = Math.floor(gy);
      const fy = smooth(gy - y0);

      for (let x = 0; x < width; x++) {
        const gx = (x / width) * columns;
        const x0 = Math.floor(gx);
        const x1 = (x0 + 1) % columns;
        const fx = smooth(gx - x0);
        const top = (grid[y0 * columns + x0] ?? 0) * (1 - fx) + (grid[y0 * columns + x1] ?? 0) * fx;
        const bottom =
          (grid[(y0 + 1) * columns + x0] ?? 0) * (1 - fx) +
          (grid[(y0 + 1) * columns + x1] ?? 0) * fx;
        const i = y * width + x;
        out[i] = (out[i] ?? 0) + (top * (1 - fy) + bottom * fy) * amplitude;
      }
    }

    total += amplitude;
    amplitude /= 2;
  }

  for (let i = 0; i < out.length; i++) out[i] = (out[i] ?? 0) / total;

  return out;
}

/** The two layers sky.py adds: broad banks of cloud and finer texture on top. */
export function cloudNoise(width: number, height: number, seed: number): Float32Array {
  const broad = valueNoise(width, height, { seed, scaleX: 110, scaleY: 26, octaves: 5 });
  const fine = valueNoise(width, height, { seed: seed + 7, scaleX: 30, scaleY: 8, octaves: 3 });

  for (let i = 0; i < broad.length; i++) broad[i] = (broad[i] ?? 0) * 0.8 + (fine[i] ?? 0) * 0.3;

  return broad;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}
