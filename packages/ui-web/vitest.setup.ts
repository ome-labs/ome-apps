import { setProjectAnnotations } from "@storybook/react";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import preview from "./.storybook/preview.tsx";

// klarity's preset runs without globals, so Testing Library can't register its own cleanup.
afterEach(cleanup);

// Stories rendered in tests get the same providers and theme decorators as in Storybook.
setProjectAnnotations(preview);

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
