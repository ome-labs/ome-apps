import type { ReactNode } from "react";

import { cn } from "@ome-labs/ui-web";

/**
 * An iPhone, drawn rather than photographed so it scales sharply: a titanium band with its side buttons, a black
 * bezel, the Dynamic Island, the status bar and the home indicator around the app's canvas.
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
        "relative aspect-[1/2.05] w-[300px] rounded-[54px] bg-[linear-gradient(145deg,#8a8f99,#3a3d44_22%,#1f2025_55%,#4a4e57_85%,#9095a0)] p-[3px] shadow-[0_40px_90px_rgb(5_8_20/0.55),0_8px_24px_rgb(5_8_20/0.35)] md:w-[330px] md:rounded-[60px]",
        className,
      )}
    >
      {/* The side buttons: the action button and volume on the left, the side button on the right. */}
      <span
        aria-hidden
        className="absolute top-[17%] -left-[3px] h-[5%] w-[3px] rounded-l-sm bg-[#3a3d44]"
      />
      <span
        aria-hidden
        className="absolute top-[25%] -left-[3px] h-[8%] w-[3px] rounded-l-sm bg-[#3a3d44]"
      />
      <span
        aria-hidden
        className="absolute top-[35%] -left-[3px] h-[8%] w-[3px] rounded-l-sm bg-[#3a3d44]"
      />
      <span
        aria-hidden
        className="absolute top-[28%] -right-[3px] h-[12%] w-[3px] rounded-r-sm bg-[#3a3d44]"
      />

      <div className="size-full rounded-[51px] bg-black p-[9px] md:rounded-[57px] md:p-[10px]">
        <div className="relative flex size-full flex-col overflow-hidden rounded-[43px] bg-canvas text-fg md:rounded-[47px]">
          <div
            aria-hidden
            className="relative flex h-[50px] shrink-0 items-center justify-between px-7 pt-1"
          >
            <span className="text-[15px] font-semibold text-fg">9:41</span>
            <span className="absolute top-[11px] left-1/2 h-[28px] w-[31%] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1.5">
              <span className="flex items-end gap-[2px]">
                {[4, 6, 8, 10].map((height) => (
                  <span key={height} className="w-[3px] rounded-[1px] bg-fg" style={{ height }} />
                ))}
              </span>
              <span className="relative h-[11px] w-[22px] rounded-[3.5px] border border-fg/45 p-[1.5px]">
                <span className="block h-full w-[78%] rounded-[1.5px] bg-fg" />
              </span>
            </span>
          </div>
          {children}
          <span
            aria-hidden
            className="absolute bottom-2 left-1/2 h-[5px] w-[35%] -translate-x-1/2 rounded-full bg-fg"
          />
        </div>
      </div>
    </div>
  );
}
