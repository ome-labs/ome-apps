// The sky's colour through one day on the lake, from the Figma website pages: each row is an hour on a 5..30 axis
// (after midnight counts past 24, so the night runs on into the next dawn), the sky, the clouds' lit colour, how
// much of the sky is cloud, and how many stars show.

export type Rgb = readonly [number, number, number];

export type SkyColour = {
  sky: Rgb;
  cloud: Rgb;
  /** 0 is a clear sky, 1 is overcast. */
  clouds: number;
  /** 0 is no stars; the darkest night is about 0.06. */
  stars: number;
};

type Stop = readonly [hour: number, sky: string, cloud: string, clouds: number, stars: number];

const stops: readonly Stop[] = [
  [5.4, "#16235E", "#2B3C8E", 0.4, 0],
  [5.9, "#1E2E70", "#3E56A8", 0.45, 0],
  [6.4, "#2A3F8F", "#7F9CF0", 0.55, 0],
  [8.0, "#4062CF", "#9FB5EE", 0.72, 0],
  [9.5, "#4466D2", "#A3B8EF", 0.76, 0],
  [12.0, "#4B6ED6", "#AEC1F2", 0.72, 0],
  [14.5, "#4868D2", "#AEC1F2", 0.78, 0],
  [16.5, "#4560C6", "#DDB79E", 0.78, 0],
  [17.6, "#3B50B0", "#E4AA84", 0.8, 0],
  [18.7, "#283580", "#DD9665", 0.8, 0],
  [19.6, "#1F2A66", "#7E5C78", 0.6, 0],
  [20.7, "#18225A", "#3A3F78", 0.5, 0.04],
  [23.3, "#121B4A", "#2A3570", 0.5, 0.06],
  [26.0, "#0F1842", "#25306A", 0.5, 0.06],
  [28.2, "#142056", "#2C3A80", 0.45, 0.04],
  [29.7, "#1C2B6C", "#33449A", 0.4, 0],
  [30.5, "#2A3F8F", "#4A62B8", 0.35, 0],
];

const firstStop = stops[0] ?? [5, "#000000", "#000000", 0, 0];
const lastStop = stops.at(-1) ?? firstStop;

export function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.replace("#", ""), 16);

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function rgbToHex([red, green, blue]: Rgb): string {
  return `#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

export function mixRgb(from: Rgb, to: Rgb, t: number): Rgb {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ];
}

/** "6:12 am", "12:10 pm", "3:20 am" → hours on the 5..30 axis, so 3:20 am is 27.33, after the evening. */
export function hourOnAxis(clock: string): number {
  const match = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(clock.trim());
  if (!match) throw new Error(`Not a clock time: ${clock}`);

  const [, hours, minutes, half] = match;
  const twelve = Number(hours) % 12;
  const value = twelve + (half?.toLowerCase() === "pm" ? 12 : 0) + Number(minutes) / 60;

  return value < 5 ? value + 24 : value;
}

export function skyAt(clock: string): SkyColour {
  const hour = Math.min(lastStop[0], Math.max(firstStop[0], hourOnAxis(clock)));
  const index = stops.findIndex((stop, i) => stop[0] <= hour && hour <= (stops[i + 1]?.[0] ?? -1));
  const from = stops[Math.max(0, index)] ?? firstStop;
  const to = stops[Math.max(0, index) + 1] ?? from;
  const t = to[0] === from[0] ? 0 : (hour - from[0]) / (to[0] - from[0]);

  return {
    sky: mixRgb(hexToRgb(from[1]), hexToRgb(to[1]), t),
    cloud: mixRgb(hexToRgb(from[2]), hexToRgb(to[2]), t),
    clouds: from[3] + (to[3] - from[3]) * t,
    stars: from[4] + (to[4] - from[4]) * t,
  };
}

/** Night hours get the moon in the hour chip and the clock; daylight gets the sun. */
export function isNight(clock: string): boolean {
  const hour = hourOnAxis(clock);

  return hour >= 19.5 && hour < 29.6;
}
