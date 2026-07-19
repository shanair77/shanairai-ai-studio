/**
 * metadata/ — the Metadata Engine (ADR-009, Phase 26 MVP): a pure, stateless reflection layer.
 *
 * `describe*` project each registry's Definitions into serializable, code-free descriptors;
 * `getCapabilities` rolls up declared capabilities; `describeFramework` is the aggregate snapshot.
 * The output is JSON-safe and deterministic (sorted by `key`). This layer NEVER executes, renders,
 * resolves/loads an asset, mutates a registry, or becomes a source of truth — Definitions are
 * authoritative. It depends downward on `contracts` (`FrameworkRegistries`), family types, and
 * `errors` (`sanitize`); nothing imports it. Analysis, dependency graphs, execution-stage
 * description, scene metadata, and third-party describers are deferred (ADR-009 §4.10).
 */

export {
  describeFramework,
  describeScenes,
  describeTransitions,
  describeAssets,
  describeBrands,
  describeTemplates,
  describeTemplate,
  describeParameterTypes,
  describeValidators,
  describeRegistries,
} from "./describe";
export { getCapabilities } from "./capabilities";
export { SCHEMA_VERSION } from "./version";
export type {
  DescriptorIdentity,
  AssetSourceSummary,
  SceneDescriptor,
  TransitionDescriptor,
  AssetDescriptor,
  BrandDescriptor,
  TemplateMetaSummary,
  TemplateDescriptor,
  ParameterTypeDescriptor,
  ValidatorDescriptor,
  RegistryDescriptor,
  CapabilityReport,
  FrameworkDescriptor,
} from "./types";
