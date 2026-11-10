import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Catalog = {
  illustrations: { id: string; title: string; group: string; theme: string; alt: string }[];
  spot: { id: string; use: string }[];
  textures: { id: string; title: string; use: string }[];
  objects: { id: string; title: string; group: string; alt: string }[];
};

export const assetsDirectory = join(import.meta.dirname, "../../assets");

export function readCatalog(): Catalog {
  return JSON.parse(readFileSync(join(assetsDirectory, "catalog.json"), "utf8")) as Catalog;
}
