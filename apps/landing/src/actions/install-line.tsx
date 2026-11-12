import { useEffect, useState } from "react";

import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";

import { installCommand } from "../site/links.ts";

/** The one-line install with a copy button that turns green for 1.6 s once it has copied (motion/fast). */
export function InstallLine({ className }: { className?: string | undefined }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);

    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
    } catch {
      // Without clipboard access the command is still selectable text.
    }
  }

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-2.5 rounded-full border bg-ink/75 py-1.5 pr-1.5 pl-4 shadow-[0_10px_30px_rgb(5_8_20/0.3)] backdrop-blur-xl transition-colors md:gap-3 md:py-2 md:pr-2 md:pl-5",
        copied ? "border-white/40" : "border-white/18",
        className,
      )}
    >
      <code className="min-w-0 truncate font-mono text-[11.5px] text-white select-all md:text-sm">
        <span aria-hidden className="mr-2.5 hidden text-brand-haze md:inline">
          $
        </span>
        {installCommand}
      </code>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full p-2 text-[13px] font-medium text-brand-night transition-colors duration-150 md:px-3",
          copied ? "bg-ok" : "bg-white hover:bg-[#e3eafb]",
        )}
      >
        <Icon name={copied ? "check" : "copy"} size={16} />
        <span className="sr-only md:not-sr-only">{copied ? "Copied" : "Copy"}</span>
        <span aria-live="polite" className="sr-only">
          {copied ? "Install command copied" : ""}
        </span>
      </button>
    </div>
  );
}
