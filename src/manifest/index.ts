/**
 * manifest/ — production asset manifests: what a film needs, and whether we have it.
 *
 * Declare requirements up front (`defineAssetManifest`), check them against disk
 * (`verifyAssetManifest`), and refuse to render without them (`assertRenderReady`). Pure —
 * the filesystem is injected as an `AssetProbe`, so this layer has no I/O of its own.
 */

export {
  defineAssetManifest,
  verifyAssetManifest,
  assertRenderReady,
} from "./verify";

export {
  type AssetManifest,
  type AssetRequirement,
  type AssetProbe,
  type ProbeResult,
  type ManifestIssue,
  type ManifestReport,
  type RequirementKind,
  type RequirementSource,
  type RequirementStatus,
} from "./types";
