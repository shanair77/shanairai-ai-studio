/**
 * parameters/ — the typed, config-driven Parameter Engine (ADR-006, Phase 21 MVP).
 *
 * A template's inputs become a declarative, serializable `ParameterSchema`: `ParameterType`s own
 * BEHAVIOR (parse/validate/serialize) and are the registry family; each `ParameterDefinition` owns
 * POLICY (required/default/constraints/conditions/metadata/ui) and is embedded in the schema. The
 * pure resolver folds caller values + defaults + validation into deeply-frozen `ResolvedParameters`.
 *
 * Architectural boundary (ADR-006 §5–§6): this engine validates DATA ONLY. It has NO React, NO
 * Context/Provider/Hooks; it never resolves/loads assets or brands (name checks only), never
 * renders, never executes templates, never assembles compositions. It depends downward on
 * `registry`, `config`, `assets` (types), and `brand` (type) — nothing imports it except `templates`.
 */

export type {
  ParameterValue,
  ParameterTypeName,
  EnumOption,
  ParameterConstraints,
  ParameterCondition,
  ParameterConditions,
  ParameterUIHints,
  ParameterMetadata,
  ParameterCapabilities,
  ParameterDefinition,
  ParameterGroup,
  ParameterSchema,
  ParameterIssue,
  DeepReadonly,
  ResolvedParameters,
  ParameterContext,
  ParameterTypeDefinition,
  ParameterTypeMap,
  ParameterTypeResolver,
  Validator,
  ValidatorMap,
  ValidatorResolver,
} from "./types";

// `Result` now lives in `errors` (the canonical, shared primitive); re-exported here for back-compat.
export { type Result, ok, err } from "../errors";

export { createParameterTypeDefinition } from "./definition";
// `parameterTypeRegistry = createRegistry(builtinParameterTypes)` — the built-in vocabulary is the
// single definition site; the registry wraps it (mirrors builtinScenes/sceneRegistry). Extend or
// replace it like any other family.
export { builtinParameterTypes, parameterTypeRegistry } from "./ParameterTypeRegistry";
export { validatorRegistry } from "./validators";
export { validateParameters, resolveParameters } from "./resolve";
