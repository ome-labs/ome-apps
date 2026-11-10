import type { ColorName } from "@ome-labs/tokens";

/** The semantic roles in the groups the colour page shows them in. */
export const roleGroups: { title: string; description: string; roles: ColorName[] }[] = [
  {
    title: "Surfaces",
    description:
      "Canvas under everything, surfaces for content, raised for overlays, sunken for wells.",
    roles: ["canvas", "surface", "raised", "sunken", "hover", "selected", "inverse"],
  },
  {
    title: "Text",
    description: "Primary for content, muted for supporting text, subtle for metadata.",
    roles: ["fg", "fg-muted", "fg-subtle", "fg-disabled", "fg-inverse"],
  },
  {
    title: "Lines",
    description:
      "Hairlines between rows, borders on controls, strong borders on focus-adjacent edges.",
    roles: ["line-subtle", "line", "line-strong"],
  },
  {
    title: "Accent",
    description: "Lake, the one accent: the primary action, selection and links.",
    roles: [
      "accent",
      "accent-hover",
      "accent-pressed",
      "accent-subtle",
      "accent-fg",
      "on-accent",
      "focus",
    ],
  },
  {
    title: "Status",
    description:
      "Each status is text on its own tint; danger also has a solid fill for destructive buttons.",
    roles: [
      "success",
      "success-subtle",
      "warning",
      "warning-subtle",
      "danger",
      "danger-subtle",
      "danger-solid",
      "info",
      "info-subtle",
      "neutral",
      "neutral-subtle",
    ],
  },
  {
    title: "Brand",
    description:
      "The palette of the mark and the art: night, lake, haze, paper, sun. The same in both themes.",
    roles: ["brand-night", "brand-lake", "brand-haze", "brand-paper", "brand-sun", "brand-white"],
  },
];

const textRoles = new Set<ColorName>([
  "fg",
  "fg-muted",
  "fg-subtle",
  "fg-disabled",
  "fg-inverse",
  "accent-fg",
  "on-accent",
  "success",
  "warning",
  "danger",
  "info",
  "neutral",
]);

/** The Tailwind class a role is usually used through. */
export function utilityFor(role: ColorName) {
  if (textRoles.has(role)) return `text-${role}`;
  if (role.startsWith("line")) return `border-${role}`;
  if (role === "focus") return "ring-focus";

  return `bg-${role}`;
}
