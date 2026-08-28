/**
 * manifest/verify — check a manifest against what is actually on disk.
 *
 * Pure: the filesystem arrives as an injected `AssetProbe`, so this runs in tests, in a Node
 * script, or anywhere else without the framework taking a dependency on `fs`.
 *
 * The distinction that matters: an asset marked `required` and absent is OUTSTANDING — expected,
 * reportable, not an error. An asset marked `present` and absent is an ISSUE — the manifest is
 * lying, which is exactly the drift that lets a render quietly ship with a missing track.
 */

import {
  type AssetManifest,
  type AssetProbe,
  type ManifestIssue,
  type ManifestReport,
} from "./types";

const DEFAULT_TOLERANCE = 0.5;

/** Bind a manifest, preserving it as plain data. Mirrors the other `define*` factories. */
export const defineAssetManifest = (manifest: AssetManifest): AssetManifest => manifest;

/** Verify every requirement against the filesystem. */
export const verifyAssetManifest = (manifest: AssetManifest, probe: AssetProbe): ManifestReport => {
  const issues: ManifestIssue[] = [];
  const outstanding: typeof manifest.requirements = [];
  let present = 0;

  for (const req of manifest.requirements) {
    const fail = (problem: string) => issues.push({ name: req.name, path: req.path, problem });

    const result = probe(req.path);

    if (!result.exists) {
      if (req.status === "present") {
        fail("declared `present` but the file does not exist — the manifest is out of date");
      } else {
        outstanding.push(req);
      }
      continue;
    }

    if (req.status === "required") {
      fail("file exists but is still marked `required` — flip it to `present` once verified");
    }

    // Provenance is checked on DELIVERY, not on declaration: an asset that has not been
    // acquired yet obviously has no licence, and flagging that would be noise. Once the file
    // is on disk, though, shipping it without recorded terms is a real exposure.
    if (req.source === "licensed" && !req.licence) {
      fail("delivered licensed asset has no `licence` recorded — provenance cannot be established");
    }

    if (result.bytes !== undefined && result.bytes === 0) fail("file is empty");

    if (req.durationSeconds !== undefined && result.durationSeconds !== undefined) {
      const tol = req.tolerance ?? DEFAULT_TOLERANCE;
      const drift = Math.abs(result.durationSeconds - req.durationSeconds);
      if (drift > tol) {
        fail(
          `duration is ${result.durationSeconds.toFixed(2)}s but ${req.durationSeconds.toFixed(2)}s ` +
            `(±${tol}s) was expected — re-time the cue or re-cut the asset`,
        );
      }
    }

    if (req.channels !== undefined && result.channels !== undefined && result.channels !== req.channels) {
      fail(`expected ${req.channels} channel(s) but found ${result.channels}`);
    }

    present += 1;
  }

  return {
    ok: outstanding.length === 0 && issues.length === 0,
    outstanding,
    issues,
    present,
    total: manifest.requirements.length,
  };
};

/**
 * Throw unless every requirement is satisfied. Call this at the top of a render path so a
 * master can never be produced against missing media — the guarantee that "do not ship with
 * placeholders" is enforced by the system rather than promised by a person.
 */
export const assertRenderReady = (manifest: AssetManifest, probe: AssetProbe): void => {
  const report = verifyAssetManifest(manifest, probe);
  if (report.ok) return;
  const lines = [
    ...report.outstanding.map((r) => `  MISSING  ${r.name} (${r.path}) — ${r.purpose}`),
    ...report.issues.map((i) => `  PROBLEM  ${i.name} (${i.path}) — ${i.problem}`),
  ];
  throw new Error(
    `"${manifest.project}" is not ready to render: ${report.present}/${report.total} assets in place.\n` +
      lines.join("\n"),
  );
};
