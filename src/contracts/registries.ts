/**
 * contracts/registries — the canonical framework registries bundle (ADR-008 §4.2).
 *
 * `FrameworkRegistries` is the ONE shared definition of "the set of framework registries" that
 * `execution`, `requests`, and `metadata` consume — extracted from `execution` so no layer owns it.
 * `RegistryFamily` names the families for descriptors/reporting. Type-only, no runtime, no React.
 */

import { type SceneResolver } from "../composition";
import { type TransitionResolver } from "../transitions";
import { type AssetRegistry } from "../assets";
import { type BrandRegistry } from "../brand";
import { type ParameterTypeResolver, type ValidatorResolver } from "../parameters";
import { type TemplateResolver } from "../templates";

/** The resolvers a top-level consumer (execution, metadata) reads. */
export type FrameworkRegistries = {
  templates: TemplateResolver;
  scenes: SceneResolver;
  transitions: TransitionResolver;
  assets: AssetRegistry;
  brands: BrandRegistry;
  parameterTypes?: ParameterTypeResolver;
  validators?: ValidatorResolver;
};

/** The registry-family names (used by descriptors + reporting). */
export type RegistryFamily =
  | "scenes"
  | "transitions"
  | "assets"
  | "brands"
  | "templates"
  | "parameterTypes"
  | "validators";
