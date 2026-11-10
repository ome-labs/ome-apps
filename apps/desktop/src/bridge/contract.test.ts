import { describe, expect, it } from "vitest";

import { isRendererMethod } from "./contract.ts";

describe("isRendererMethod", () => {
  it.each(["status", "proposals.approve", "devices.forward"])("allows %s", (method) => {
    expect(isRendererMethod(method)).toBe(true);
  });

  it.each([
    "session.auth",
    "events.subscribe",
    "daemon.stop",
    "keeper.anything",
    "toString",
    "__proto__",
    42,
    null,
  ])("refuses %s", (method) => {
    expect(isRendererMethod(method)).toBe(false);
  });
});
