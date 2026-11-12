import { cn } from "@ome-labs/ui-web";

import { PixelArt } from "../art/pixel-art.tsx";
import { useInView } from "../motion/use-in-view.ts";
import { useLoop } from "../motion/use-loop.ts";

const steps = [
  {
    scene: "new-proposal",
    title: "Propose",
    body: "Alice proposes 250 USDC to dave, with a memo.",
  },
  {
    scene: "review",
    title: "Check",
    body: "Bob’s own device rebuilds it and shows exactly what he signs.",
  },
  {
    scene: "ready",
    title: "Approve",
    body: "Enough members approve. Nobody has to be online together.",
  },
  {
    scene: "executed",
    title: "Prove",
    body: "Any member executes. The chain sees a valid proof, nothing else.",
  },
] as const;

/** A payment's four steps on a track; the lit step walks along it every 2.8 s while it's on screen. */
export function PaymentSteps() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [active, setActive] = useLoop(steps.length, 2800, inView);

  return (
    <div ref={ref} className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 md:gap-7">
      <div aria-hidden className="relative h-3">
        <span className="absolute inset-x-0 top-[5px] h-0.5 bg-white/28" />
        <span
          className="absolute top-[5px] left-0 h-0.5 bg-white transition-[width] duration-700 ease-emphasized"
          style={{ width: `${(active / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step, index) => (
          <span
            key={step.title}
            className={cn(
              "absolute top-0 size-3 rounded-full transition-colors duration-500",
              index <= active ? "bg-amber" : "bg-white/35",
            )}
            style={{
              left: `calc(${(index / (steps.length - 1)) * 100}% - ${index === 0 ? 0 : index === steps.length - 1 ? 12 : 6}px)`,
            }}
          />
        ))}
      </div>

      <ol className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        {steps.map((step, index) => {
          const on = index === active;

          return (
            <li key={step.title} className="h-full">
              <button
                type="button"
                aria-current={on ? "step" : undefined}
                onClick={() => setActive(index)}
                className={cn(
                  "flex h-full w-full flex-col gap-3 rounded-[20px] border p-2.5 text-left backdrop-blur-xl transition-[background-color,border-color,transform,box-shadow] duration-300 ease-emphasized md:p-3",
                  on
                    ? "-translate-y-1 border-white/40 bg-deep/78 shadow-[0_16px_48px_rgb(5_8_20/0.35)]"
                    : "border-white/12 bg-deep/50",
                )}
              >
                <PixelArt
                  scene={step.scene}
                  alt=""
                  className="aspect-[5/3] h-auto w-full rounded-xl object-cover"
                />
                <span className="flex flex-col gap-1.5 px-1 pb-1.5">
                  <span className="flex items-center gap-2">
                    <span className={cn("font-mono text-xs", on ? "text-amber" : "text-haze-soft")}>
                      {index + 1}
                    </span>
                    <span className="text-[15px] font-semibold md:text-[17px]">{step.title}</span>
                  </span>
                  <span className="text-[13px] leading-[1.45] text-white/88 md:text-sm">
                    {step.body}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
