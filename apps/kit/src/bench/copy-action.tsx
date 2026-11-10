import { useEffect, useState } from "react";

import { copyText } from "../clipboard/copy-text.ts";
import { ActionButton } from "./action-button.tsx";

const confirmMs = 1400;

/** A copy action whose icon turns into a tick for a moment after copying. */
export function CopyAction({
  value,
  label = "Copy",
  toastLabel,
  className,
}: {
  value: string;
  label?: string;
  toastLabel?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;

    const timer = setTimeout(() => setDone(false), confirmMs);
    return () => clearTimeout(timer);
  }, [done]);

  return (
    <ActionButton
      label={done ? "Copied" : label}
      icon={done ? "copy-check" : "copy"}
      className={done ? "text-success hover:text-success" : className}
      onClick={() => void copyText(value, toastLabel).then(setDone)}
    />
  );
}
