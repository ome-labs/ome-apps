import { useEffect, useState } from "react";

import type { ExecutionProgress, Hex32 } from "@ome-labs/api";

/** The latest phase of this proposal's execution on this device, from the daemon's `execution` events. */
export function useExecution(proposal: Hex32): ExecutionProgress | undefined {
  const [progress, setProgress] = useState<ExecutionProgress>();
  useEffect(
    () =>
      window.ome.onEvent((event) => {
        if (event.type === "execution" && event.execution.proposal === proposal) {
          setProgress(event.execution);
        }
      }),
    [proposal],
  );
  // Kept per proposal: moving to another one drops what this one reported.
  return progress?.proposal === proposal ? progress : undefined;
}
