/**
 * Readiness check for the Jet Set master. This runs in the normal suite, so the manifest can
 * never silently drift away from what is on disk.
 *
 * It deliberately does NOT fail on outstanding assets — those are expected during production and
 * are reported instead. It DOES fail when the manifest claims something is present that is not,
 * when a licensed asset has no licence recorded, or when a delivered file is the wrong length.
 */

import { existsSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { verifyAssetManifest, type AssetProbe } from "../../manifest";
import { jetSetManifest } from "../manifest";
import { jetSetAssets } from "../assets";

const PUBLIC = join(process.cwd(), "public");

/** Read a PCM WAV header for duration and channel count. Returns undefined for other formats. */
const wavInfo = (file: string): { durationSeconds: number; channels: number } | undefined => {
  const b = readFileSync(file);
  if (b.length < 44 || b.toString("ascii", 0, 4) !== "RIFF") return undefined;
  const channels = b.readUInt16LE(22);
  const byteRate = b.readUInt32LE(28);
  if (!byteRate) return undefined;
  let p = 12;
  while (p < b.length - 8) {
    const id = b.toString("ascii", p, p + 4);
    const size = b.readUInt32LE(p + 4);
    if (id === "data") return { durationSeconds: size / byteRate, channels };
    p += 8 + size + (size % 2);
  }
  return undefined;
};

const probe: AssetProbe = (path) => {
  const file = join(PUBLIC, path);
  if (!existsSync(file)) return { exists: false };
  const bytes = statSync(file).size;
  const info = file.endsWith(".wav") ? wavInfo(file) : undefined;
  return { exists: true, bytes, ...(info ?? {}) };
};

const report = verifyAssetManifest(jetSetManifest, probe);

describe("Jet Set Adventures — asset readiness", () => {
  it("has no broken claims: everything marked `present` really is on disk and correct", () => {
    // A non-empty `issues` list means the manifest is lying about something, which is the
    // failure mode that lets a render ship with a missing or wrong-length track.
    expect(report.issues.map((i) => `${i.name}: ${i.problem}`)).toEqual([]);
  });

  it("every requirement corresponds to a registered asset in the kit", () => {
    const registered = new Set(Object.keys(jetSetAssets));
    const orphans = jetSetManifest.requirements.filter((r) => !registered.has(r.name)).map((r) => r.name);
    expect(orphans).toEqual([]);
  });

  it("every asset in the kit is accounted for in the manifest", () => {
    const declared = new Set(jetSetManifest.requirements.map((r) => r.name));
    // Audition candidates are deliberately out of scope: the manifest states what the FILM
    // requires, and a track under evaluation is not a requirement. Only the selected bed
    // becomes one, under the `musicBed` entry.
    const undeclared = Object.keys(jetSetAssets)
      .filter((n) => !n.startsWith("musicCandidate"))
      .filter((n) => !declared.has(n));
    expect(undeclared).toEqual([]);
  });

  it("all ten voiceover lines are present and within 0.15s of their declared length", () => {
    const vo = jetSetManifest.requirements.filter((r) => r.kind === "voice");
    expect(vo).toHaveLength(10);
    expect(vo.every((r) => r.status === "present")).toBe(true);
    expect(report.issues.filter((i) => i.name.startsWith("vo"))).toEqual([]);
  });

  it("ambience beds are declared as looping and one-shot effects are not", () => {
    const byName = new Map(jetSetManifest.requirements.map((r) => [r.name, r]));
    expect(byName.get("ambOcean")?.loops).toBe(true);
    expect(byName.get("ambAccra")?.loops).toBe(true);
    expect(byName.get("sfxSplash")?.loops).toBe(false);
    expect(byName.get("sfxPhoneTap")?.loops).toBe(false);
  });

  it("has all 23 picture shots delivered", () => {
    const video = jetSetManifest.requirements.filter((r) => r.kind === "video");
    expect(video).toHaveLength(23);
    expect(video.every((r) => r.status === "present")).toBe(true);
    expect(report.outstanding.filter((r) => r.kind === "video")).toEqual([]);
  });

  it("reports the film as render-ready: every requirement delivered and verified", () => {
    // This replaces an earlier assertion that the film was NOT ready, which encoded a moment in
    // production rather than an invariant. Now that music and sound design are delivered, the
    // stronger claim is the useful one: nothing outstanding, and nothing the manifest lies about.
    expect(report.outstanding).toEqual([]);
    expect(report.issues.map((i) => `${i.name}: ${i.problem}`)).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("every delivered sound-design asset records its commercial-use basis", () => {
    const design = jetSetManifest.requirements.filter(
      (r) => r.kind === "ambience" || r.kind === "sfx" || r.kind === "music",
    );
    expect(design).toHaveLength(9);
    expect(design.every((r) => typeof r.licence === "string" && r.licence.length > 0)).toBe(true);
  });
});
