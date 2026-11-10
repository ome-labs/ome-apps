import { type UseQueryResult, useQuery } from "@tanstack/react-query";

// Reading the daemon from React: one query per method and params, kept fresh by the daemon's events.
import type { DaemonParams, DaemonResult } from "@ome-labs/api";

import type { FailureKind, RendererMethod } from "../../bridge/contract.ts";

/** A failed daemon call, with the kind the main process gave it. */
export class OmeCallError extends Error {
  constructor(
    readonly kind: FailureKind,
    message: string,
  ) {
    super(message);
    this.name = "OmeCallError";
  }
}

export function omeQueryKey<M extends RendererMethod>(
  method: M,
  params: DaemonParams<M>,
): readonly unknown[] {
  return [method, params];
}

export function useOme<M extends RendererMethod>(
  method: M,
  params: DaemonParams<M>,
  options: { enabled?: boolean } = {},
): UseQueryResult<DaemonResult<M>, Error> {
  return useQuery({
    queryKey: omeQueryKey(method, params),
    queryFn: () => callOme(method, params),
    enabled: options.enabled ?? true,
  });
}

/** A call that changes something; the events it causes refresh the queries. */
export async function callOme<M extends RendererMethod>(
  method: M,
  params: DaemonParams<M>,
): Promise<DaemonResult<M>> {
  const outcome = await window.ome.call(method, params);
  if (!outcome.ok) throw new OmeCallError(outcome.error.kind, outcome.error.message);
  return outcome.value;
}
