import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// klarity's preset runs without globals, so Testing Library can't register its own cleanup.
afterEach(cleanup);

// jsdom has no layout, so nothing is ever on screen: the site's loops simply never start. These stand in for the
// browser APIs the components call, not for any of the site's own code.
class NeverIntersecting {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.IntersectionObserver ??= NeverIntersecting as unknown as typeof IntersectionObserver;
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
