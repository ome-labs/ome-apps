import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge has to know the kit's own utilities, or it treats `type-label-s` and `text-fg` as the same
// group and drops one of them.
const merge = extendTailwindMerge<"typography" | "control-height">({
  extend: {
    classGroups: {
      typography: [{ type: [(value: string) => value.length > 0] }],
      "control-height": [{ "h-control": ["sm", "md", "lg"] }],
    },
  },
});

/** Joins class names and lets later Tailwind classes override earlier ones. */
export function cn(...values: ClassValue[]): string {
  return merge(clsx(values));
}
