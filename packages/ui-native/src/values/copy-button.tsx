import { useEffect, useRef, useState } from "react";

import * as Clipboard from "expo-clipboard";

import { IconButton } from "../actions/icon-button.tsx";

export type CopyButtonProps = {
  value: string;
  /** What is copied: "Copy address". */
  label?: string | undefined;
  className?: string | undefined;
};

const confirmMs = 1500;

/** Copies the full value; the icon turns into a tick and the label into "Copied" for a moment. */
export function CopyButton({ value, label = "Copy", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    await Clipboard.setStringAsync(value);

    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), confirmMs);
  };

  return (
    <IconButton
      icon={copied ? "copy-check" : "copy"}
      label={copied ? "Copied" : label}
      tone={copied ? "success" : "fg-subtle"}
      onPress={copy}
      className={className}
    />
  );
}
