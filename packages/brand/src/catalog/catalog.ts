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
  /** Voxel objects for the app's states, each drawn for the light and the dark theme. Sizes are @1x pixels. */
  stateObjects: {
    id: string;
    title: string;
    group: "empty" | "states" | "setup" | "things";
    use: string;
    alt: string;
    size: Record<"light" | "dark", [number, number]>;
  }[];
};

export const assetsDirectory = join(import.meta.dirname, "../../assets");

export function readCatalog(): Catalog {
  return JSON.parse(readFileSync(join(assetsDirectory, "catalog.json"), "utf8")) as Catalog;
}
