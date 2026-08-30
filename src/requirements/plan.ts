import { type AssetManifest, type AssetRequirement } from "../manifest";
import {
  type AssetReference,
  type PlannedRequirement,
  type ReferenceOrigin,
  type RequirementSet,
  type UnresolvedReference,
} from "./types";

/**
 * Turning what a composition names into what somebody has to produce.
 *
 * The references say which assets a render will reach for. The manifest says
 * what each of those is, where it lives, how long it should be and whether it
 * was generated, licensed or owned. A requirement plan is the intersection —
 * and the intersection is the whole value, because a name alone tells a planner
 * nothing about what producing it would involve.
 */

/**
 * Assemble references into requirements.
 *
 * DEDUPLICATED BY NAME. One shot used in two scenes is one asset to produce,
 * and reporting it twice would double a cost estimate. Multiplicity is not
 * lost so much as irrelevant: nothing downstream does anything per-occurrence,
 * and the `via` list records every way the render reaches it.
 *
 * Order follows first reference rather than the manifest, so a plan reads in
 * roughly the order the film uses things.
 */
export function assembleRequirements(
  references: readonly AssetReference[],
  manifest: AssetManifest | undefined,
): RequirementSet {
  const described = new Map<string, AssetRequirement>(
    (manifest?.requirements ?? []).map((requirement) => [requirement.name, requirement]),
  );

  const order: string[] = [];
  const origins = new Map<string, Set<ReferenceOrigin>>();
  const scenes = new Map<string, string>();

  for (const reference of references) {
    if (!origins.has(reference.name)) {
      order.push(reference.name);
      origins.set(reference.name, new Set());
    }

    origins.get(reference.name)?.add(reference.via);

    // The first scene to use it, which is the most useful one to name.
    if (reference.scene !== undefined && !scenes.has(reference.name)) {
      scenes.set(reference.name, reference.scene);
    }
  }

  const requirements: PlannedRequirement[] = [];
  const unresolved: UnresolvedReference[] = [];

  for (const name of order) {
    const via = [...(origins.get(name) ?? [])];
    const requirement = described.get(name);
    const scene = scenes.get(name);

    if (requirement === undefined) {
      unresolved.push({ name, via, ...(scene === undefined ? {} : { scene }) });
      continue;
    }

    requirements.push({
      name: requirement.name,
      kind: requirement.kind,
      path: requirement.path,
      purpose: requirement.purpose,
      source: requirement.source,
      status: requirement.status,
      // The manifest's own scene label is the authored one and outranks the
      // label of whichever scene happened to reference it first.
      ...(requirement.scene !== undefined
        ? { scene: requirement.scene }
        : scene === undefined
          ? {}
          : { scene }),
      ...(requirement.durationSeconds === undefined
        ? {}
        : { durationSeconds: requirement.durationSeconds }),
      ...(requirement.tolerance === undefined ? {} : { tolerance: requirement.tolerance }),
      ...(requirement.loops === undefined ? {} : { loops: requirement.loops }),
      ...(requirement.cropPermitted === undefined
        ? {}
        : { cropPermitted: requirement.cropPermitted }),
      ...(requirement.channels === undefined ? {} : { channels: requirement.channels }),
      ...(requirement.licence === undefined ? {} : { licence: requirement.licence }),
      via,
    });
  }

  return { requirements, unresolved };
}
