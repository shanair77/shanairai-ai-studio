/**
 * jetset/assets — the Jet Set Adventures asset kit.
 *
 * Declares EVERY asset the master film references, including the ones that do not exist yet.
 * That is deliberate: a name declared here but missing on disk is caught by the manifest check
 * (`./manifest`) BEFORE a render is attempted, rather than surfacing as a silent black frame or
 * a mute track in the output. Nothing here points at a test fixture.
 *
 * Provenance and licensing live in each definition's `metadata`/`roles`, so an asset can never
 * drift away from the terms it was obtained under.
 */

import { defineAsset, defineAssetKit } from "../assets";

const video = (path: string, durationInSeconds: number) =>
  defineAsset({
    category: "video",
    source: `jetset/video/${path}`,
    metadata: { width: 1080, height: 1920, durationInSeconds },
  });

const vo = (path: string, durationInSeconds: number) =>
  defineAsset({ category: "audio", source: `jetset/audio/vo/${path}`, metadata: { durationInSeconds } });

const sfx = (path: string, durationInSeconds: number) =>
  defineAsset({ category: "audio", source: `jetset/audio/sfx/${path}`, metadata: { durationInSeconds } });

const ambience = (path: string, durationInSeconds: number) =>
  defineAsset({ category: "audio", source: `jetset/audio/ambience/${path}`, metadata: { durationInSeconds } });

