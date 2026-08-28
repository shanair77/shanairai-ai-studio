/**
 * manifest/types — the production asset manifest contract.
 *
 * A manifest is the answer to "what does this film need, and do we actually have it?" — declared
 * BEFORE the assets exist, so a project can be built, reviewed and costed against named-but-absent
 * media instead of against placeholders. It is plain serialisable data: no I/O, no React, no
 * coupling to the asset engine beyond the `name` that ties a requirement to a kit entry.
 *
 * This is deliberately NOT a second asset system. The `AssetKit` still owns resolution and
 * rendering; the manifest owns PROVENANCE and READINESS — the two things the kit has no opinion
 * about and that a commercial cannot ship without.
 */

/** What kind of thing a requirement is, which also decides where it lives on disk. */
export type RequirementKind = "video" | "image" | "music" | "voice" | "sfx" | "ambience";

/** Where an asset came from — drives what has to be recorded about it. */
export type RequirementSource = "generated" | "licensed" | "owned";

/** Whether we have it yet. `present` is a CLAIM the verifier checks and will fail on. */
export type RequirementStatus = "present" | "required";

/** One asset the production needs. */
export type AssetRequirement = {
  /** The name this asset is registered under in the project's `AssetKit`. */
  name: string;
  kind: RequirementKind;
  /** Path relative to `public/`, matching the kit's `source`. */
  path: string;
  /** What it is FOR — the sentence someone acquiring it needs to read. */
  purpose: string;
  /** Which scene or act it serves. */
  scene?: string;
  /** Expected length in seconds. */
  durationSeconds?: number;
  /** Acceptable deviation from `durationSeconds`, in seconds. Default 0.5. */
  tolerance?: number;
  /** Ambience beds loop; one-shots and narration must not. */
  loops?: boolean;
  /** Whether reframing/cropping this asset is allowed. */
  cropPermitted?: boolean;
  /** Expected channel count, where it matters. */
  channels?: 1 | 2;
  source: RequirementSource;
  /** Licence reference. REQUIRED for `licensed` assets — the verifier enforces it. */
  licence?: string;
  status: RequirementStatus;
};

export type AssetManifest = {
  project: string;
  requirements: AssetRequirement[];
};

/** What a probe reports about a file on disk. Injected, so this layer stays pure. */
export type ProbeResult = {
  exists: boolean;
  durationSeconds?: number;
  channels?: number;
  bytes?: number;
};

/** Probes a `public/`-relative path. Supplied by the caller (Node `fs` in practice). */
export type AssetProbe = (path: string) => ProbeResult;

export type ManifestIssue = {
  name: string;
  path: string;
  problem: string;
};

export type ManifestReport = {
  /** True only when nothing is outstanding and nothing is inconsistent. */
  ok: boolean;
  /** Requirements still to be acquired. */
  outstanding: AssetRequirement[];
  /** Things that are wrong rather than merely absent — a broken claim, a bad duration. */
  issues: ManifestIssue[];
  present: number;
  total: number;
};
