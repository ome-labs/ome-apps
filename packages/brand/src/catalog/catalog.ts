import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Catalog = {
  illustrations: { id: string; title: string; group: string; theme: string; alt: string }[];
  spot: { id: string; use: string }[];
  textures: { id: string; title: string; use: string }[];
  objects: { id: string; title: string; group: string; alt: string }[];
  /** The app's scenes: in-app illustrations, drawn after the onboarding ones and in their style. */
  scenes: { id: string; title: string; alt: string }[];
  /** Avatars a member can give a vault or their profile. */
  avatars: { id: string; title: string; kind: "vault" | "profile"; alt: string }[];
};

export const assetsDirectory = join(import.meta.dirname, "../../assets");

export function readCatalog(): Catalog {
  return JSON.parse(readFileSync(join(assetsDirectory, "catalog.json"), "utf8")) as Catalog;
}
