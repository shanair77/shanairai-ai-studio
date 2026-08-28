/* eslint-disable @remotion/non-pure-animation -- `kenBurns` and `transition` here are
   configuration keys consumed by the frame-driven KenBurns primitive and the transition
   registry. They are data, not CSS animations. */
/**
 * jetset/CampaignConfig — the Jet Set Adventures 60-second master (V3).
 *
 * NATIVE 24FPS. The source footage is 24fps; the V2 master ran at 30, which forced a 5:4
 * pulldown and froze every fifth frame — measured at a 7-16x collapse in inter-frame motion.
 * Running the timeline at the footage's own cadence removes that entirely. Nothing is
 * interpolated. Durations are authored in SECONDS throughout, so the change is `fps: 24` and
 * the compiler re-folds the frame math; the voiceover keeps its exact wall-clock timing.
 *
 * TRANSITIONS ARE EDITORIAL, NOT DEFAULT. V2 put a 0.4s dissolve on nearly every cut, which
 * meant 31-36% of each shot was a double exposure — producing floating faces and ghosted limbs.
 * V3 cuts. Exactly ONE boundary dissolves, because it is the only one that earns it:
 * the chained payoff pair, which was generated FROM its predecessor's final frame and so
 * fades a frame into itself. Total cross-fade time: 7.8s -> 0.8s.
 *
 * SEVENTEEN SHOTS, NOT TWENTY-THREE. Removed: the hand insert, the champagne detail, the
 * rooftop food, the desert, the Miami arrivals (luggage morphing, posed lineup) and the
 * birthday sparkler (malformed hands). Average shot length 2.95s -> 3.67s, and every remaining
 * action is allowed to complete before the cut.
 *
 * THE THROUGH-LINE is carried by wardrobe and framing rather than by forcing one face into
 * every clip: cream linen and dark hair worn back recur from the desk (1.1/1.3) through the
 * balcony robe (2.1), the Accra market (3.1) and the Dubai arrival (4.1), and the identity-
 * agnostic framing of 2.1/2.2/4.2 lets the viewer read them as the same traveller.
 *
 * TIMELINE: 1440 frames at 24fps = 60.000s exactly. Sum(scene) 62.4s - Sum(transition) 2.4s.
 */

import { type CompositionSchema } from "../composition";
import { EndCard } from "./BrandMarks";
import { JET_SET } from "./brand";

/** Scrim anchored where the type sits. */
const lowerScrim = { direction: "bottom" as const, strength: 1 };
/**
 * Country changes are HARD CUTS too. A 0.5s dissolve was tried here and rejected on review:
 * cross-fading a yacht group into a market crowd ghosts one set of people over the other at
 * the midpoint, which is the exact artefact this pass exists to remove. Only two dissolves
 * survive in the whole film, and both are earned — see 6.2 and 7.1.
 */
const countryChange = { type: "none" as const };
/** Everything else. */
const cut = { type: "none" as const };

