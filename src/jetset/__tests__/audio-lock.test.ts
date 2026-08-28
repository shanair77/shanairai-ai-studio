/**
 * AUDIO LOCK. The companion to `picture-lock.test.ts`: that one pins what is on screen, this
 * pins what is heard.
 *
 * It exists because the mix is not reconstructible from the picture. Cue positions, levels and
 * the music in-point are editorial decisions measured against the locked cut, and a silent
 * drift in any of them changes the film without changing its duration, its shot list or any
 * test that watches those. It also pins the CONTENT of every audio file by hash — which is the
 * check that would have caught the watermarked music bed had it been in place earlier.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import lock from "../audio-lock.json";
import { jetSetCampaignConfig } from "../CampaignConfig";
import { jetSetAssets } from "../assets";

const PUBLIC = join(process.cwd(), "public");

type Stamped = { asset: string; file: string; bytes: number; sha256_16: string };
type Cue = Stamped & {
  role: string; startAt?: number; duration?: number;
  volume?: number; fadeIn?: number; fadeOut?: number; loop?: boolean;
};

const digest = (rel: string) =>
  createHash("sha256").update(readFileSync(join(PUBLIC, rel))).digest("hex").slice(0, 16);

/** Every declared file must exist, be the declared size, and hash to the declared content. */
const check = (entries: Stamped[]): string[] =>
  entries.flatMap((e) => {
    try {
      if (readFileSync(join(PUBLIC, e.file)).length !== e.bytes) return [`${e.asset}: size changed`];
      if (digest(e.file) !== e.sha256_16) return [`${e.asset}: CONTENT CHANGED`];
      return [];
    } catch {
      return [`${e.asset}: missing (${e.file})`];
    }
  });

const configCues = jetSetCampaignConfig.audio ?? [];
const source = (name: string) => (jetSetAssets as Record<string, { source: string }>)[name].source;

describe("Jet Set Adventures — audio lock", () => {
  it("is locked", () => {
    expect(lock.state).toBe("AUDIO LOCKED");
  });

  it("every locked audio file is present and byte-identical", () => {
    expect(check([lock.music as Stamped])).toEqual([]);
    expect(check(lock.voiceover as Stamped[])).toEqual([]);
    expect(check(lock.ambience as Stamped[])).toEqual([]);
    expect(check(lock.sfx as Stamped[])).toEqual([]);
  });

  it("pins the music bed and its placement", () => {
    const m = jetSetCampaignConfig.music;
    expect(m).toBeDefined();
    expect(source(m!.asset!)).toBe(lock.music.file);
    expect(m!.startAt).toBe(lock.music.startAt);
    expect(m!.trimBefore).toBe(lock.music.trimBefore);
    expect(m!.volume).toBe(lock.music.volume);
    expect(m!.fadeIn).toBe(lock.music.fadeIn);
    expect(m!.fadeOut).toBe(lock.music.fadeOut);
    expect(m!.ducking).toEqual(lock.music.ducking);
  });

  it("pins every cue's asset, position and level", () => {
    const locked = [...lock.voiceover, ...lock.ambience, ...lock.sfx] as Cue[];
    expect(configCues).toHaveLength(locked.length);

    for (const want of locked) {
      const got = configCues.find((c) => c.asset === want.asset && c.startAt === want.startAt);
      expect(got, `no cue for ${want.asset} @ ${want.startAt}s`).toBeDefined();
      expect(got!.role).toBe(want.role);
      expect(got!.volume).toBe(want.volume);
      expect(got!.duration).toBe(want.duration);
      expect(got!.fadeIn).toBe(want.fadeIn);
      expect(got!.fadeOut).toBe(want.fadeOut);
      expect(source(got!.asset)).toBe(want.file);
    }
  });

  it("keeps the approved shape: 9 narration lines, 4 ambience beds, 4 one-shots", () => {
    expect(lock.voiceover).toHaveLength(9);
    expect(lock.ambience).toHaveLength(4);
    expect(lock.sfx).toHaveLength(4);
    expect(lock.ambience.every((c) => c.role === "ambience")).toBe(true);
    expect(lock.sfx.every((c) => c.role === "sfx")).toBe(true);
  });

  it("records a verified commercial-use basis for the music bed", () => {
    // Confirmed by the account holder on 2026-08-25. Kept as an assertion rather than a note so
    // that swapping in a bed of unknown provenance cannot quietly inherit this clearance.
    expect(lock.music.licenceVerified).toBe(true);
    expect(lock.music.licenceNote).toMatch(/confirmed/i);
  });
});
