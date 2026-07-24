/**
 * templates/definition — the template definition factory.
 *
 * `createTemplateDefinition<P>` is an identity function that captures the param type `P` so a
 * `TemplateComposition`'s `params` are compile-time typed at the call site (mirrors
 * `createSceneDefinition` / `createBrandDefinition`). It adds no runtime behavior.
 */

import { type TemplateDefinition, type TemplateParams } from "./types";

/** Bind a template pack, preserving its param type `P` for typed authoring + selection. */
export const defineTemplate = <P extends TemplateParams>(
  spec: TemplateDefinition<P>,
): TemplateDefinition<P> => spec;

/**
 * Internal compatibility alias for the pre-SDK name. `defineTemplate` is the canonical authoring name
 * (Phase S3); remaining internal call sites migrate in a later cleanup commit.
 */
export const createTemplateDefinition = defineTemplate;
