import { tokens } from "@ome-labs/tokens";

declare const require: (path: string) => number;

/**
 * The font files for expo-font, keyed by the family names the tokens use on native (one family per
 * weight): `const [loaded] = useFonts(fontFiles)`.
 */
export const fontFiles = {
  [tokens.font.native
    .display[400]]: require("../../assets/fonts/instrument-serif/InstrumentSerif-Regular.ttf"),
  "InstrumentSerif-Italic": require("../../assets/fonts/instrument-serif/InstrumentSerif-Italic.ttf"),
  [tokens.font.native.sans[400]]: require("../../assets/fonts/inter/Inter-Regular.ttf"),
  [tokens.font.native.sans[500]]: require("../../assets/fonts/inter/Inter-Medium.ttf"),
  [tokens.font.native.sans[600]]: require("../../assets/fonts/inter/Inter-SemiBold.ttf"),
  [tokens.font.native.sans[700]]: require("../../assets/fonts/inter/Inter-Bold.ttf"),
  [tokens.font.native
    .mono[400]]: require("../../assets/fonts/jetbrains-mono/JetBrainsMono-Regular.ttf"),
  [tokens.font.native
    .mono[500]]: require("../../assets/fonts/jetbrains-mono/JetBrainsMono-Medium.ttf"),
} as const;
