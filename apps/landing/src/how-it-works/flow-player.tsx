import { cn } from "@ome-labs/ui-web";

import { PixelArt } from "../art/pixel-art.tsx";
import { useInView } from "../motion/use-in-view.ts";
import { useLoop } from "../motion/use-loop.ts";
import type { Flow } from "./flows.ts";

/**
 * A flow that plays: the stage dissolves from scene to scene (motion/scene, stepped like the dither) while the list
 * moves its highlight, 3.2 s a step while on screen. Choosing a step jumps to it.
 */
export function FlowPlayer({ flow }: { flow: Flow }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [active, setActive] = useLoop(flow.steps.length, 3200, inView);

  return (
    <div
      ref={ref}
      className="glass mx-auto flex w-full max-w-[1200px] flex-col gap-4 rounded-[30px] p-3 lg:flex-row lg:gap-8 lg:p-4"
    >
      <div className="relative aspect-[8/5] w-full shrink-0 overflow-hidden rounded-[20px] lg:w-[640px]">
        {flow.steps.map(([scene], index) => (
          <PixelArt
            key={scene}
            scene={scene}
            alt=""
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-600 ease-[steps(6)]",
              index === active ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
        <span className="absolute top-3.5 left-3.5 rounded-full bg-ink/70 px-3 py-1.5 font-mono text-xs">
          Step {active + 1} of {flow.steps.length}
        </span>
      </div>

      <ol className="flex flex-1 flex-col gap-1 px-1 pb-1 lg:gap-1.5 lg:py-2 lg:pr-1 lg:pl-0">
        {flow.steps.map(([scene, title, body], index) => {
          const on = index === active;

          return (
            <li key={scene}>
              <button
                type="button"
                aria-current={on ? "step" : undefined}
                onClick={() => setActive(index)}
                className={cn(
                  "flex w-full gap-3.5 rounded-2xl px-3 py-2.5 text-left transition-colors duration-300 lg:px-4 lg:py-3.5",
                  on ? "bg-white/12" : "hover:bg-white/6",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs font-medium transition-colors",
                    on ? "bg-amber text-brand-night" : "bg-white/12",
                  )}
                >
                  {index + 1}
                </span>
                <span className="flex flex-col gap-1">
                  <span
                    className={cn(
                      "text-[15px] font-semibold lg:text-[17px]",
                      on ? "text-white" : "text-white/80",
                    )}
                  >
                    {title}
                  </span>
                  <span
                    className={cn(
                      "text-[13px] leading-[1.45] lg:text-sm",
                      on ? "text-white/92" : "text-white/66",
                    )}
                  >
                    {body}
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
