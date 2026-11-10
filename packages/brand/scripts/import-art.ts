// Brings the app's scenes and avatars into assets/ from their masters: scenes as lossless WebP at the
// illustrations' two scales, avatars as SVG (they're already pixel paths on a 64 × 64 grid).
//
//   node scripts/import-art.ts --scenes <dir of <id>.png> --avatars <dir with vaults/ and profiles/>
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";

import sharp from "sharp";

import { assetsDirectory, readCatalog } from "../src/catalog/catalog.ts";
import { grids } from "../src/catalog/grid.ts";
import { avatarFile, sceneFile } from "../src/catalog/paths.ts";

const { values } = parseArgs({
  options: { scenes: { type: "string" }, avatars: { type: "string" } },
});
if (!values.scenes || !values.avatars)
  throw new Error("usage: import-art.ts --scenes <dir> --avatars <dir>");
const catalog = readCatalog();

const target = (file: string) => {
  const path = join(assetsDirectory, file);
  mkdirSync(dirname(path), { recursive: true });
  return path;
};

const { width, height, scales } = grids.scenes;
await Promise.all(
  catalog.scenes.map(async ({ id }) => {
    // Back to the art's own pixels first, so any master scale gives identical output.
    const art = await sharp(join(values.scenes as string, `${id}.png`))
      .resize(width, height, { kernel: "nearest" })
      .toBuffer();
    await Promise.all(
      (["1x", "2x"] as const).map(async (scale) => {
        const out = await sharp(art)
          .resize(width * scales[scale], height * scales[scale], { kernel: "nearest" })
          .webp({ lossless: true, effort: 6 })
          .toBuffer();
        writeFileSync(target(sceneFile(id, scale)), out);
      }),
    );
  }),
);

for (const { id, kind } of catalog.avatars) {
  copyFileSync(join(values.avatars, `${kind}s`, `${id}.svg`), target(avatarFile(kind, id)));
}

console.log(`brand: ${catalog.scenes.length} scenes, ${catalog.avatars.length} avatars → assets/`);
