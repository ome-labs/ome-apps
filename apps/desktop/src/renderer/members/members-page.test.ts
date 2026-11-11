import { describe, expect, it } from "vitest";

import { olderThan } from "./members-page.tsx";

describe("olderThan", () => {
  it("compares releases by their numbers, not as text", () => {
    expect(olderThan("0.2.0", "0.3.0")).toBe(true);
    expect(olderThan("0.10.0", "0.9.0")).toBe(false);
    expect(olderThan("0.3.0", "0.3.0")).toBe(false);
    expect(olderThan("0.3.0-rc.1", "0.3.1")).toBe(true);
  });
});
