/* eslint-disable @remotion/non-pure-animation -- `kenBurns` and `transition` here are
   configuration keys consumed by the frame-driven KenBurns primitive and the transition
   registry. They are data, not CSS animations. */
/**
 * jetset/CampaignConfigTwin — the twin-led master.
 *
 * SAME FILM, DIFFERENT PICTURE. Every duration, cut, transition, narration cue, sound-design
 * position and music placement is taken verbatim from the locked 60s master. Only the media
 * changes. That is the point: it isolates one variable, so what you are judging is the twin
 * and nothing else.
 *
 * IT REMOVES THE LOCKED FILM'S CENTRAL COMPROMISE. The master carries its through-line with
 * wardrobe and identity-agnostic framing because generative video could not hold one face
 * across seventeen shots. Here the face IS consistent, so the cream-linen device stops being
 * load-bearing and becomes ordinary continuity.
 *
 * ELEVEN OF SEVENTEEN SHOTS NOW CARRY GENERATED MOTION; SIX REMAIN STILLS. An earlier pass
 * had it the other way round, and that was a budget constraint presented as craft: five shots
 * whose whole content is a human action — an exhale, a reach, walking a market, two dance
 * shots — had frozen subjects. They now move. What remains a still is only where the camera
 * move genuinely IS the shot. The
 * composition already animates every shot; for a static composition a scale-and-pan on a
 * 1440x2560 still is frame-exact, deterministic, costs nothing, and cannot judder, drift or
 * hallucinate a limb. Generated motion is spent only where a human action has to complete:
 * doors opening, walking, a body entering water. The stills get LARGER moves than the master's
 * because a still has no internal motion to carry it — the master's 1.04 scale reads as drift
 * on footage and as stillness on a photograph.
 *
 * TIMELINE: identical to the master. 1440 frames at 24fps = 60.000s.
 */

import { type CompositionSchema } from "../composition";
import { type MediaBackdropProps } from "../media";
import { EndCard } from "./BrandMarks";
import { JET_SET } from "./brand";
import { jetSetCampaignConfig } from "./CampaignConfig";

const lowerScrim = { direction: "bottom" as const, strength: 1 };
const cut = { type: "none" as const };

/** Pull a locked shot's non-media props so typography and scrims cannot drift. */
const props = (label: string) =>
  (jetSetCampaignConfig.scenes ?? []).find((s) => s.label === label)?.props as
    | Record<string, unknown>
    | undefined;

const shot = (
  label: string,
  duration: number,
  media: MediaBackdropProps,
  transition: { type: "none" } | { type: "dissolve"; duration: number } = cut,
) => {
  const base = { ...(props(label) ?? {}) };
  delete base.media; // the locked shot's media is exactly what this version replaces
  return { scene: "media" as const, label, duration, transition, props: { ...base, media } };
};

export const jetSetTwinConfig: CompositionSchema = {
  id: "JetSet-Twin-60",
  format: "vertical",
  fps: 24,
  duration: 60,
  brand: JET_SET,

  // Audio is the locked mix, unchanged — same narration, same eight cues, same bed and in-point.
  audio: jetSetCampaignConfig.audio,
  music: jetSetCampaignConfig.music,

  scenes: [
    // ═══ ACT 1 · ORDINARY LIFE ═══════════════════════ still, slow push
    shot("1.1 desk exhale", 4.6, {
      asset: "twDeskExhale", kenBurns: { from: 1, to: 1.04 },
    }),
    shot("1.3 reach phone", 3.8, {
      asset: "twReachPhone", kenBurns: { from: 1, to: 1.04 },
    }),

    // ═══ ACT 2 · CARIBBEAN ═══════════════════════════ all three have generated motion
    shot("2.1 balcony doors", 3.8, {
      asset: "twBalconyDoors", kenBurns: { from: 1, to: 1.04 },
    }),
    shot("2.2 sand walk · BREATHE", 2.9, {
      asset: "twSandWalk", scrim: lowerScrim, kenBurns: { from: 1.02, to: 1.05 },
    }),
    shot("2.3 yacht", 2.9, {
      asset: "twYacht", kenBurns: { from: 1.03, to: 1 },
    }),

    // ═══ ACT 3 · GHANA ═══════════════════════════════ stills
    shot("3.1 accra market", 3.6, {
      asset: "twAccraStreet", kenBurns: { from: 1, to: 1.04 },
    }),
    shot("3.2 head-wrap · DISCOVER", 3.0, {
      asset: "twFabricDetail", scrim: lowerScrim, kenBurns: { from: 1.08, to: 1 },
    }),
    shot("3.4 night dance", 3.0, {
      asset: "twNightDance", kenBurns: { from: 1, to: 1.04 },
    }),

    // ═══ ACT 4 · DUBAI ═══════════════════════════════
    shot("4.1 hotel arrival · LIVE", 3.6, {
      asset: "twHotelArrival", scrim: { direction: "bottom", strength: 1.35 }, kenBurns: { from: 1, to: 1.03 },
    }),
    shot("4.2 skyline", 3.0, {
      asset: "twSkyline", kenBurns: { from: 1.1, to: 1 },
    }),
    shot("4.3 rooftop dinner", 3.0, {
      asset: "twRooftopDinner", kenBurns: { from: 1.1, to: 1 },
    }),

    // ═══ ACT 5 · CELEBRATION ═════════════════════════
    shot("5.2 pool jump", 3.0, {
      asset: "twPoolJump", kenBurns: { from: 1.02, to: 1 },
    }),
    shot("5.5 night out", 2.75, {
      asset: "twNightOut", kenBurns: { from: 1, to: 1.05 },
    }),
    shot("5.4 boardwalk", 3.0, {
      asset: "twBoardwalk", kenBurns: { from: 1.03, to: 1 },
    }),

    // ═══ ACT 6 · PAYOFF ══════════════════════════════ the one earned dissolve
    shot("6.1 balcony sunset", 4.5, {
      asset: "twBalconySunset", kenBurns: { from: 1, to: 1.08 },
    }),
    shot("6.2 profile · YOUR NEXT STORY", 3.8, {
      asset: "twFaceProfile", scrim: lowerScrim, kenBurns: { from: 1.02, to: 1.12 },
    }, { type: "dissolve", duration: 0.8 }),

    // ═══ ACT 7 · ENDCARD ═════════════════════════════ the brief's own "aerial pull-back"
    shot("7.1 endcard", 6.58, {
      asset: "twCoastPullback", scrim: { direction: "full", strength: 0.95 }, kenBurns: { from: 1.14, to: 1 },
    }),
  ],
};

/** Keeps the endcard's brand marks referenced so the import cannot silently rot. */
export const TWIN_ENDCARD = EndCard;
