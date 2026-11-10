import { useEffect, useState } from "react";

/** Unix seconds, ticking once a second, for countdowns such as the unlock window. */
export function useNow(): number {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  return now;
}
