import type { Config } from "jest";

// pnpm keeps packages under node_modules/.pnpm/<name>@<version>/node_modules/<name>, so the usual jest-expo
// allow-list also has to match the store's `+`-joined scoped names.
const transpiled = [
  "(jest-)?react-native",
  "@react-native(-community)?",
  "expo(nent)?",
  "@expo(nent)?[+/]",
  "expo-[a-z-]+",
  "@rn-primitives[+/]",
  "@gorhom[+/]",
  "@shopify[+/]flash-list",
  "@hugeicons[+/]",
  "sonner-native",
  "uniwind",
  "uqr",
];

const config: Config = {
  preset: "jest-expo",
  setupFiles: ["./jest.setup.ts"],
  // Reanimated's resolver sends Reanimated and Worklets to their JS implementations, which run under Jest.
  resolver: "react-native-reanimated/jest/resolver.js",
  testMatch: ["<rootDir>/tests/**/*.test.tsx"],
  // Brand art is required as `scene.webp` and Metro picks `scene@1x.webp` or `scene@2x.webp` by density;
  // Jest has no such lookup, so images resolve to a stand-in asset id.
  moduleNameMapper: { "\\.webp$": "<rootDir>/tests/image.ts" },
  transformIgnorePatterns: [`node_modules/(?!(?:\\.pnpm/)?(?:${transpiled.join("|")}))`],
};

export default config;
