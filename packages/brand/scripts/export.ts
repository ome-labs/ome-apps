// Exports the kit's art from its masters into assets/: illustrations and textures as lossless WebP
// at two whole-number scales, pixel objects as SVG, and the app icons (SVG masters and PNGs).
//
//   node scripts/export.ts --from <dir>     masters already on disk (illustrations/, textures/, objects/)
//   FIGMA_TOKEN=… FIGMA_FILE_KEY=… node scripts/export.ts
//                                           download the masters from the Figma kit first (into .masters/)
//
// Masters are PNGs named by asset id at any whole-number multiple of the art's grid.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";

import sharp from "sharp";

import { assetsDirectory, readCatalog } from "../src/catalog/catalog.ts";
import { grids } from "../src/catalog/grid.ts";
import {
  appIconVariants,
  illustrationFile,
  objectFile,
  textureFile,
  type AppIconVariant,
} from "../src/catalog/paths.ts";
import { downloadMasters } from "./figma.ts";

const { values } = parseArgs({ options: { from: { type: "string" } } });
const catalog = readCatalog();
const masters =
  values.from ?? (await downloadMasters(catalog, join(import.meta.dirname, "../.masters")));

const write = (file: string, data: Buffer | string) => {
  const target = join(assetsDirectory, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, data);
};

// Back to the art's own pixels first, so any master scale gives identical output.
const pixels = (file: string, width: number, height: number) =>
  sharp(join(masters, file)).resize(width, height, { kernel: "nearest" }).toBuffer();

const webp = (buffer: Buffer, width: number, height: number) =>
  sharp(buffer)
    .resize(width, height, { kernel: "nearest" })
    .webp({ lossless: true, effort: 6 })
    .toBuffer();

const scaledWebp = async (
  master: string,
  kind: "illustrations" | "textures",
  files: Record<"1x" | "2x", string>,
) => {
  const { width, height, scales } = grids[kind];
  const art = await pixels(master, width, height);
  write(files["1x"], await webp(art, width * scales["1x"], height * scales["1x"]));
  write(files["2x"], await webp(art, width * scales["2x"], height * scales["2x"]));
};

await Promise.all([
  ...catalog.illustrations.map(({ id, group }) =>
    scaledWebp(`illustrations/${id}.png`, "illustrations", {
      "1x": illustrationFile(group, id, "1x"),
      "2x": illustrationFile(group, id, "2x"),
    }),
  ),
  ...catalog.textures.map(({ id }) =>
    scaledWebp(`textures/${id}.png`, "textures", {
      "1x": textureFile(id, "1x"),
      "2x": textureFile(id, "2x"),
    }),
  ),
  ...catalog.objects.map(async ({ id, group, alt }) =>
    write(objectFile(group, id), await objectSvg(join(masters, `objects/${id}.png`), alt)),
  ),
]);

await exportAppIcons();

console.log(
  `brand: ${catalog.illustrations.length} illustrations, ${catalog.textures.length} textures, ${catalog.objects.length} objects, ${appIconVariants.length} app icons`,
);

