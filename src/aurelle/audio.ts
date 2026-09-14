/**
 * aurelle/audio — the sound architecture for ShanairAICommercial45.
 *
 * The commercial is scored in two music movements from one cinematic bed, split by the hard
 * cut at 0:15 (the hook): MOVEMENT A carries the luxurious AURELLE act and is cut dead at the
 * freeze; after ~0.5s of uncomfortable near-silence MOVEMENT B rebuilds under the
 * deconstruction, swells through the reveal, drives the capability montage, and resolves on
 * the brand. Both are trimmed segments of the same file so they read as related-but-distinct.
 *
 * SFX are layered as one-shots from a dedicated palette synthesized by scripts/aurelle-sfx.sh
 * (flash pops, metallic clasp lock, UI ticks, pull-back zip, tension riser, sub-drop impacts,
 * industry swishes, and two brand stings) — all peak-normalized to −3 dBFS so each cue's `gain`
 * is purely a mix-balance decision. Placement frames are matched to the on-screen beats.
 */

import { FPS, DURATION, FREEZE_FRAME, S } from "./config";

const sec = (t: number): number => Math.round(t * FPS);

/* ─────────────────────────── music ─────────────────────────── */

/** Existing cinematic bed (≈101s) — reused for both movements via different trim in-points. */
export const MUSIC_SRC = "shanairai/audio/music-cinematic-b.mp3";

export const MUSIC = {
  /** Movement A — the AURELLE act. Starts at the top of the bed. */
  a: { startAt: 0.0, gain: 0.82 },
  /** Movement B — deconstruction → resolve. A later, more driving segment of the same bed. */
  b: { startAt: 32.0, gain: 0.9 },
} as const;

/** Movement A volume: slow fade up, hold luxurious, ducks under the AURELLE narrator, hard cut at freeze. */
export const musicVolumeA = (frame: number): number => {
  if (frame >= FREEZE_FRAME) return 0; // the hook: music stops dead
  const fadeIn = Math.min(1, frame / 40);
  const swell = 0.9 + 0.1 * Math.min(1, frame / (FREEZE_FRAME - 30));
  const cut = frame > FREEZE_FRAME - 6 ? Math.max(0, (FREEZE_FRAME - frame) / 6) : 1;
  return MUSIC.a.gain * fadeIn * swell * cut * duckUnderVO(frame);
};

/** Movement B volume envelope (composition frames). Rebuild → swell → drive → resolve → out. */
export const musicVolumeB = (frame: number): number => {
  const start = FREEZE_FRAME + 80; // silence through the interruption, then rebuild under deconstruction
  if (frame < start) return 0;
  const rise = Math.min(1, (frame - start) / 40);
  const fadeOut = Math.min(1, (DURATION - frame) / 40);
  // Stage gains: quiet under deconstruction, swell into the reveal, full through the pitch/finale.
  let stage = 0.55;
  if (frame >= S.reveal.from) stage = 0.85;
  if (frame >= S.industries.from) stage = 1.0;
  if (frame >= S.finale.from) stage = 1.0;
  return MUSIC.b.gain * rise * fadeOut * stage * duckUnderVO(frame);
};

/* ─────────────────────────── voiceover ─────────────────────────── */

export type VoCue = {
  /** staticFile path under public/. */
  src: string;
  /** Composition frame the line starts. */
  at: number;
  /** Line length in frames (loudnorm'd asset duration) — used for music ducking. */
  len: number;
  /** The spoken line (documentation / captions source). */
  line: string;
};

export const VO_GAIN = 1.0;

/**
 * VOICE 1 — the AURELLE campaign narrator (elegant, separate identity; a preset voice, NOT the
 * creator). Speaks ONLY during the AURELLE act; disappears completely at the freeze.
 */
