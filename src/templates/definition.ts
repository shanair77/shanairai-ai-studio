/**
 * templates/definition — the template definition factory.
 *
 * `defineTemplate<P>` is an identity function that captures the param type `P` so a
 * `TemplateComposition`'s `params` are compile-time typed at the call site (mirrors
 * `defineScene` / `defineBrand`). It adds no runtime behavior.
 */

import { type TemplateDefinition, type TemplateParams } from "./types";

/** Bind a template pack, preserving its param type `P` for typed authoring + selection. */
export const defineTemplate = <P extends TemplateParams>(
  spec: TemplateDefinition<P>,
): TemplateDefinition<P> => spec;

