import { type UseQueryResult, useQuery } from "@tanstack/react-query";

// Reading the daemon from React: one query per method and params, kept fresh by the daemon's events.
import type { DaemonParams, DaemonResult } from "@ome-labs/api";

import type { RendererMethod } from "../../shared/contract.ts";

export function omeQueryKey<M extends RendererMethod>(
  method: M,
  params: DaemonParams<M>,
): readonly unknown[] {
  return [method, params];
}

export function useOme<M extends RendererMethod>(
  method: M,
  params: DaemonParams<M>,
): UseQueryResult<DaemonResult<M>, Error> {
  return useQuery({
    queryKey: omeQueryKey(method, params),
    queryFn: () => window.ome.call(method, params),
  });
}

/** A call that changes something; the events it causes refresh the queries. */
export function callOme<M extends RendererMethod>(
  method: M,
  params: DaemonParams<M>,
): Promise<DaemonResult<M>> {
  return window.ome.call(method, params);
}
