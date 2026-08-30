/**
 * requirements — what a SPECIFIC render needs, rather than what a pack holds.
 *
 * Pure: no filesystem, no probing, no bundler, no browser. It reads the
 * composition a template just produced and intersects the assets it names with
 * the manifest that describes them.
 *
 * The collectors are INTERNAL. Their signatures name the resolved composition
 * and the scene and brand resolvers, none of which the package publishes — so
 * exporting them would drag implementation types into the public declaration,
 * which a committed guard refuses. The package publishes the vocabulary in
 * `./types` and the capability through `compiler.requirementsFor`.
 */

export { collectReferences } from "./references";
export { assembleRequirements } from "./plan";
export type {
  AssetReference,
  PlannedRequirement,
  ReferenceOrigin,
  RequirementSet,
  UnresolvedReference,
} from "./types";
