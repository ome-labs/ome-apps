import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { nativeCss } from "../src/emit/css-native.ts";
import { webCss } from "../src/emit/css-web.ts";
import { tokensModule } from "../src/emit/typescript.ts";
import { loadTheme } from "../src/source/theme.ts";

const dist = join(import.meta.dirname, "../dist");
const theme = loadTheme();
const typescript = tokensModule(theme);

mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "theme.web.css"), webCss(theme));
writeFileSync(join(dist, "theme.native.css"), nativeCss(theme));
writeFileSync(join(dist, "tokens.js"), typescript.js);
writeFileSync(join(dist, "tokens.d.ts"), typescript.dts);

console.log(
  `tokens: ${theme.semantic.length} semantic colours, ${theme.text.length} text styles → dist/`,
);
