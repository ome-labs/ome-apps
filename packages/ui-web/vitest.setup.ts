import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// klarity's preset runs without globals, so Testing Library can't register its own cleanup.
afterEach(cleanup);

// jsdom has no matchMedia; the theme provider and Motion ask it about colour scheme and reduced motion.
globalThis.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
