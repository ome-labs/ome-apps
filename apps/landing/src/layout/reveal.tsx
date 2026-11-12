import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { cn } from "@ome-labs/ui-web";

type RevealProps = {
  /** Milliseconds after the element enters view, for staggering a row (motion/rise uses 60–80 ms). */
  delay?: number;
  className?: string | undefined;
  children: ReactNode;
};

/**
 * Rises into view once (motion/rise). The hidden state only applies under the `js` class the root sets before
 * paint, so prerendered pages read fully without script, and reduced motion skips the rise (styles.css).
 */
export function Reveal({ delay = 0, className, children }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        element.dataset.shown = "";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;

  return (
    <div ref={ref} data-reveal="" style={style} className={cn(className)}>
      {children}
    </div>
  );
}