export const AURELLE_VO: VoCue[] = [
  { src: "aurelle/audio/vo/aurelle/01-some-brands.mp3", at: 8, len: 57, line: "Some brands are seen." },
  { src: "aurelle/audio/vo/aurelle/02-others-remembered.mp3", at: 74, len: 74, line: "Others are remembered." },
  { src: "aurelle/audio/vo/aurelle/03-crafted-intention.mp3", at: 152, len: 73, line: "Crafted with intention." },
  { src: "aurelle/audio/vo/aurelle/05-aurelle.mp3", at: 318, len: 47, line: "AURELLE." }, // closing signature, on the hero
];

/**
 * VOICE 2 — the Shanair.AI / creator narrator (the cloned Shanair voice). Enters ONLY after the
 * break; the change of voice is itself part of the reveal.
 */
export const SHANAIR_VO: VoCue[] = [
  { src: "aurelle/audio/vo/shanair/01-theres-one-thing.mp3", at: 470, len: 48, line: "There's just one thing." }, //         deconstruct — enters right after the silence
  { src: "aurelle/audio/vo/shanair/02-aurelle-doesnt-exist.mp3", at: 574, len: 74, line: "AURELLE doesn't exist." }, //      reveal
  { src: "aurelle/audio/vo/shanair/11-built-with.mp3", at: 716, len: 99, line: "Built with Shanair A-I." }, //             proof
  { src: "aurelle/audio/vo/shanair/12-launch-ready.mp3", at: 850, len: 138, line: "Launch-ready commercials for brands that need to look established now." }, // offer — MiniMax; "now" lands on the NOW stamp
  { src: "aurelle/audio/vo/shanair/08-industries.mp3", at: 1014, len: 138, line: "Restaurants. Real estate. Travel. Beauty." }, // industries
  { src: "aurelle/audio/vo/shanair/10-shanair-unforgettable.mp3", at: 1160, len: 148, line: "Shanair A-I. Let's make your business unforgettable." }, // finale
];

/** All narration, for the assembly to render and for sidechain ducking. The two voices never overlap. */
export const VO: VoCue[] = [...AURELLE_VO, ...SHANAIR_VO];

/** Sidechain: whichever music movement is playing dips to ~26% under any VO line (10-frame ramp). */
export const duckUnderVO = (frame: number): number => {
  let duck = 1;
  const R = 10;
  for (const v of VO) {
    const s = v.at;
    const e = v.at + v.len;
    if (frame >= s - R && frame <= e + R) {
      const edge = Math.max(0, Math.min(1, (frame - (s - R)) / R, (e + R - frame) / R));
      duck = Math.min(duck, 1 - 0.74 * edge);
    }
  }
  return duck;
};

/* ─────────────────────────── SFX ─────────────────────────── */

export type SfxCue = {
  /** Composition frame to fire. */
  at: number;
  /** Gain 0–1 (every asset is peak-normalized to −3 dBFS, so this is the mix balance). */
  gain: number;
  /** staticFile path of the dedicated one-shot. */
  src: string;
  /** Sequence length in frames — long enough to let a tail ring. Defaults to 45. */
  durFrames?: number;
  /** What this cue is. */
  note: string;
};

/**
 * The dedicated SFX palette — synthesized procedurally by scripts/aurelle-sfx.sh (no library,
 * no generation credits) and peak-normalized to −3 dBFS. Rerun that script to regenerate.
 */
const SFXDIR = "aurelle/audio/sfx";
const sfx = {
  flash: `${SFXDIR}/flash.wav`,
  flashBurst: `${SFXDIR}/flash-burst.wav`,
  claspClick: `${SFXDIR}/clasp-click.wav`,
  heroAir: `${SFXDIR}/hero-air.wav`,
  uiClick: `${SFXDIR}/ui-click.wav`,
  uiTick: `${SFXDIR}/ui-tick.wav`,
  layersDetach: `${SFXDIR}/layers-detach.wav`,
  assemble: `${SFXDIR}/assemble.wav`,
  riser: `${SFXDIR}/riser.wav`,
  impactA: `${SFXDIR}/impact-a.wav`,
  impactB: `${SFXDIR}/impact-b.wav`,
  brandSting: `${SFXDIR}/brand-sting.wav`,
  swishA: `${SFXDIR}/swish-a.wav`,
  swishB: `${SFXDIR}/swish-b.wav`,
  converge: `${SFXDIR}/converge.wav`,
  logoSting: `${SFXDIR}/logo-sting.wav`,
} as const;

