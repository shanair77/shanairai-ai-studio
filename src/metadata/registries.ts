/**
 * metadata/registries — default-fill for the framework registries (metadata-internal).
 *
 * Metadata reads registries by DI, defaulting to the built-ins. It fills its own bundle (it does NOT
 * import `execution`'s `resolveRegistries`) so the reflection layer stays independent of execution.
 */

import { sceneRegistry } from "../composition";
import { transitionRegistry } from "../transitions";
import { assetRegistry } from "../assets";
import { brandRegistry } from "../brand";
import { templateRegistry } from "../templates";
import { parameterTypeRegistry, validatorRegistry } from "../parameters";
import { type FrameworkRegistries } from "../contracts";

/** Fill any omitted registry with its framework default (all seven present). */
export const fill = (registries?: Partial<FrameworkRegistries>): Required<FrameworkRegistries> => ({
  templates: registries?.templates ?? templateRegistry,
  scenes: registries?.scenes ?? sceneRegistry,
  transitions: registries?.transitions ?? transitionRegistry,
  assets: registries?.assets ?? assetRegistry,
  brands: registries?.brands ?? brandRegistry,
  parameterTypes: registries?.parameterTypes ?? parameterTypeRegistry,
  validators: registries?.validators ?? validatorRegistry,
});
