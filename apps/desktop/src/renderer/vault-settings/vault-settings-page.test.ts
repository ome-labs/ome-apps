import { describe, expect, it } from "vitest";

import { aliasProblem, nameProblem } from "./vault-settings-page.tsx";

describe("vault settings checks", () => {
  it("takes a name of 1 to 48 characters", () => {
    expect(nameProblem("  ")).toBe("A vault needs a name.");
    expect(nameProblem("x".repeat(49))).toBe("At most 48 characters.");
    expect(nameProblem("Treasury 2026")).toBeUndefined();
  });

  it("takes an alias the command line can type", () => {
    expect(aliasProblem("treasury_2026")).toBeUndefined();
    expect(aliasProblem("Treasury")).toBe("Lowercase letters, digits, - and _ only.");
    expect(aliasProblem("a b")).toBe("Lowercase letters, digits, - and _ only.");
    expect(aliasProblem("x".repeat(33))).toBe("At most 32 characters.");
  });
});