export const jetSetCampaignConfig: CompositionSchema = {
  id: "JetSet-Master-60",
  format: "vertical",
  fps: 24,
  duration: 60,
  brand: JET_SET,

  // Unchanged from V2 — same files, same wall-clock positions. vo-08 remains cut (approved).
  audio: [
    { asset: "vo01Hook", role: "voiceover", startAt: 1.2, label: "VO 1 · hook" },
    { asset: "vo02Breathe", role: "voiceover", startAt: 9.4, label: "VO 2 · breathe" },
    { asset: "vo03Discover", role: "voiceover", startAt: 18.9, label: "VO 3 · discover" },
    { asset: "vo04Live", role: "voiceover", startAt: 28.4, label: "VO 4 · live" },
    { asset: "vo05Occasions", role: "voiceover", startAt: 37.6, label: "VO 5 · occasions" },
    { asset: "vo06OrMaybe", role: "voiceover", startAt: 42.9, label: "VO 6 · or maybe" },
    { asset: "vo07JustBecause", role: "voiceover", startAt: 46.3, label: "VO 7 · just because" },
    { asset: "vo09NextStory", role: "voiceover", startAt: 49.4, label: "VO 9 · next story" },
    { asset: "vo10Signoff", role: "voiceover", startAt: 54.15, label: "VO 10 · sign-off" },

    // ─── SOUND DESIGN ────────────────────────────────────────────────────────────────
    // Positions come from CUE_WINDOWS in `audio-requests.ts`, declared against this locked
    // cut. Ambience is `role: "ambience"` and SFX is `role: "sfx"` so neither ducks the bed —
    // only narration does. Every bed is shorter than its source file, so none of them loop and
    // no loop seam is ever exposed.

    // Act 1 lives under room tone alone: no music until she decides. Fades out as the bed enters.
    { asset: "ambRoomTone", role: "ambience", startAt: 0.0, duration: 8.6, volume: 4.0, loop: false, fadeIn: 0.5, fadeOut: 1.0, label: "AMB · room tone" },
    { asset: "sfxPhoneTap", role: "sfx", startAt: 7.0, volume: 0.2, label: "SFX · phone tap" },
    { asset: "sfxWhoosh", role: "sfx", startAt: 7.9, volume: 0.35, fadeOut: 0.3, label: "SFX · whoosh" },

    // J-cut: the ocean arrives 0.6s before the picture cuts to it at 8.38s, so sound leads image.
    { asset: "ambOcean", role: "ambience", startAt: 7.78, duration: 7.3, volume: 0.27, loop: false, fadeIn: 0.4, fadeOut: 1.2, label: "AMB · ocean (J-cut)" },
    // J-cut: Accra leads its own cut (18.00s) by 0.4s.
    { asset: "ambAccra", role: "ambience", startAt: 17.6, duration: 6.98, volume: 0.3, loop: false, fadeIn: 0.4, fadeOut: 1.0, label: "AMB · Accra street (J-cut)" },

    { asset: "sfxLuggage", role: "sfx", startAt: 27.7, volume: 0.26, fadeIn: 0.2, fadeOut: 0.5, label: "SFX · luggage on marble" },
    { asset: "sfxSplash", role: "sfx", startAt: 37.6, volume: 0.9, label: "SFX · pool splash" },

    // L-cut: wind arrives 0.52s before the 45.92s cut and carries unbroken through the payoff,
    // the dissolve and the endcard — the one continuous element that ties the ending together.
    { asset: "ambBalconyWind", role: "ambience", startAt: 45.4, duration: 14.6, volume: 0.48, loop: false, fadeIn: 0.6, fadeOut: 2.0, label: "AMB · balcony wind (L-cut)" },
  ],

  // The bed enters on the smash cut at 8.38s, not at frame zero: Act 1 is deliberately unscored.
  // trimBefore 2.5 is the audition in-point. It was chosen for balance rather than maximum
  // contrast: it gives a 15.7 dB release across the 45.92s payoff without dropping to digital
  // silence, and lands the arrangement's recovery so the music holds full level through the
  // sign-off instead of tapering under it. Ducking is automatic from the voiceover cues above.
  music: {
    asset: "musicBed",
    startAt: 8.38,
    trimBefore: 2.5,
    volume: 0.55,
    loop: false,
    fadeIn: 0.2,
    fadeOut: 2.5,
    ducking: { level: 0.28, ramp: 0.35 },
  },

  scenes: [
    // ═══ ACT 1 · ORDINARY LIFE ═══════════════════════ 0:00–0:08.4 · no typography
    {
      // Long enough for the exhale to complete before we leave her.
      scene: "media", label: "1.1 desk exhale", duration: 4.6,
      // trimBefore: the source clip's own first frame steps 1.47x its steady-state motion - a
      // defect in the generated footage, and the only clip of the 23 that has one. Entering 5
      // frames in opens on settled motion instead. Duration is untouched (6.0s clip, 4.6s shot).
      props: { safeArea: "social", media: { asset: "a1DeskExhale", trimBefore: 0.208, kenBurns: { from: 1, to: 1.04 } } },
    },
    {
      // CUT, not dissolve: same room, same light, same woman — a fade would only smear her.
      scene: "media", label: "1.3 reach phone", duration: 3.8,
      transition: cut,
      props: { safeArea: "social", media: { asset: "a1ReachPhone", kenBurns: { from: 1, to: 1.04 } } },
    },

    // ═══ ACT 2 · CARIBBEAN ═══════════════════════════ 0:08.4–0:18 · BREATHE
    {
      // THE SMASH. Her hand reaching for the phone motivates hands pushing the doors open.
      scene: "media", label: "2.1 balcony doors", duration: 3.8,
      transition: cut,
      props: { safeArea: "social", media: { asset: "a2BalconyDoors", kenBurns: { from: 1, to: 1.05 } } },
    },
    {
      // Action match: the doors reveal the turquoise, she walks into it.
      scene: "media", label: "2.2 sand walk · BREATHE", duration: 2.9,
      transition: cut,
      props: {
        safeArea: "social", titleVariant: "display", title: "Breathe.",
        media: { asset: "a2SandWalk", scrim: lowerScrim, kenBurns: { from: 1.02, to: 1.06 } },
      },
    },
    {
      scene: "media", label: "2.3 yacht", duration: 2.9,
      transition: cut,
      props: { safeArea: "social", media: { asset: "a2YachtLaugh", kenBurns: { from: 1.03, to: 1 } } },
    },

    // ═══ ACT 3 · GHANA ═══════════════════════════════ 0:17.5–0:27.5 · DISCOVER
    {
      // Country change, and both sides are bright warm daylight — a dissolve is earned here.
      scene: "media", label: "3.1 accra market", duration: 3.6,
      transition: countryChange,
      props: { safeArea: "social", media: { asset: "a3AccraStreet", kenBurns: { from: 1, to: 1.05 } } },
    },
    {
      scene: "media", label: "3.2 head-wrap · DISCOVER", duration: 3.0,
      transition: cut,
      props: {
        safeArea: "social", titleVariant: "display", title: "Discover.",
        media: { asset: "a3FabricDetail", scrim: lowerScrim, kenBurns: { from: 1.02, to: 1.06 } },
      },
    },
    {
      // Fabric match: the wax-print head-wrap cuts to wax-print dresses dancing.
      scene: "media", label: "3.4 night dance", duration: 3.0,
      transition: cut,
      props: { safeArea: "social", media: { asset: "a3NightDance", kenBurns: { from: 1, to: 1.05 } } },
    },

    // ═══ ACT 4 · DUBAI ═══════════════════════════════ 0:27–0:37 · LIVE
    {
      // Country change; night warm-light to night warm-light, so the blend holds.
      scene: "media", label: "4.1 hotel arrival · LIVE", duration: 3.6,
      transition: countryChange,
      props: {
        safeArea: "social", titleVariant: "display", title: "Live.",
        media: { asset: "a4HotelArrival", scrim: { direction: "bottom", strength: 1.35 }, kenBurns: { from: 1, to: 1.04 } },
      },
    },
    {
      scene: "media", label: "4.2 skyline", duration: 3.0,
      transition: cut,
      props: { safeArea: "social", media: { asset: "a4Skyline", kenBurns: { from: 1, to: 1.05 } } },
    },
    {
      // Composition match: the skyline she looks at becomes the skyline behind the table.
      scene: "media", label: "4.3 rooftop dinner", duration: 3.0,
      transition: cut,
      props: { safeArea: "social", media: { asset: "a4RooftopDinner", kenBurns: { from: 1.04, to: 1 } } },
    },

    // ═══ ACT 5 · CELEBRATION ═════════════════════════ 0:37–0:46 · peak, no typography
    {
      // Hard cut from night dinner to hard daylight — the gear change IS the energy lift.
      scene: "media", label: "5.2 pool jump", duration: 3.0,
      transition: cut,
      props: { safeArea: "social", media: { asset: "a5PoolJump", kenBurns: { from: 1.03, to: 1 } } },
    },
    {
      scene: "media", label: "5.5 night out", duration: 2.75,
      transition: cut,
      // trimBefore: without it this 2.75s window ends mid-gesture on a motion spike (23.4) and
      // slams into 5.4's calm opening (6.5) - the "sudden stop" under VO 6. Shifting the in-point
      // 5 frames lands the same window on the movement's settling ramp (7.5), matching the cut.
      props: { safeArea: "social", media: { asset: "a5NightOut", trimBefore: 0.208, kenBurns: { from: 1, to: 1.05 } } },
    },
    {
      // Deliberately last in the act: sunset, figures from behind, walking away — it rhymes
      // with the payoff that follows, so the hard cut into Act 6 lands as a match, not a jolt.
      scene: "media", label: "5.4 boardwalk", duration: 3.0,
      transition: cut,
      props: { safeArea: "social", media: { asset: "a5Boardwalk", kenBurns: { from: 1.03, to: 1 } } },
    },

    // ═══ ACT 6 · PAYOFF ══════════════════════════════ 0:46–0:53.4 · the release
    {
      // HARD CUT, not the V2 dissolve. Fading neon into sunset produced floating nightclub
      // faces in the sky; cutting to stillness is also the stronger dramatic move.
      scene: "media", label: "6.1 balcony sunset", duration: 4.5,
      transition: cut,
      props: { safeArea: "social", media: { asset: "a6BalconySunset", kenBurns: { from: 1, to: 1.04 } } },
    },
    {
      // The one fully earned dissolve: 6.2 was generated FROM 6.1's final frame, so this
      // cross-fades a frame into itself and reads as one continuous camera move.
      scene: "media", label: "6.2 profile · YOUR NEXT STORY", duration: 3.8,
      transition: { type: "dissolve", duration: 0.8 },
      props: {
        safeArea: "social", titleVariant: "h1", maxWidth: 820,
        title: "Your next story is waiting.",
        media: { asset: "a6FaceProfile", scrim: lowerScrim, kenBurns: { from: 1.03, to: 1 } },
      },
    },

    // ═══ ACT 7 · BRAND CLOSE ═════════════════════════ 0:53–1:00 · the CTA holds
    {
      // HARD CUT. A 0.6s dissolve was tried and rejected: it ghosted her hair across the CTA
      // and overlapped two text layers ("Your next story is waiting." on top of Shanair's name).
      // Cutting from her face straight to the brand card is also the more confident landing,
      // and it makes the whole 6.6s of endcard clean readable time instead of 6.0s.
      scene: "media", label: "7.1 endcard", duration: 6.58,
      transition: cut,
      props: {
        safeArea: "social", align: "center", justify: "center",
        media: { asset: "a7CoastPullback", scrim: { direction: "full", strength: 0.95 }, kenBurns: { from: 1.05, to: 1 } },
        children: <EndCard />,
      },
    },
  ],
};
