import { useEffect, useRef, useState } from "react";

import { IconButton } from "../actions/icon-button.tsx";
import { cn } from "../styling/class-names.ts";

export type CopyButtonProps = {
  value: string;
  /** What is copied, for the accessible name: "Copy address". */
  label?: string | undefined;
  size?: "sm" | "md" | undefined;
  className?: string | undefined;
};

const confirmMs = 1500;

/** Copies the full value. The icon turns into a tick for a moment and the button's name says "Copied". */
export function CopyButton({ value, label = "Copy", size = "sm", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    await navigator.clipboard.writeText(value);

    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), confirmMs);
  };

  return (
    <IconButton
      icon={copied ? "copy-check" : "copy"}
      label={copied ? "Copied" : label}
      size={size}
      onClick={copy}
      className={cn(
        "size-6 text-fg-subtle",
        copied && "text-success hover:text-success",
        className,
      )}
    />
  );
}
