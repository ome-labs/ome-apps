import { useId, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@ome-labs/ui-web";
import { AnimatePresence, motion } from "motion/react";

import { useInView } from "../motion/use-in-view.ts";
import { PhoneApproval } from "../phone/phone-approval.tsx";
import { AppScreen } from "../screens/app-screen.tsx";
import { tour } from "./tour.ts";

/**
 * A tour of the desktop app: a tab per part of a vault. It advances on its own every 6 s (motion/tab) while it's
 * on screen and nobody is pointing at it; choosing a tab stops the autoplay for good.
 */
export function AppTour() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [held, setHeld] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [ref, inView] = useInView<HTMLDivElement>();
  const id = useId();
  const stop = tour[active] ?? tour[0];

  function choose(index: number, focus = false) {
    setAutoplay(false);
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
    <div
      ref={ref}
      className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-5 md:gap-8"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div
        role="tablist"
        aria-label="The desktop app"
        className="glass-soft flex max-w-full gap-1 overflow-x-auto rounded-full p-1 [scrollbar-width:none]"
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
                "relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-3 py-[7px] text-[13px] font-medium transition-colors duration-200 md:px-[18px] md:py-[9px] md:text-sm",
                on
                  ? "bg-white text-brand-night"
                  : "text-white/90 hover:bg-white/10 hover:text-white",
              )}
            >
              {item.tab}
              {item.soon ? (
                <span
                  className={cn(
                    "hidden rounded-full px-1.5 font-mono text-[10px] md:inline",
                    on ? "bg-brand-night/8" : "bg-white/15",
                  )}
                >
                  soon
                </span>
              ) : null}
              {on && autoplay ? (
                <span
                  aria-hidden
                  key={active}
                  onAnimationEnd={() => setActive((active + 1) % tour.length)}
                  style={{ animationPlayState: held || !inView ? "paused" : "running" }}
                  className="tab-progress absolute bottom-0 left-0 h-[3px] bg-brand-lake"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        className="flex w-full flex-col items-center gap-5 md:gap-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stop.tab}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.995 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full justify-center"
          >
            {stop.screen === "phone" ? (
              <div className="flex w-full justify-center py-2 md:py-6">
                <PhoneApproval className="w-[260px] md:w-[300px]" />
              </div>
            ) : (
              <div className="w-full overflow-hidden rounded-[14px] max-md:h-[300px]">
                <AppScreen
                  id={stop.screen}

                  className="max-md:w-[620px] max-md:max-w-none"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="glass-soft w-full rounded-2xl px-5 pt-1.5 pb-5 md:px-8 md:pt-2.5 md:pb-7">
          <ol className="grid gap-x-10 gap-y-0 md:grid-cols-4">
            {stop.points.map(([title, body], index) => (
              <li
                key={title}
                className={cn(
                  "flex flex-col gap-2 border-t border-white/25 py-3.5 md:pb-0",
                  index > 1 && "max-md:hidden",
                )}
              >
                <span className="font-mono text-xs text-haze-soft">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[17px] font-semibold md:text-lg">{title}</h3>
                <p className="text-sm leading-[1.5] text-white/88 md:text-[15px]">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
