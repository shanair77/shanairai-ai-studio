/**
 * parameters/definition — the parameter-type factory.
 *
 * `defineParameterType<V>` is an identity function that captures the value type `V`
 * (mirrors `defineScene` / `defineTemplate`). It adds no runtime behavior.
 */

import { type ParameterTypeDefinition } from "./types";

/** Bind a parameter type, preserving its value type `V` for typed authoring. */
export const defineParameterType = <V>(
  spec: ParameterTypeDefinition<V>,
): ParameterTypeDefinition<V> => spec;