/** A pixel object as SVG: one path per colour, each horizontal run of a colour one rectangle. */
async function objectSvg(file: string, title: string): Promise<string> {
  const { width, height } = grids.objects;
  const { data } = await sharp(file)
    .resize(width, height, { kernel: "nearest" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const runs = new Map<string, string[]>();

  for (let y = 0; y < height; y += 1) {
    let x = 0;
    while (x < width) {
      const offset = (y * width + x) * 4;
      if ((data[offset + 3] ?? 0) < 128) {
        x += 1;
        continue;
      }

      const color = `#${[0, 1, 2].map((channel) => (data[offset + channel] ?? 0).toString(16).padStart(2, "0")).join("")}`;
      let end = x + 1;
      while (end < width && sameColor(data, (y * width + end) * 4, offset)) {
        end += 1;
      }

      runs.set(color, [...(runs.get(color) ?? []), `M${x} ${y}h${end - x}v1h-${end - x}z`]);
      x = end;
    }
  }

  const paths = [...runs]
    .map(([color, segments]) => `<path fill="${color}" d="${segments.join("")}"/>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges" role="img" aria-label="${title}"><title>${title}</title>${paths}</svg>\n`;
}

function sameColor(data: Buffer, a: number, b: number): boolean {
  return (
    (data[a + 3] ?? 0) >= 128 &&
    data[a] === data[b] &&
    data[a + 1] === data[b + 1] &&
    data[a + 2] === data[b + 2]
  );
}

// The art behind an app icon, embedded in its SVG master so the master renders on its own.
async function artDataUri(id: string): Promise<string> {
  const group = catalog.illustrations.find((item) => item.id === id)?.group ?? "brand-onboarding";
  const image = await sharp(join(assetsDirectory, illustrationFile(group, id, "1x")))
    .png()
    .toBuffer();
  return `data:image/png;base64,${image.toString("base64")}`;
}

function renderPng(source: string, size: number): Promise<Buffer> {
  return sharp(Buffer.from(source)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
}

async function exportAppIcons() {
  // Figma page 05: a rounded square (radius 22.37%), the mark at 62% of the canvas, white on art,
  // white and Haze on Night, Night and Lake on Paper. Art icons get a light scrim behind the mark.
  const mark = readFileSync(join(assetsDirectory, "logo/mark-mono.svg"), "utf8");
  const markPaths = (sun: string, reflection: string) =>
    [...mark.matchAll(/<path d="([^"]+)"/g)]
      .map((match, index) => `<path d="${match[1]}" fill="${index === 0 ? sun : reflection}"/>`)
      .join("");

  const design: Record<
    AppIconVariant,
    { background: string; scrim: number; sun: string; reflection: string; art?: string }
  > = {
    lake: {
      background: "#111111",
      scrim: 0.22,
      sun: "#FFFFFF",
      reflection: "#FFFFFF",
      art: await artDataUri("hero-dawn"),
    },
    night: { background: "#111111", scrim: 0, sun: "#FFFFFF", reflection: "#7F9CF0" },
    paper: { background: "#FFFFFF", scrim: 0, sun: "#111111", reflection: "#3A5BD9" },
    testnet: {
      background: "#111111",
      scrim: 0.35,
      sun: "#FFFFFF",
      reflection: "#FFFFFF",
      art: await artDataUri("hero-mist"),
    },
  };

  const svg = (
    variant: AppIconVariant,
    { rounded, markScale }: { rounded: boolean; markScale: number },
  ) => {
    const icon = design[variant];
    const size = 1024;
    const markSize = size * markScale;
    const offset = (size - markSize) / 2;
    const radius = rounded ? size * 0.2237 : 0;

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${size} ${size}">`,
      `<title>Ome</title><defs><clipPath id="shape"><rect width="${size}" height="${size}" rx="${radius}"/></clipPath></defs>`,
      `<g clip-path="url(#shape)">`,
      `<rect width="${size}" height="${size}" fill="${icon.background}"/>`,
      icon.art
        ? `<image href="${icon.art}" x="-461" y="0" width="1638" height="1024" preserveAspectRatio="none" style="image-rendering:pixelated"/>`
        : "",
      icon.scrim
        ? `<rect width="${size}" height="${size}" fill="#05080D" fill-opacity="${icon.scrim}"/>`
        : "",
      `</g>`,
      variant === "paper" && rounded
        ? `<rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" rx="${radius}" fill="none" stroke="#E5E5E5"/>`
        : "",
      `<g transform="translate(${offset} ${offset}) scale(${markSize / 48})">${markPaths(icon.sun, icon.reflection)}</g>`,
      `</svg>`,
    ].join("");
  };

  const files: [string, Promise<Buffer> | string][] = [];
  const macosSizes = [1024, 512, 256, 128, 64, 32, 16];

  for (const variant of appIconVariants) {
    const master = svg(variant, { rounded: true, markScale: 0.62 });
    files.push([`app-icon/${variant}.svg`, `${master}\n`]);

    // macOS draws icons on Apple's grid: the shape is 824 of 1024 with a 100-pixel margin.
    const padded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><image href="data:image/svg+xml;base64,${Buffer.from(master).toString("base64")}" x="100" y="100" width="824" height="824"/></svg>`;
    for (const size of macosSizes) {
      files.push([`app-icon/macos/${variant}-${size}.png`, renderPng(padded, size)]);
    }
  }

  // iOS and Android mask the icon themselves, so they get full-bleed squares; Android's adaptive icon
  // keeps the mark inside the 66% safe zone of its foreground layer.
  for (const variant of ["lake", "testnet"] as const) {
    files.push([
      `app-icon/ios/${variant}-1024.png`,
      renderPng(svg(variant, { rounded: false, markScale: 0.62 }), 1024),
    ]);
    const background = svg(variant, { rounded: false, markScale: 0 }).replace(
      /<g transform[^]*?<\/g>/,
      "",
    );
    files.push([`app-icon/android/${variant}-background.png`, renderPng(background, 1024)]);
    const foreground = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><g transform="translate(${(1024 - 1024 * 0.44) / 2} ${(1024 - 1024 * 0.44) / 2}) scale(${(1024 * 0.44) / 48})">${markPaths("#FFFFFF", "#FFFFFF")}</g></svg>`;
    files.push([`app-icon/android/${variant}-foreground.png`, renderPng(foreground, 1024)]);
  }

  const favicon = svg("night", { rounded: true, markScale: 0.62 });
  files.push(
    ["app-icon/web/favicon.svg", `${favicon}\n`],
    ["app-icon/web/favicon-32.png", renderPng(favicon, 32)],
    ["app-icon/web/favicon-16.png", renderPng(favicon, 16)],
    [
      "app-icon/web/apple-touch-icon.png",
      renderPng(svg("lake", { rounded: false, markScale: 0.62 }), 180),
    ],
    ["app-icon/web/icon-192.png", renderPng(svg("lake", { rounded: true, markScale: 0.62 }), 192)],
    ["app-icon/web/icon-512.png", renderPng(svg("lake", { rounded: true, markScale: 0.62 }), 512)],
  );

  await Promise.all(files.map(async ([file, data]) => write(file, await data)));
}
