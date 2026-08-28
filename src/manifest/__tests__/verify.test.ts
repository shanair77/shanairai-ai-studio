import { describe, expect, it } from "vitest";
import { defineAssetManifest, verifyAssetManifest, assertRenderReady, type AssetProbe, type AssetRequirement } from "../index";

const req = (over: Partial<AssetRequirement> = {}): AssetRequirement => ({
  name: "bed", kind: "music", path: "a/bed.wav", purpose: "music bed",
  source: "generated", status: "required", ...over,
});

const nothing: AssetProbe = () => ({ exists: false });
const everything = (info: Partial<{ durationSeconds: number; channels: number; bytes: number }> = {}): AssetProbe =>
  () => ({ exists: true, bytes: 1000, ...info });

describe("verifyAssetManifest", () => {
  it("reports a missing `required` asset as outstanding, not as an error", () => {
    const r = verifyAssetManifest(defineAssetManifest({ project: "p", requirements: [req()] }), nothing);
    expect(r.outstanding).toHaveLength(1);
    expect(r.issues).toHaveLength(0);
    expect(r.ok).toBe(false);
  });

  it("treats a missing `present` asset as a broken claim", () => {
    const r = verifyAssetManifest(defineAssetManifest({ project: "p", requirements: [req({ status: "present" })] }), nothing);
    expect(r.outstanding).toHaveLength(0);
    expect(r.issues[0].problem).toMatch(/does not exist/);
  });

  it("flags an asset that has arrived but is still marked required", () => {
    const r = verifyAssetManifest(defineAssetManifest({ project: "p", requirements: [req()] }), everything());
    expect(r.issues[0].problem).toMatch(/still marked `required`/);
  });

  it("does not demand a licence for an asset that has not been acquired yet", () => {
    const r = verifyAssetManifest(
      defineAssetManifest({ project: "p", requirements: [req({ source: "licensed" })] }),
      nothing,
    );
    expect(r.issues).toHaveLength(0);
  });

  it("does demand a licence once a licensed asset is on disk", () => {
    const r = verifyAssetManifest(
      defineAssetManifest({ project: "p", requirements: [req({ source: "licensed", status: "present" })] }),
      everything(),
    );
    expect(r.issues[0].problem).toMatch(/provenance/);
  });

  it("accepts a delivered licensed asset that records its licence", () => {
    const r = verifyAssetManifest(
      defineAssetManifest({ project: "p", requirements: [req({ source: "licensed", status: "present", licence: "ARTLIST-123" })] }),
      everything(),
    );
    expect(r.ok).toBe(true);
  });

  it("flags a duration outside tolerance and accepts one inside it", () => {
    const m = (d: number, tol: number) =>
      defineAssetManifest({ project: "p", requirements: [req({ status: "present", durationSeconds: d, tolerance: tol })] });
    expect(verifyAssetManifest(m(60, 1), everything({ durationSeconds: 65 })).issues[0].problem).toMatch(/duration/);
    expect(verifyAssetManifest(m(60, 8), everything({ durationSeconds: 65 })).ok).toBe(true);
  });

  it("flags a channel-count mismatch", () => {
    const r = verifyAssetManifest(
      defineAssetManifest({ project: "p", requirements: [req({ status: "present", channels: 2 })] }),
      everything({ channels: 1 }),
    );
    expect(r.issues[0].problem).toMatch(/channel/);
  });

  it("flags an empty file", () => {
    const r = verifyAssetManifest(
      defineAssetManifest({ project: "p", requirements: [req({ status: "present" })] }),
      everything({ bytes: 0 }),
    );
    expect(r.issues[0].problem).toMatch(/empty/);
  });

  it("counts what is in place", () => {
    const r = verifyAssetManifest(
      defineAssetManifest({ project: "p", requirements: [req({ status: "present" }), req({ name: "b", path: "a/b.wav" })] }),
      (p) => (p === "a/bed.wav" ? { exists: true, bytes: 10 } : { exists: false }),
    );
    expect(r.present).toBe(1);
    expect(r.total).toBe(2);
  });
});

describe("assertRenderReady", () => {
  it("throws, naming what is missing and why it matters", () => {
    const m = defineAssetManifest({ project: "Film", requirements: [req({ purpose: "the music bed" })] });
    expect(() => assertRenderReady(m, nothing)).toThrow(/Film.*not ready.*0\/1/s);
    expect(() => assertRenderReady(m, nothing)).toThrow(/the music bed/);
  });

  it("passes silently when everything is in place", () => {
    const m = defineAssetManifest({ project: "Film", requirements: [req({ status: "present" })] });
    expect(() => assertRenderReady(m, everything())).not.toThrow();
  });
});
