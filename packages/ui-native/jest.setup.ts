// Reanimated's JS implementation asks the browser API about reduced motion.
const browser = globalThis as unknown as {
  matchMedia?: (query: string) => unknown;
  document?: unknown;
};

browser.matchMedia ??= (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
});

// Reanimated's JS implementation installs web layout-animation styles on import unless they already exist.
// React Native has a `window` but no `document`; claiming the stylesheet exists skips that DOM work.
browser.document ??= { getElementById: () => ({}) };
