// Downloads the art masters from the Figma kit by layer name, through the REST API (which works on
// any plan, unlike the Variables API). Illustrations live on pages 14–16, textures on 12 and objects
// on 13; each image layer is named after its asset id.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { Catalog } from "../src/catalog/catalog.ts";
import { grids } from "../src/catalog/grid.ts";

type FigmaNode = {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: { width: number };
};

const kinds = [
  { kind: "illustrations", pages: /^1[4-6] · Illustrations/, width: grids.illustrations.width * 3 },
  { kind: "textures", pages: /^12 · Textures/, width: grids.textures.width * 4 },
  { kind: "objects", pages: /^13 · Objects/, width: grids.objects.width * 4 },
] as const;

export async function downloadMasters(catalog: Catalog, directory: string): Promise<string> {
  const token = process.env.FIGMA_TOKEN;
  const fileKey = process.env.FIGMA_FILE_KEY;
  if (!token || !fileKey) {
    throw new Error(
      "Pass --from <masters directory>, or set FIGMA_TOKEN and FIGMA_FILE_KEY to export from Figma.",
    );
  }

  const headers = { "X-Figma-Token": token };
  const file = (await (
    await fetch(`https://api.figma.com/v1/files/${fileKey}`, { headers })
  ).json()) as { document: FigmaNode };

  for (const { kind, pages, width } of kinds) {
    const wanted = new Set(catalog[kind].map((item) => item.id));
    const found = new Map<string, FigmaNode>();
    for (const page of file.document.children ?? []) {
      if (pages.test(page.name)) {
        collect(page, wanted, found);
      }
    }

    const missing = [...wanted].filter((id) => !found.has(id));
    if (missing.length > 0) {
      throw new Error(`Figma has no ${kind} layers named ${missing.join(", ")}`);
    }

    // The images endpoint takes one scale per request, so group layers by the scale they need.
    const byScale = Map.groupBy([...found.values()], (node) =>
      Number((width / (node.absoluteBoundingBox?.width ?? width)).toFixed(4)),
    );
    mkdirSync(join(directory, kind), { recursive: true });

    const downloads = [...byScale].map(async ([scale, nodes]) => {
      const ids = nodes.map((node) => node.id).join(",");
      const response = (await (
        await fetch(
          `https://api.figma.com/v1/images/${fileKey}?ids=${ids}&format=png&scale=${scale}`,
          { headers },
        )
      ).json()) as {
        images: Record<string, string>;
      };

      await Promise.all(
        nodes.map(async (node) => {
          const url = response.images[node.id];
          if (!url) {
            throw new Error(`Figma did not render ${node.name}`);
          }
          writeFileSync(
            join(directory, kind, `${node.name}.png`),
            Buffer.from(await (await fetch(url)).arrayBuffer()),
          );
        }),
      );
    });
    // oxlint-disable-next-line no-await-in-loop -- kinds run in order so a missing layer fails before downloads start
    await Promise.all(downloads);
  }

  return directory;
}

// The first image layer with each wanted name; frames and captions share names, so only rectangles count.
function collect(node: FigmaNode, wanted: Set<string>, found: Map<string, FigmaNode>) {
  if (node.type === "RECTANGLE" && wanted.has(node.name) && !found.has(node.name)) {
    found.set(node.name, node);
  }
  for (const child of node.children ?? []) {
    collect(child, wanted, found);
  }
}
