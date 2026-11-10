import type { FailureKind } from "../../bridge/contract.ts";
import { OmeCallError } from "./ome.ts";

/** The kind a failed daemon call carries, if the error is one. */
export function failureKind(error: unknown): FailureKind | undefined {
  return error instanceof OmeCallError ? error.kind : undefined;
}
