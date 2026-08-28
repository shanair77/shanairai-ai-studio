/**
 * render/probe — the default filesystem probe for readiness checks.
 *
 * `assertRenderReady` takes an injected `AssetProbe` so the manifest layer can stay
 * pure and testable. This is the Node implementation of that seam, and it lives
 * here rather than in `manifest/` for exactly that reason: `manifest/` must remain
 * importable from a browser bundle, and this module reads the disk.
 *
 * WHAT IT CHECKS, AND WHAT IT DELIBERATELY DOES NOT. Existence and size. It does
 * not decode media to measure duration or channel count, so the verifier's duration
 * and channel assertions are skipped for every file this probe reports on — those
 * checks are written to skip when the probe stays silent, rather than to fail.
 *
 * That is a deliberate line. Measuring durations means either shelling out to
 * ffprobe or parsing container formats, and doing it badly is worse than not doing
 * it: a wrong duration blocks a correct render, and a render is not the moment to
 * discover that a WAV parser mishandled an odd-sized chunk. The project's own
 * manifest test already measures durations with a real parser, which is where that
 * check belongs — at authoring time, not in the render path.
 *
 * A caller who wants deeper checking passes their own probe.
 */

import { existsSync, statSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

import { type AssetProbe, type ProbeResult } from "../manifest";

/**
 * Probe `public/`-relative paths under `publicDir`.
 *
 * Manifest paths are relative by contract, and a path that escapes the public
 * directory is refused rather than followed: a manifest is data, and data that can
 * name `../../etc/passwd` and have it stat'ed is a manifest that reads the disk on
 * the author's behalf. Reporting it as absent keeps the failure inside the
 * readiness report where someone will see it.
 */
export const createFileProbe = (publicDir: string): AssetProbe => {
  const root = resolve(publicDir);

  return (path: string): ProbeResult => {
    if (isAbsolute(path)) return { exists: false };

    const file = resolve(join(root, path));
    if (file !== root && !file.startsWith(root + "/")) return { exists: false };

    if (!existsSync(file)) return { exists: false };

    const stat = statSync(file);
    if (!stat.isFile()) return { exists: false };

    return { exists: true, bytes: stat.size };
  };
};