/** One-shot schedule. `at` frames are authoritative and matched to the on-screen beats. */
export const SFX: SfxCue[] = [
  // Act 1 — paparazzi flashes under the visual FlashBurst.
  { at: S.arrival.from + 14, gain: 0.32, src: sfx.flash, note: "camera flash pop 1" },
  { at: S.arrival.from + 34, gain: 0.28, src: sfx.flash, note: "camera flash pop 2" },
  { at: S.arrival.from + 60, gain: 0.42, src: sfx.flashBurst, note: "camera flash pop 3 (burst)" },
  // Act 1 — the clasp CLICK on the hard cut out of the macro.
  { at: S.clasp.from + S.clasp.len - 6, gain: 0.55, src: sfx.claspClick, note: "clasp CLICK (metallic lock)" },
  // Act 1 — soft transition air into the calm hero.
  { at: S.hero.from - 4, gain: 0.32, src: sfx.heroAir, note: "settle into hero" },
  // Act 2 — cursor click + selection tick (during the silence).
  { at: S.interrupt.from + 44, gain: 0.5, src: sfx.uiClick, note: "cursor click (select AURELLE)" },
  { at: S.interrupt.from + 52, gain: 0.4, src: sfx.uiTick, note: "selection UI tick" },
  // Act 3 — layer detach + labels assembling.
  { at: S.deconstruct.from + 2, gain: 0.5, src: sfx.layersDetach, note: "layers detach / pull back" },
  { at: S.deconstruct.from + 70, gain: 0.42, src: sfx.assemble, note: "labels assemble" },
  // Act 4 — riser into the reveal, then a low impact under each stamp.
  { at: S.reveal.from - 12, gain: 0.5, src: sfx.riser, durFrames: 34, note: "riser into reveal" },
  { at: S.reveal.from + 18, gain: 0.62, src: sfx.impactA, durFrames: 42, note: "impact — AURELLE doesn't exist" },
  { at: S.reveal.from + 52, gain: 0.5, src: sfx.impactB, note: "impact — the product" },
  { at: S.reveal.from + 87, gain: 0.54, src: sfx.impactA, durFrames: 42, note: "impact — the flagship" },
  { at: S.reveal.from + 120, gain: 0.56, src: sfx.impactB, note: "impact — the campaign" },
  // Act 5 — built with Shanair.AI brand sting.
  { at: S.proof.from + 12, gain: 0.5, src: sfx.brandSting, durFrames: 50, note: "built with Shanair.AI — brand sting" },
  // Act 7 — rhythmic industry cuts (alternating swish variants; 35f per shot).
  { at: S.industries.from + 4, gain: 0.4, src: sfx.swishA, note: "cut → restaurants" },
  { at: S.industries.from + 39, gain: 0.4, src: sfx.swishB, note: "cut → real estate" },
  { at: S.industries.from + 74, gain: 0.4, src: sfx.swishA, note: "cut → travel" },
  { at: S.industries.from + 109, gain: 0.4, src: sfx.swishB, note: "cut → beauty" },
  // Act 8 — brand converge + the Shanair.AI sonic logo.
  { at: S.finale.from + 16, gain: 0.4, src: sfx.converge, note: "brand converge" },
  { at: S.finale.from + 96, gain: 0.58, src: sfx.logoSting, durFrames: 80, note: "Shanair.AI sonic sting" },
];

export { sec };
