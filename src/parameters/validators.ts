/**
 * parameters/validators — the named-validator registry (empty default).
 *
 * Custom validators are CODE referenced by NAME (never inlined into a schema), so schemas stay
 * fully serializable (ADR-006 §4.14). The framework ships none; packs register their own via
 * `createRegistry(...)` / `.extend(...)` and reference them from `ParameterDefinition.validators`.
 */

import { createRegistry, type Registry } from "../registry";
import { type ValidatorMap } from "./types";

/** The default validator registry — empty. Populate with named validators. */
export const validatorRegistry: Registry<ValidatorMap> = createRegistry<ValidatorMap>({});
