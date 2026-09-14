/**
 * promo/brandfilmConfig — "Your Brand, Cinematic": a NEW, photo-led 30s concept.
 *
 * A different film from the "made with Claude Code + Remotion" reveal: this one sells Shanair.AI's
 * service to businesses. It is driven by the 17 clean high-res STILLS (public/jetset/twin/stills/*)
 * with slow cinematic Ken Burns — an editorial-photography feel — and signs off on the real founder
 * photo. Everything (copy, the photo rotation, beats, audio) is data here so it stays editable.
 *
 * 900 frames @ 30fps = 30.000s. Section windows are contiguous.
 */

export const BF_FPS = 30;
export const BF_DURATION = 900;

const IMG = (n: string) => `shanairai/brandfilm/${n}.png`;

/**
 * A fresh, purpose-generated set of cinematic stills spanning industries (Nano Banana 2, 9:16) —
 * a "what we can make for your brand" range, NOT the reused Jet Set travel shots.
 */
export const IMAGES = {
  fashion: IMG("01-fashion"), // haute-couture editorial
  architecture: IMG("02-architecture"), // luxury skyline at dusk
  dining: IMG("03-dining"), // candlelit fine dining
  founder: IMG("04-founder"), // entrepreneur at night (friction)
  set: IMG("05-set"), // empty film set (friction)
  car: IMG("06-car"), // sports car, coastal road (the pivot)
  skincare: IMG("07-skincare"), // beauty product macro
  watch: IMG("08-watch"), // luxury watch macro
  penthouse: IMG("09-penthouse"), // real-estate interior
  startup: IMG("10-startup"), // tech team
  beauty: IMG("11-beauty"), // beauty hero portrait
  texture: IMG("12-texture"), // gold + silk luxe texture (CTA)
} as const;

/** Founder photo + logo (from the endcard kit). */
export const FOUNDER_PHOTO = "jetset/brand/shanair-johnson.png";

/** Contiguous section windows [startFrame, length]. */
export const BF_SECTIONS = {
  hook: { from: 0, len: 150 }, // 0–5   the promise
  problem: { from: 150, len: 150 }, // 5–10  the friction
  turn: { from: 300, len: 90 }, // 10–13 the pivot
  offer: { from: 390, len: 210 }, // 13–20 the offer
  vision: { from: 600, len: 150 }, // 20–25 your story
  cta: { from: 750, len: 150 }, // 25–30 the sign-off
} as const;

/** A photographed beat: which still, and a Ken Burns move (scale from→to, optional pan px). */
export type PhotoBeat = { src: string; from: number; to: number; panX?: number; panY?: number; focalY?: number };

/** Music: the generated cinematic bed. */
export const BF_MUSIC = { src: "shanairai/audio/music-cinematic-b.mp3", startAt: 46, gain: 0.6 } as const;

/** SFX whooshes into the two biggest turns. */
export const BF_SFX: Array<{ src: string; at: number; gain: number }> = [
  { src: "jetset/audio/sfx/sfxWhoosh.wav", at: BF_SECTIONS.turn.from - 6, gain: 0.34 },
  { src: "jetset/audio/sfx/sfxWhoosh.wav", at: BF_SECTIONS.cta.from - 8, gain: 0.26 },
];

/** Voiceover — generated in Shanair's cloned voice (Eleven v3), loudnorm'd, locked to the beats. */
export const BF_VOICEOVER = {
  enabled: true,
  gain: 1,
  clips: [
    { src: "shanairai/vo-brandfilm/vo-1-promise.mp3", at: 20, len: 91 }, // "Every brand has a story worth telling."
    { src: "shanairai/vo-brandfilm/vo-2-friction.mp3", at: 158, len: 134 }, // "Most never get to tell it. The crew, the budget, the studio."
    { src: "shanairai/vo-brandfilm/vo-3-offer.mp3", at: 310, len: 209 }, // "But not anymore. I create cinematic commercials for businesses like yours, powered by AI and code."
    { src: "shanairai/vo-brandfilm/vo-4-vision.mp3", at: 606, len: 170 }, // "Your product. Your vision. Your story, beautifully told."
    { src: "shanairai/vo-brandfilm/vo-5-cta.mp3", at: 782, len: 91 }, // "This is Shanair A.I. Let's create yours."
  ] as ReadonlyArray<{ src: string; at: number; len: number }>,
} as { enabled: boolean; gain: number; clips: ReadonlyArray<{ src: string; at: number; len: number }> };

/** On-screen copy. */
export const BF_COPY = {
  hook: { line1: "EVERY BRAND", line2: "HAS A STORY.", sub: "Worth telling beautifully." },
  problem: { a: "Most never get told.", b: "The crew. The budget. The studio." },
  turn: "Not anymore.",
  offer: {
    lead1: "Cinematic commercials —",
    lead2: "for businesses like yours.",
    chips: ["CONCEPT", "SCRIPT", "FOOTAGE", "MOTION", "MUSIC"],
    powered: "Powered by AI + code.",
  },
  vision: { a: "Your product. Your vision.", b: "Your story — beautifully told." },
  cta: {
    eyebrow: "Custom cinematic ads",
    action: "Let's create yours.",
    name: "Shanair Johnson",
    role: "Founder · Shanair.AI",
    site: "www.shanairai.com",
  },
} as const;
