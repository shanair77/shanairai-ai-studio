import { type AssetRequirement } from "../manifest";

/**
 * The vocabulary of a requirement plan.
 *
 * Kept apart from the code that produces it, and deliberately so: the collector
 * needs the resolved composition and the scene and brand resolvers to do its
 * work, and those are implementation types the package does not publish. A
 * committed guard fails the build if one reaches the public declaration, which
 * is how this separation stays real rather than aspirational.
 *
 * Everything here is plain data. No functions, no components, nothing that
 * cannot cross a process boundary.
 */

/** How a render reaches an asset. */
export type ReferenceOrigin = "scene" | "audio" | "music" | "brand";

/** An asset name, and why this composition mentions it. */
export interface AssetReference {
  /** The registered asset name. */
  readonly name: string;
  /** Where the reference came from, for diagnosing a surprising plan. */
  readonly via: ReferenceOrigin;
  /** The scene's label, when a scene is what referenced it. */
  readonly scene?: string;
}

/** One asset this render needs, with everything known about it. */
export interface PlannedRequirement {
  /** The registered asset name. */
  readonly name: string;
  readonly kind: AssetRequirement["kind"];
  /** Path relative to `public/`. */
  readonly path: string;
  /** What it is FOR — the sentence somebody producing it needs to read. */
  readonly purpose: string;
  /**
   * Where it came from, which decides what producing it means.
   *
   * The distinction a cost estimate rests on: `generated` is a model call,
   * `licensed` is a purchase, `owned` is already yours.
   */
  readonly source: AssetRequirement["source"];
  /** Whether it is already in hand, as the manifest claims. */
  readonly status: AssetRequirement["status"];
  readonly scene?: string;
  readonly durationSeconds?: number;
  readonly tolerance?: number;
  readonly loops?: boolean;
  readonly cropPermitted?: boolean;
  readonly channels?: 1 | 2;
  readonly licence?: string;
  /** How this render reaches it, for diagnosing a surprising plan. */
  readonly via: readonly ReferenceOrigin[];
}

/**
 * An asset the composition names that the manifest does not describe.
 *
 * Surfaced rather than dropped, and that is the important part. Silently
 * omitting one would produce a plan that looks complete and is missing
 * something the render will demand — the failure would appear much later, as a
 * readiness refusal or a gap in the picture, with nothing pointing back here.
 */
export interface UnresolvedReference {
  readonly name: string;
  readonly via: readonly ReferenceOrigin[];
  readonly scene?: string;
}

export interface RequirementSet {
  /** Every asset this render needs, deduplicated, in first-reference order. */
  readonly requirements: PlannedRequirement[];
  /** Names the composition uses that the manifest does not describe. */
  readonly unresolved: UnresolvedReference[];
}
