/**
 * execution/context — registry defaults + immutable ExecutionContext construction (ADR-007 §4.5).
 *
 * `resolveRegistries` fills the built-in resolvers; `createExecutionContext` builds a `DeepReadonly`
 * context and `Object.freeze`s the container (environment + canvas + the registries container). The
 * registries' resolver objects remain live shared singletons — they are NOT deep-frozen.
 */

import { sceneRegistry, transitionRegistry, assetRegistry, brandRegistry } from "../composition";
import { parameterTypeRegistry, validatorRegistry } from "../parameters";
import { templateRegistry } from "../templates";
import { type FrameworkRegistries } from "../contracts";
import { type ExecutionContext, type ExecutionEnvironment } from "./types";

/** Fill any omitted registry with its framework default. */
export const resolveRegistries = (registries?: Partial<FrameworkRegistries>): FrameworkRegistries => ({
  templates: registries?.templates ?? templateRegistry,
  scenes: registries?.scenes ?? sceneRegistry,
  transitions: registries?.transitions ?? transitionRegistry,
  assets: registries?.assets ?? assetRegistry,
  brands: registries?.brands ?? brandRegistry,
  parameterTypes: registries?.parameterTypes ?? parameterTypeRegistry,
  validators: registries?.validators ?? validatorRegistry,
});

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
