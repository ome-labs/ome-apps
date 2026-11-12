import { useEffect, useState } from "react";

/**
 * Steps through `count` states every `every` ms while `playing`, for the site's small looping animations. Choosing
 * a state stops the loop there, so it doesn't move on under the reader; reduced motion never starts it.
 */
export function useLoop(
  count: number,
  every: number,
  playing: boolean,
): [number, (index: number) => void] {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(false);
  const running = playing && !chosen;

  useEffect(() => {
    if (!running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), every);

    return () => window.clearInterval(timer);
  }, [count, every, running]);

  function choose(next: number) {
    setChosen(true);
    setIndex(next);
  }

  return [index, choose];
}
