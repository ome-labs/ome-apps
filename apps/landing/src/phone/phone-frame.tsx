import type { ReactNode } from "react";

import { cn } from "@ome-labs/ui-web";

/**
 * A phone, drawn rather than photographed: a dark body, the island, the status bar and the home indicator around a
 * light screen. The app inside is real markup in the light theme, so it scales sharply.
 */
export function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[1/2.06] w-[300px] rounded-[48px] border-2 border-[#3a3d45] bg-[#1b1d22] p-[10px] shadow-[0_30px_80px_rgb(5_8_20/0.5),inset_0_1px_2px_rgb(255_255_255/0.12)] md:w-[330px] md:rounded-[53px] md:p-[12px]",
        className,
      )}
    >
      <div className="relative flex size-full flex-col overflow-hidden rounded-[39px] bg-brand-paper text-fg md:rounded-[43px]">
        <div
          aria-hidden
          className="relative flex h-[50px] shrink-0 items-center justify-between px-7"
        >
          <span className="text-[15px] font-semibold text-brand-night">9:41</span>
          <span className="absolute top-2.5 left-1/2 h-8 w-[34%] -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <span className="h-[11px] w-[18px] rounded-[2px] bg-brand-night" />
            <span className="h-[11px] w-6 rounded-[3px] border-[1.5px] border-brand-night" />
          </span>
        </div>
        {children}
        <span
          aria-hidden
          className="absolute bottom-2 left-1/2 h-[5px] w-[36%] -translate-x-1/2 rounded-full bg-brand-night"
        />
      </div>
    </div>
  );
}
