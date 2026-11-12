import { useEffect, useRef, useState, type RefObject } from "react";

/** Whether an element is on screen, so loops (tabs, flows, resharing) only play while someone can see them. */
export function useInView<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      {
        threshold: 0.25,
      },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}
