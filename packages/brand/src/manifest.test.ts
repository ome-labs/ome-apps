import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { tokens } from "@ome-labs/tokens";
import { describe, expect, test } from "vitest";

import { assetsDirectory } from "./catalog/catalog.ts";
import { manifest } from "./manifest.ts";
import { fontFiles } from "./native/fonts.ts";

const filesUnder = (folder: string): string[] =>
  readdirSync(join(assetsDirectory, folder)).flatMap((name) => {
    const path = join(folder, name);
    return statSync(join(assetsDirectory, path)).isDirectory() ? filesUnder(path) : [path];
  });

const listed = new Set<string>([
  ...manifest.illustrations.flatMap((item) => Object.values(item.files)),
  ...manifest.textures.flatMap((item) => Object.values(item.files)),
  ...manifest.objects.map((item) => item.file),
  ...manifest.scenes.flatMap((item) => [item.files["1x"], item.files["2x"]]),
  ...manifest.avatars.map((item) => item.file),
  ...manifest.stateObjects.flatMap((item) => [
    ...Object.values(item.light.files),
    ...Object.values(item.dark.files),
  ]),
  ...manifest.logos.map((item) => item.file),
]);

describe("manifest", () => {
  test("every listed file exists", () => {
    const missing = [...listed].filter((file) => !existsSync(join(assetsDirectory, file)));

    expect(missing).toEqual([]);
  });

  test.each(["illustrations", "textures", "objects", "logo", "scenes", "avatars", "state-objects"])(
    "every file in assets/%s is listed",
    (folder) => {
      const unlisted = filesUnder(folder).filter((file) => !listed.has(file));

      expect(unlisted).toEqual([]);
    },
  );

  test("the kit's counts: 67 illustrations, 73 objects, 12 textures, 57 scenes, 30 + 30 avatars", () => {
    expect([
      manifest.illustrations.length,
      manifest.objects.length,
      manifest.textures.length,
      manifest.scenes.length,
      manifest.avatars.filter((item) => item.kind === "vault").length,
      manifest.avatars.filter((item) => item.kind === "profile").length,
    ]).toEqual([67, 73, 12, 57, 30, 30]);
  });

  test("65 state objects, each with alt text, a use, and a light and a dark drawing", () => {
    expect(manifest.stateObjects).toHaveLength(65);
    expect(
      manifest.stateObjects.filter((item) => item.alt.trim() === "" || item.use.trim() === ""),
    ).toEqual([]);
    const ids = manifest.stateObjects.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(manifest.stateObjects.map((item) => item.group))).toEqual(
      new Set(["empty", "states", "setup", "things"]),
    );
  });

  test("scenes and avatars have alt text, and avatar ids are unique across both kinds", () => {
    expect(manifest.scenes.filter((item) => item.alt.trim() === "")).toEqual([]);
    expect(manifest.avatars.filter((item) => item.alt.trim() === "")).toEqual([]);
    const ids = manifest.avatars.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every illustration and object has alt text, and spot uses point at real illustrations", () => {
    const ids = new Set(manifest.illustrations.map((item) => item.id));

    expect(manifest.illustrations.filter((item) => item.alt.trim() === "")).toEqual([]);
    expect(manifest.objects.filter((item) => item.alt.trim() === "")).toEqual([]);
    expect(manifest.spot.filter((item) => !ids.has(item.id))).toEqual([]);
  });
});

describe("fonts", () => {
  test("every native family the tokens use has a font file", () => {
    const families = Object.values(tokens.font.native).flatMap((weights) => Object.values(weights));

    expect(families.filter((family) => !(family in fontFiles))).toEqual([]);
  });

  test.each(["instrument-serif", "inter", "jetbrains-mono"])("%s ships its licence", (family) => {
    expect(existsSync(join(assetsDirectory, "fonts", family, "OFL.txt"))).toBe(true);
  });

  test("the web @font-face rules point at files that exist", () => {
    const css = readFileSync(join(import.meta.dirname, "web/fonts.css"), "utf8");
    const urls = [...css.matchAll(/url\("([^"]+)"\)/g)].map((match) =>
      join(import.meta.dirname, "web", match[1] ?? ""),
    );

    expect(urls.length).toBeGreaterThan(0);
    expect(
      urls.filter((url) => !existsSync(url)).map((url) => relative(assetsDirectory, url)),
    ).toEqual([]);
  });
});
