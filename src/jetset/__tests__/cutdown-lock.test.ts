/**
 * CUTDOWN LOCK — the 30s and 15s derivatives.
 *
 * The picture and audio locks protect the 60s master. The cutdowns are built FROM it, so most
 * of what matters is already covered: they cannot drift in grade, in-point corrections, Ken
 * Burns, scrim or typography, because `derive.ts` reads those from the master at build time.
 *
 * What this pins is everything the derivation does NOT cover, which is exactly what each cut
 * chose for itself: which shots survive, how long each runs, which lines are narrated, where
 * the sound cues sit, and where the music bed enters. It also pins the derivation itself — a
 * test that each shot's props are still IDENTICAL to the master's — so that reuse is verified
 * rather than assumed. If someone hand-edits a cutdown shot instead of the master, that is the
 * assertion that catches it.
 */

import { describe, expect, it } from "vitest";
import lock from "../cutdown-lock.json";
import audioLock from "../audio-lock.json";
import { jetSetCampaignConfig } from "../CampaignConfig";
import { jetSetCampaign30Config } from "../CampaignConfig30";
import { jetSetCampaign15Config } from "../CampaignConfig15";
import { buildComposition, sceneRegistry } from "../../composition";
import { transitionRegistry } from "../../transitions";
import { brandRegistry } from "../../brand";
import { jetSetAdventures, JET_SET } from "../brand";
import { jetSetKit, jetSetAssets } from "../assets";

const brands = brandRegistry.extend({ [JET_SET]: jetSetAdventures });
const configs = { "JetSet-Cutdown-30": jetSetCampaign30Config, "JetSet-Cutdown-15": jetSetCampaign15Config };
const masterByLabel = new Map((jetSetCampaignConfig.scenes ?? []).map((s) => [s.label ?? "", s]));

describe("Jet Set Adventures — cutdown lock", () => {
  it("is locked", () => {
    expect(lock.state).toBe("CUTDOWNS LOCKED");
    expect(lock.cuts).toHaveLength(2);
  });

  for (const cut of lock.cuts) {
    describe(cut.id, () => {
      const config = configs[cut.id as keyof typeof configs];

      it("compiles to the locked frame count and format", () => {
        const built = buildComposition(config, sceneRegistry, transitionRegistry, jetSetKit.registry, brands);
        expect(built.durationInFrames).toBe(cut.composition.durationInFrames);
        expect(built.fps).toBe(cut.composition.fps);
        expect(built.width).toBe(cut.composition.width);
        expect(built.height).toBe(cut.composition.height);
        // The folded timeline must land on a whole number of frames, not merely near one.
        expect(built.durationInFrames / built.fps).toBe(cut.composition.durationSeconds);
      });

      it("keeps the locked shot list and timings", () => {
        const scenes = config.scenes ?? [];
        expect(scenes.map((s) => ({ label: s.label, duration: s.duration }))).toEqual(cut.shots);
        expect(scenes).toHaveLength(cut.editorial.shots);
        expect(scenes.filter((s) => s.transition?.type === "dissolve")).toHaveLength(cut.editorial.dissolves);
      });

      it("still DERIVES every shot from the master rather than restating it", () => {
        for (const scene of config.scenes ?? []) {
          const master = masterByLabel.get(scene.label ?? "");
          expect(master, `"${scene.label}" is not a master shot`).toBeDefined();
          // Treatment must be byte-identical to the master's. Duration is the only difference.
          expect(scene.props).toEqual(master!.props);
          expect(scene.scene).toBe(master!.scene);
          expect(scene.transition).toEqual(master!.transition);
        }
      });

      it("keeps the locked music placement, and the bed is long enough to reach the end", () => {
        expect(config.music).toEqual(cut.music);

        // The cutdowns enter the bed deep into the track (56s and 69s of 86.44s). Running off
        // the end would not error - the audio would simply stop - so the arithmetic is pinned.
        const kit = jetSetAssets as Record<string, { metadata?: { durationInSeconds?: number } }>;
        const bedSeconds = kit[config.music!.asset!]?.metadata?.durationInSeconds;
        expect(bedSeconds, "music bed has no declared length").toBeGreaterThan(0);
        const played = cut.composition.durationSeconds - config.music!.startAt!;
        expect(config.music!.trimBefore! + played, "the bed runs out before the cut ends")
          .toBeLessThanOrEqual(bedSeconds!);
      });

      it("keeps every locked cue at its position and level", () => {
        const cues = (config.audio ?? []).map((a) => ({
          asset: a.asset, role: a.role, startAt: a.startAt, duration: a.duration,
          volume: a.volume, fadeIn: a.fadeIn, fadeOut: a.fadeOut, loop: a.loop,
        }));
        expect(cues).toEqual(cut.cues);
      });

      it("uses only audio already verified by the audio lock", () => {
        const cleared = new Set<string>([
          audioLock.music.asset,
          ...audioLock.voiceover.map((v) => v.asset),
          ...audioLock.ambience.map((a) => a.asset),
          ...audioLock.sfx.map((s) => s.asset),
        ]);
        const used = [config.music!.asset!, ...(config.audio ?? []).map((a) => a.asset)];
        expect(used.filter((a) => !cleared.has(a))).toEqual([]);
      });

      it("no cue overruns the cut, and no ambience bed outruns its source file", () => {
        // A cue that starts inside the cut can still be truncated mid-word at the tail. This
        // checks where each cue ENDS, using the real file length from the asset kit, and that
        // no bed asks for more seconds than its source actually contains (which would either
        // loop a seam into the mix or fall silent early).
        const kit = jetSetAssets as Record<string, { metadata?: { durationInSeconds?: number } }>;
        for (const cue of config.audio ?? []) {
          const fileSeconds = kit[cue.asset]?.metadata?.durationInSeconds;
          expect(fileSeconds, `${cue.asset} has no declared length`).toBeGreaterThan(0);

          if (cue.duration !== undefined) {
            expect(cue.duration, `${cue.asset} asks for more than its source holds`)
              .toBeLessThanOrEqual(fileSeconds!);
          }
          const played = cue.duration ?? fileSeconds!;
          expect(cue.startAt! + played, `${cue.asset} runs past the end of the cut`)
            .toBeLessThanOrEqual(cut.composition.durationSeconds);
        }
      });
    });
  }
});
