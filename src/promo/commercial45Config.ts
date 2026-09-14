/**
 * promo/commercial45Config — the 45-second "made with Claude Code + Remotion" commercial.
 *
 * Same concept and copy as the original 30s film (imported from ./config so the words stay in
 * one place), but 45s (1350 frames) and cut from NEW moving footage — cinematic AI-generated
 * video clips across industries (public/shanairai/brandfilm/video/*), NOT the Jet Set master.
 * Voiceover reuses the cloned-voice files (identical script) placed at the 45s beats.
 */

import { COPY } from "./config";

export const C45_FPS = 30;
export const C45_DURATION = 1350; // 45.000s

/** Contiguous section windows [startFrame, length] — the 30s beats scaled ×1.5. */
export const C45_SECTIONS = {
  hook: { from: 0, len: 180 }, // 0–6
  reveal: { from: 180, len: 180 }, // 6–12
  claude: { from: 360, len: 270 }, // 12–21
  remotion: { from: 630, len: 270 }, // 21–30
  result: { from: 900, len: 225 }, // 30–37.5
  cta: { from: 1125, len: 225 }, // 37.5–45
} as const;

const CLIP = (n: string) => `shanairai/brandfilm/video/${n}.mp4`;

/** The moving footage library (5s cinematic clips, 9:16). */
export const CLIPS = {
  fashion: CLIP("fashion"),
  architecture: CLIP("architecture"),
  dining: CLIP("dining"),
  founder: CLIP("founder"),
  car: CLIP("car"),
  skincare: CLIP("skincare"),
  watch: CLIP("watch"),
  penthouse: CLIP("penthouse"),
  startup: CLIP("startup"),
  beauty: CLIP("beauty"),
  texture: CLIP("texture"),
} as const;

/** Reuse the original on-screen copy verbatim. */
export const C45_COPY = COPY;

/** Cinematic music bed (generated Lyria track), started at its full-energy section. */
export const C45_MUSIC = { src: "shanairai/audio/music-cinematic-b.mp3", startAt: 40, gain: 0.6 } as const;

/** Sound-design whooshes into the reveal, the result and the CTA. */
export const C45_SFX: Array<{ src: string; at: number; gain: number }> = [
  { src: "jetset/audio/sfx/sfxWhoosh.wav", at: C45_SECTIONS.reveal.from - 6, gain: 0.4 },
  { src: "jetset/audio/sfx/sfxWhoosh.wav", at: C45_SECTIONS.result.from - 6, gain: 0.34 },
  { src: "jetset/audio/sfx/sfxWhoosh.wav", at: C45_SECTIONS.cta.from - 8, gain: 0.26 },
];

/**
 * Voiceover — the cloned-voice files from the 30s film (identical narration), re-placed on the
 * 45s beats. Loudnorm'd already. The bed ducks under each clip.
 */
export const C45_VOICEOVER = {
  enabled: true,
  gain: 1,
  clips: [
    { src: "shanairai/vo/vo-1-hook.mp3", at: 30, len: 108 }, // "I created this commercial without a traditional production studio."
    { src: "shanairai/vo/vo-2-build.mp3", at: 380, len: 305 }, // "I used Claude Code… and Remotion to turn code, footage, motion, music, and branding into a finished commercial."
    { src: "shanairai/vo/vo-3-result.mp3", at: 912, len: 125 }, // "This is what happens when creativity meets AI and code."
    { src: "shanairai/vo/vo-4-cta.mp3", at: 1184, len: 163 }, // "And now, I'm creating commercials like this for businesses. Your brand could be next."
  ] as ReadonlyArray<{ src: string; at: number; len: number }>,
} as { enabled: boolean; gain: number; clips: ReadonlyArray<{ src: string; at: number; len: number }> };
