// Figma page 11: 16 in dense rows, 20 in the interface, 24 in headers, 32 for feature moments.
export const iconSizes = [16, 20, 24, 32] as const;
export type IconSize = (typeof iconSizes)[number];

/** The kit draws every icon with a 1.5 stroke on its 24 grid, round caps and joins. */
export const iconStrokeWidth = 1.5;
