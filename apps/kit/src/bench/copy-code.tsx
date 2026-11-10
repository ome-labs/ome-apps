import { cn } from "@ome-labs/ui-web";

import { copyText } from "../clipboard/copy-text.ts";

/** Inline code that copies itself: a CSS variable, a class name, a hex value. */
export function CopyCode({
  value,
  toastLabel = "Copied",
  className,
}: {
  value: string;
  toastLabel?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => void copyText(value, toastLabel)}
      className={cn(
        "focus-ring inline-flex max-w-full min-w-0 cursor-pointer items-center rounded-xs text-left type-mono-s",
        "decoration-dotted underline-offset-4 hover:underline",
        className,
      )}
    >
      <span className="truncate">{value}</span>
    </button>
  );
}
