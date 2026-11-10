import type { Tone } from "@ome-labs/format";

/**
 * The fill and text for each tone (Figma page 29), shared by pills, tags, banners and step badges. `edge` is a
 * hairline in the tone's own colour: it gives a tinted fill a crisp boundary on a white surface without the weight of
 * a grey border.
 */
export const toneClasses: Record<
  Tone | "accent",
  { fill: string; text: string; dot: string; edge: string }
> = {
  neutral: {
    fill: "bg-neutral-subtle",
    text: "text-neutral",
    dot: "bg-neutral",
    edge: "border border-neutral/15",
  },
  info: {
    fill: "bg-info-subtle",
    text: "text-info",
    dot: "bg-info",
    edge: "border border-info/15",
  },
  success: {
    fill: "bg-success-subtle",
    text: "text-success",
    dot: "bg-success",
    edge: "border border-success/15",
  },
  warning: {
    fill: "bg-warning-subtle",
    text: "text-warning",
    dot: "bg-warning",
    edge: "border border-warning/15",
  },
  danger: {
    fill: "bg-danger-subtle",
    text: "text-danger",
    dot: "bg-danger",
    edge: "border border-danger/15",
  },
  accent: {
    fill: "bg-accent-subtle",
    text: "text-accent-fg",
    dot: "bg-accent",
    edge: "border border-accent/15",
  },
};
