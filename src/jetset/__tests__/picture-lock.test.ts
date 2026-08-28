/**
 * Picture lock integrity.
 *
 * The picture was approved on the V3 cut. This asserts that nothing which contributes to the
 * approved frames has changed since: every shot in the master, every voiceover line, both brand
 * marks, and the composition's own dimensional contract.
 *
 * It is deliberately checksum-based rather than existence-based. An approved cut that silently
 * drifts because a clip was regenerated or an asset overwritten is the failure this exists to
 * catch — "locked" should be a property the build enforces, not a note in a document.
 *
 * When picture is intentionally reopened, regenerate `picture-lock.json` in the same pass as
 * the change so the two never disagree.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import lock from "../picture-lock.json";
import { jetSetCampaignConfig } from "../CampaignConfig";

const PUBLIC = join(process.cwd(), "public");

const digest = (rel: string): string =>
  createHash("sha256").update(readFileSync(join(PUBLIC, rel))).digest("hex").slice(0, 16);

type Entry = { file: string; bytes: number; sha256_16: string };

const check = (dir: string, entries: Entry[]) =>
  entries.map((e) => {
    const rel = `${dir}/${e.file}`;
    if (!existsSync(join(PUBLIC, rel))) return `${e.file}: MISSING`;
    if (statSync(join(PUBLIC, rel)).size !== e.bytes) return `${e.file}: size changed`;
    if (digest(rel) !== e.sha256_16) return `${e.file}: content changed`;
    return null;
  }).filter(Boolean);

describe("Jet Set Adventures — picture lock", () => {
  it("is marked locked", () => {
    expect(lock.state).toBe("PICTURE LOCKED");
  });

  it("holds all 17 shots of the approved master unchanged", () => {
    expect(lock.pictureAssets).toHaveLength(17);
    expect(check("jetset/video", lock.pictureAssets)).toEqual([]);
  });

  it("holds all 10 voiceover lines unchanged", () => {
    expect(lock.voiceover).toHaveLength(10);
    expect(check("jetset/audio/vo", lock.voiceover)).toEqual([]);
  });

  it("holds both brand marks unchanged", () => {
    expect(check("jetset/brand", lock.brand)).toEqual([]);
  });

  it("keeps the six unused shots available for the derivative cuts", () => {
    expect(lock.heldNotInMaster).toHaveLength(6);
    expect(check("jetset/video", lock.heldNotInMaster)).toEqual([]);
  });

  it("pins the composition's dimensional contract", () => {
    expect(lock.composition).toMatchObject({ width: 1080, height: 1920, fps: 24, durationInFrames: 1440 });
    expect(jetSetCampaignConfig.fps).toBe(lock.composition.fps);
    expect(jetSetCampaignConfig.duration).toBe(lock.composition.durationSeconds);
    expect(jetSetCampaignConfig.format).toBe("vertical");
  });

  it("pins the editorial shape of the approved cut", () => {
    expect(jetSetCampaignConfig.scenes).toHaveLength(lock.editorial.shotsInMaster);
    // Exactly one dissolve survived review; everything else is a hard cut.
    const dissolves = jetSetCampaignConfig.scenes.filter((s) => s.transition?.type === "dissolve");
    expect(dissolves).toHaveLength(lock.editorial.dissolves);

    // The v4 in-point corrections are part of the approved cut, so they are pinned too: a
    // trim silently reverting or drifting would change what is on screen without changing
    // any duration, which is exactly the kind of edit the rest of this lock cannot see.
    const trims = jetSetCampaignConfig.scenes
      .map((s) => (s.props as { media?: { asset?: string; trimBefore?: number } } | undefined)?.media)
      .filter((m): m is { asset: string; trimBefore: number } => typeof m?.trimBefore === "number");
    expect(trims).toHaveLength(lock.editorial.sourceTrims);
    for (const declared of lock.sourceTrims) {
      const found = trims.find((t) => t.asset === declared.asset);
      expect(found?.trimBefore).toBe(declared.trimBefore);
    }
  });

  it("still reports the licensed audio as outstanding", () => {
    expect(lock.outstanding.length).toBeGreaterThan(0);
  });
});
