import { describe, expect, it } from "vitest";

import { illustrationIds, illustrationSource, sceneIds, sceneSource } from "./art-files.ts";

describe("art files", () => {
  it.each(illustrationIds)("finds both sizes of the %s illustration", (id) => {
    expect(illustrationSource(id)).toEqual({ "1x": expect.any(String), "2x": expect.any(String) });
  });

  it.each(sceneIds)("finds both sizes of the %s scene", (id) => {
    expect(sceneSource(id)).toEqual({ "1x": expect.any(String), "2x": expect.any(String) });
  });
});
