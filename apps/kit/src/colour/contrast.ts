// WCAG 2.x contrast, the same measure the tokens package's tests hold the text roles to.

function channel(value: number) {
  const srgb = value / 255;
  return srgb <= 0.039_28 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  const [red, green, blue] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(channel);

  return 0.2126 * (red ?? 0) + 0.7152 * (green ?? 0) + 0.0722 * (blue ?? 0);
}

/** The contrast ratio of two `#RRGGBB` colours, from 1 to 21. */
export function contrast(foreground: string, background: string) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].toSorted(
    (a, b) => b - a,
  );

  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

/** AA for body text, AA for large text only (18px and up, or 14px bold), or neither. */
export function grade(ratio: number) {
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "Fails";
}