export const jetSetAssets = {
  // --- brand ---
  badge: defineAsset({
    category: "image",
    source: "jetset/brand/logo.png",
    metadata: { width: 500, height: 500, transparent: true },
    roles: ["logo"],
  }),
  advisor: defineAsset({
    category: "image",
    source: "jetset/brand/shanair-johnson.png",
    metadata: { width: 1024, height: 1024, transparent: true },
    roles: ["overlay"],
  }),

  // --- act 1 · ordinary life ---
  a1DeskExhale: video("a1-desk-exhale.mp4", 8),
  a1HandStill: video("a1-hand-still.mp4", 8),
  a1ReachPhone: video("a1-reach-phone.mp4", 8),

  // --- act 2 · caribbean ---
  a2BalconyDoors: video("a2-balcony-doors.mp4", 8),
  a2SandWalk: video("a2-sand-walk.mp4", 8),
  a2YachtLaugh: video("a2-yacht-laugh.mp4", 8),
  a2Champagne: video("a2-champagne.mp4", 8),

  // --- act 3 · ghana ---
  a3AccraStreet: video("a3-accra-street.mp4", 8),
  a3FabricDetail: video("a3-fabric-detail.mp4", 8),
  a3RooftopFood: video("a3-rooftop-food.mp4", 8),
  a3NightDance: video("a3-night-dance.mp4", 8),

  // --- act 4 · dubai ---
  a4HotelArrival: video("a4-hotel-arrival.mp4", 8),
  a4Skyline: video("a4-skyline.mp4", 8),
  a4RooftopDinner: video("a4-rooftop-dinner.mp4", 8),
  a4Desert: video("a4-desert.mp4", 8),

  // --- act 5 · celebration ---
  a5Arrivals: video("a5-arrivals.mp4", 8),
  a5PoolJump: video("a5-pool-jump.mp4", 8),
  a5Birthday: video("a5-birthday.mp4", 8),
  a5Boardwalk: video("a5-boardwalk.mp4", 8),
  a5NightOut: video("a5-night-out.mp4", 8),

  // --- act 6 · payoff ---
  a6BalconySunset: video("a6-balcony-sunset.mp4", 8),
  a6FaceProfile: video("a6-face-profile.mp4", 8),

  // --- act 7 · brand close ---
  a7CoastPullback: video("a7-coast-pullback.mp4", 8),

  // --- voiceover (generated, present) ---
  vo01Hook: vo("vo-01-hook.wav", 4.22),
  vo02Breathe: vo("vo-02-breathe.wav", 4.4),
  vo03Discover: vo("vo-03-discover.wav", 4.8),
  vo04Live: vo("vo-04-live.wav", 6.08),
  vo05Occasions: vo("vo-05-occasions.wav", 3.2),
  vo06OrMaybe: vo("vo-06-ormaybe.wav", 2.28),
  vo07JustBecause: vo("vo-07-justbecause.wav", 2.28),
  vo08NoWait: vo("vo-08-nowait.wav", 4.8),
  vo09NextStory: vo("vo-09-nextstory.wav", 4.0),
  vo10Signoff: vo("vo-10-signoff.wav", 5.68),

  // --- music auditions (candidates under evaluation, not the locked bed) ---
  musicCandidate1: defineAsset({
    category: "audio",
    source: "jetset/audio/music/candidate-1.wav",
    metadata: { durationInSeconds: 150.82 },
  }),

  musicCandidate2: defineAsset({
    category: "audio",
    source: "jetset/audio/music/candidate-2.wav",
    metadata: { durationInSeconds: 119.3 },
  }),

  musicCandidate3: defineAsset({
    category: "audio",
    source: "jetset/audio/music/candidate-3.wav",
    metadata: { durationInSeconds: 114.55 },
  }),

  musicCandidate4: defineAsset({
    category: "audio",
    source: "jetset/audio/music/candidate-4.wav",
    metadata: { durationInSeconds: 58.85 },
  }),

  musicCandidate5: defineAsset({
    category: "audio",
    source: "jetset/audio/music/candidate-5.wav",
    metadata: { durationInSeconds: 58.96 },
  }),

  musicCandidate6: defineAsset({
    category: "audio",
    source: "jetset/audio/music/candidate-6.wav",
    metadata: { durationInSeconds: 54.36 },
  }),

  musicCandidate7: defineAsset({
    category: "audio",
    source: "jetset/audio/music/candidate-7.wav",
    metadata: { durationInSeconds: 86.36 },
  }),

  musicCandidate8: defineAsset({
    category: "audio",
    source: "jetset/audio/music/candidate-8.wav",
    metadata: { durationInSeconds: 86.44 },
  }),

  // --- music (generated: Artlist Lyria 3 Pro, seed 02953 — "Uplifting Afrobeat and Reggae") ---
  // Selected from eight auditions against the locked picture. The three catalogue tracks were
  // rejected: all carried an audible spoken Artlist preview watermark. This one is verified
  // clean by speech recognition (zero word events) and is the only clean candidate whose
  // arrangement releases on the 45.92s payoff and still holds full level through the sign-off.
  // Installed unmodified — the in-point, level and ducking are edit decisions and live in the
  // composition, so the source file is never re-cut on disk.
  musicBed: defineAsset({
    category: "audio",
    source: "jetset/audio/music/bed-afrobeat-lyria-02953.wav",
    metadata: { durationInSeconds: 86.44 },
  }),

  // --- ambience beds — these LOOP ---
  // Filenames are the asset key: that is what the acquisition layer writes (`destinationFor`),
  // so the kit names what actually lands on disk rather than a parallel convention.
  ambRoomTone: ambience("ambRoomTone.wav", 12),
  ambOcean: ambience("ambOcean.wav", 14),
  ambAccra: ambience("ambAccra.wav", 14),
  ambBalconyWind: ambience("ambBalconyWind.wav", 18),

  // --- one-shot sound design — these must NOT loop ---
  sfxPhoneTap: sfx("sfxPhoneTap.wav", 0.48),
  sfxWhoosh: sfx("sfxWhoosh.wav", 1.48),
  sfxLuggage: sfx("sfxLuggage.wav", 3.0),
  sfxSplash: sfx("sfxSplash.wav", 2.0),
} as const;

/** Typed, category-safe kit. Component names are compile-checked against the map above. */
export const jetSetKit = defineAssetKit(jetSetAssets);
