/**
 * contracts/resolveRegistries — the canonical default-fill for the framework registries bundle.
 *
 * The ONE implementation that fills an optional/partial `FrameworkRegistries` with the framework's
 * built-in registries. `execution` and `metadata` both consume it (previously each carried its own
 * identical copy). Returns `Required<FrameworkRegistries>` so callers get all seven resolvers.
 *
 * This is `contracts`' only runtime utility — the rest of the layer is type-only, so consumers that
 * import types alone (e.g. `requests`) stay weightless.
 */

import { sceneRegistry } from "../composition";
import { transitionRegistry } from "../transitions";
import { assetRegistry } from "../assets";
import { brandRegistry } from "../brand";
import { templateRegistry } from "../templates";
import { parameterTypeRegistry, validatorRegistry } from "../parameters";
import { type FrameworkRegistries } from "./registries";

/** Fill any omitted registry with its framework default (all seven present). */
export const resolveRegistries = (
  registries?: Partial<FrameworkRegistries>,
): Required<FrameworkRegistries> => ({
  templates: registries?.templates ?? templateRegistry,
  scenes: registries?.scenes ?? sceneRegistry,
  transitions: registries?.transitions ?? transitionRegistry,
  assets: registries?.assets ?? assetRegistry,
  brands: registries?.brands ?? brandRegistry,
  parameterTypes: registries?.parameterTypes ?? parameterTypeRegistry,
  validators: registries?.validators ?? validatorRegistry,
});
