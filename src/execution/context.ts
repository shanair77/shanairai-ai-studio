/**
 * execution/context — immutable ExecutionContext construction (ADR-007 §4.5).
 *
 * `createExecutionContext` builds a `DeepReadonly` context and `Object.freeze`s the container
 * (environment + canvas + the registries container). The registries' resolver objects remain live
 * shared singletons — they are NOT deep-frozen. The registries default-fill is the canonical
 * `resolveRegistries` from `contracts`.
 */

import { type FrameworkRegistries } from "../contracts";
import { type ExecutionContext, type ExecutionEnvironment } from "./types";

/** Build the frozen execution context (top-level freeze; registries stay live). */
export const createExecutionContext = (
  environment: ExecutionEnvironment,
  registries: FrameworkRegistries,
): ExecutionContext => {
  const canvas = Object.freeze({ ...environment.canvas });
  const env = Object.freeze({ ...environment, canvas });
  const regs = Object.freeze({ ...registries }); // container frozen; resolver objects remain live
  return Object.freeze({ environment: env, registries: regs }) as ExecutionContext;
};

/** Deterministic default execution id derived from the request id (never random). */
export const deriveExecutionId = (requestId: unknown): string =>
  `exec:${typeof requestId === "string" && requestId.length > 0 ? requestId : "anonymous"}`;
