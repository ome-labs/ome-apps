// Saving a setting: the call, the answers it changes, and a short confirmation. Failures surface as toasts too.
import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { toast } from "@ome-labs/ui-web";

/** Daemon answers a settings change can make stale. */
const AFFECTED = new Set(["config.get", "status", "node.status", "daemon.info", "signer.status"]);

export function useSave(): (run: () => Promise<unknown>, done: string) => Promise<boolean> {
  const queries = useQueryClient();
  return useCallback(
    async (run, done) => {
      try {
        await run();
        await queries.invalidateQueries({
          predicate: (query) => AFFECTED.has(String(query.queryKey[0])),
        });
        toast.success(done);
        return true;
      } catch (failure) {
        toast.error(failure instanceof Error ? failure.message : String(failure));
        return false;
      }
    },
    [queries],
  );
}
