import { useEffect, useState } from "react";

import { Icon } from "@ome-labs/icons/web";
import { cn } from "@ome-labs/ui-web";

import { isNight } from "../sky/palette.ts";

/**
 * The lake's clock in the corner (desktop only): the hour of the section in the middle of the screen, so scrolling
 * reads as a day passing. The layout remounts it for each page, so it watches that page's sections.
 */
export function LakeClock() {
  const [hour, setHour] = useState<string>();
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-hour]");

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (current) setHour((current.target as HTMLElement).dataset.hour);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const section of sections) observer.observe(section);

    // The footer is the ground, not an hour: the clock steps aside so it doesn't sit on the footer's text.
    const footer = document.querySelector("footer");
    const ground = new IntersectionObserver(([entry]) =>
      setAtFooter(entry?.isIntersecting ?? false),
    );
    if (footer) ground.observe(footer);

    return () => {
      observer.disconnect();
      ground.disconnect();
    };
  }, []);

  if (!hour) return null;
  const night = isNight(hour);

  return (
    <p
      aria-hidden
      className={cn(
        "glass-soft pointer-events-none fixed bottom-8 left-8 z-30 hidden items-center gap-2 rounded-full px-3.5 py-2 font-mono text-[13px] text-white transition-opacity duration-300 lg:flex",
        atFooter && "opacity-0",
      )}
    >
      <Icon
        name={night ? "moon" : "sun"}
        size={16}
        className={night ? "text-haze-soft" : "text-amber"}
      />
      <span className="tabular-nums">{hour}</span>
      <span className="text-white/60">Lake Texcoco</span>
    </p>
  );
}
