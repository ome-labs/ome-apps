import type { Tone } from "@ome-labs/format";

/** The fill and text for each tone (Figma page 29), shared by pills, tags, banners and step badges. */
export const toneClasses: Record<Tone | "accent", { fill: string; text: string; dot: string }> = {
  neutral: { fill: "bg-neutral-subtle", text: "text-neutral", dot: "bg-neutral" },
  info: { fill: "bg-info-subtle", text: "text-info", dot: "bg-info" },
  success: { fill: "bg-success-subtle", text: "text-success", dot: "bg-success" },
  warning: { fill: "bg-warning-subtle", text: "text-warning", dot: "bg-warning" },
  danger: { fill: "bg-danger-subtle", text: "text-danger", dot: "bg-danger" },
  accent: { fill: "bg-accent-subtle", text: "text-accent-fg", dot: "bg-accent" },
};
