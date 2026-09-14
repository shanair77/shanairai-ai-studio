/**
 * JetSetAudition — music auditions against the LOCKED picture.
 *
 * A separate composition that reuses `jetSetCampaignConfig` verbatim and adds only a music bed,
 * so a candidate can be judged in context without the locked film being edited to accommodate it.
 * Picture, timing, transitions, typography and voiceover are untouched by construction — this
 * spreads the locked config rather than restating it.
 *
 * SFX and ambience are deliberately absent: the question at this stage is the music and nothing
 * else, and eight cues underneath make two tracks harder to tell apart, not easier.
 */

import { Composition } from "remotion";
import { buildComposition, sceneRegistry, type MusicConfig } from "./composition";
import { transitionRegistry } from "./transitions";
import { brandRegistry } from "./brand";
import { jetSetAdventures, JET_SET } from "./jetset/brand";
import { jetSetKit } from "./jetset/assets";
import { jetSetCampaignConfig } from "./jetset/CampaignConfig";

const brands = brandRegistry.extend({ [JET_SET]: jetSetAdventures });

/**
 * Provisional mix used for every audition, so candidates are compared on equal terms:
 * the bed enters on the smash cut, sits at 0.55, and ducks to 0.28 under all nine narration
 * windows. These are audition values, not the final mix.
 */
const auditionMix = (asset: string, startAtTrackSeconds: number): MusicConfig => ({
  asset,
  startAt: 8.38,
  trimBefore: startAtTrackSeconds,
  volume: 0.55,
  loop: false,
  fadeIn: 0.2,
  fadeOut: 2.5,
  ducking: { level: 0.28, ramp: 0.35 },
});

/** One entry per candidate. `trimBefore` is the in-point chosen from the track's own arrangement. */
const CANDIDATES: Array<{ id: string; asset: string; inPoint: number }> = [
  // Malibu: its breakdown at 70s is aligned onto the 45.9s emotional release.
  { id: "JetSet-Audition-1", asset: "musicCandidate1", inPoint: 32.5 },
  // Take a Break: a flatter arrangement with no true breakdown. In-point chosen so the film
  // arrives on the track's peak at 29.5s, its dip at 67s carries the release, and the endcard
  // rises into the track's loudest section at 81s.
  { id: "JetSet-Audition-2", asset: "musicCandidate2", inPoint: 29.5 },
  // Clear Skies: its dips precede its peaks, the inverse of what the film wants. This in-point
  // takes the three moments it CAN serve - arrival on the ramp into its 30s peak, its 66s dip on
  // the release, and its 80s peak rising under the endcard - and accepts a soft 37.2s lift.
  { id: "JetSet-Audition-3", asset: "musicCandidate3", inPoint: 28.5 },
  // Generated (Lyria 3 Pro). Only 7.23s of in-point freedom, and its release contrast is negative
  // at every one of them, so the in-point is chosen for the two things it CAN serve: its single
  // energy jump at 29s lands on the 37.17s lift, and ending at 51.62s avoids its outro fade.
  { id: "JetSet-Audition-4", asset: "musicCandidate4", inPoint: 0 },
  // Second generation. Flatter still (5.6 dB usable range). The in-point is the best of a narrow
  // field: 0.6 dB of release contrast, which is below the threshold of audibility.
  { id: "JetSet-Audition-5", asset: "musicCandidate5", inPoint: 2.25 },
  // Real dynamics at last (13.1 dB) - but the track is 54.36s with a 7s intro and a 4s outro,
  // leaving ~42s usable against the 51.62s the film needs. in-point 0 is forced: it is the only
  // placement that reaches the endcard at all, and it still arrives on the smash cut at -24 dB.
  { id: "JetSet-Audition-6", asset: "musicCandidate6", inPoint: 0 },
  // 86.36s, and in-point 0 aligns almost exactly: the track's 8s decay runs the payoff, and its
  // hard restart at track 45.00s lands at film 53.38s - 0.04s from the endcard cut at 53.42s.
  { id: "JetSet-Audition-7", asset: "musicCandidate7", inPoint: 0 },
  // Same shape as 7 but recovers sooner. ip 2.5 is chosen for BALANCE rather than maximum
  // contrast: a 15.7 dB release at the payoff without dropping to silence, and - unlike 7 -
  // the music holds full level through the sign-off instead of tapering.
  { id: "JetSet-Audition-8", asset: "musicCandidate8", inPoint: 2.5 },
];

export const JetSetAuditions: React.FC = () => (
  <>
    {CANDIDATES.map(({ id, asset, inPoint }) => {
      const built = buildComposition(
        { ...jetSetCampaignConfig, id, music: auditionMix(asset, inPoint) },
        sceneRegistry,
        transitionRegistry,
        jetSetKit.registry,
        brands,
      );
      return (
        <Composition
          key={id}
          id={built.id}
          component={built.component}
          durationInFrames={built.durationInFrames}
          fps={built.fps}
          width={built.width}
          height={built.height}
        />
      );
    })}
  </>
);
