import { useId, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@ome-labs/ui-web";
import { AnimatePresence, motion } from "motion/react";

import { AppScreen } from "../app-preview/app-screen.tsx";
import { tour } from "./tour.ts";

/**
 * The screens are a deck. The chosen one is lifted from the back of the stack, where the peeking layers are, and
 * settles in front on a soft spring; the one it replaces drops forward off the deck, above it, and fades.
 */
const settle = { type: "spring", duration: 0.6, bounce: 0.12 } as const;
const enter = { opacity: 0.5, y: -36, scale: 0.92, filter: "blur(2px)", zIndex: 1 };
const shown = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", zIndex: 1 };
const leave = {
  opacity: 0,
  y: 56,
  scale: 1.01,
  filter: "blur(6px)",
  zIndex: 2,
  transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
} as const;

/**
 * A tour of the desktop app: a tab per part of a vault. It moves only when the reader chooses a tab; the white
 * pill slides to the chosen one.
 */
export function AppTour() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const stop = tour[active] ?? tour[0];

  function choose(index: number, focus = false) {
    setActive(index);
    if (focus) tabs.current[index]?.focus();
  }

  // The tab list's keys (WAI-ARIA tabs): arrows move between tabs, Home and End jump to the ends.
  function onKeyDown(event: KeyboardEvent) {
    const last = tour.length - 1;
    const next = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;

    event.preventDefault();
    choose(next, true);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-5 md:gap-8">
      <div
        role="tablist"
        aria-label="The desktop app"
        className="glass-soft isolate flex max-w-full gap-1 overflow-x-auto rounded-full p-1 [scrollbar-width:none]"
      >
        {tour.map((item, index) => {
          const on = index === active;

          return (
            <button
              key={item.tab}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={on}
              aria-controls={`${id}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => choose(index)}
              onKeyDown={onKeyDown}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-[7px] text-[13px] font-medium transition-colors duration-200 md:px-[18px] md:py-[9px] md:text-sm",
                on ? "text-brand-night" : "text-white/90 hover:bg-white/10 hover:text-white",
              )}
            >
              {on ? (
                <motion.span
                  aria-hidden
                  layoutId={`${id}-pill`}
                  transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
                  className="absolute inset-0 -z-10 rounded-full bg-white"
                />
              ) : null}
              {item.tab}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        className="relative flex w-full flex-col items-center"
      >
        {/* The rest of the stack, peeking out above the top screen. */}
        <span
          aria-hidden
          className="absolute inset-x-[8%] -top-6 bottom-6 rounded-[14px] border border-white/20 bg-white/16 max-md:hidden"
        />
        <span
          aria-hidden
          className="absolute inset-x-[4%] -top-3 bottom-3 rounded-[14px] border border-white/30 bg-white/28 max-md:hidden"
        />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={stop.tab}
            initial={enter}
            animate={shown}
            exit={leave}
            transition={settle}
            className="relative flex w-full origin-top flex-col items-center"
          >
            <div className="w-full overflow-hidden rounded-[14px] max-md:h-[300px]">
              <AppScreen id={stop.screen} className="max-md:w-[620px] max-md:max-w-none" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
