import type { TextStyle } from "../source/theme.ts";

// React Native has no font matching by weight for custom fonts (Android ignores fontWeight once a
// family is set), so every weight is its own family. These names are the keys @ome-labs/brand loads
// the font files under with expo-font.
export const nativeFamilies = {
  display: { 400: "InstrumentSerif-Regular" },
  sans: { 400: "Inter-Regular", 500: "Inter-Medium", 600: "Inter-SemiBold", 700: "Inter-Bold" },
  mono: { 400: "JetBrainsMono-Regular", 500: "JetBrainsMono-Medium" },
} as const;

export function nativeFamily(style: Pick<TextStyle, "family" | "weight">): string {
  const weights: Record<number, string> = nativeFamilies[style.family];
  const family = weights[style.weight];
  if (!family) {
    throw new Error(`No native font file for ${style.family} at weight ${style.weight}`);
  }

  return family;
}
