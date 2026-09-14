/**
 * promo/config — the entire edit as data.
 *
 * Every timing, every line of copy, every footage in-point, the music bed and the (drop-in)
 * voiceover live here so the film can be re-timed or re-worded without touching a component.
 * Frames are at 30fps; 900 total = exactly 30.000s. Section ranges are contiguous and cover
 * the whole timeline, matching the brief's beat sheet 1:1.
 *
 * The hero footage is the finished 60s Jet Set Adventures master (public/shanairai/…). The
 * IN-POINTS below are seconds into that master, chosen to sit cleanly INSIDE a single shot
 * (verified against the master's scene-cut map) and to avoid the master's own baked-in
 * lower-thirds ("Breathe." / "Discover." / "Live." / "Your next story…") and its endcard.
 */

export const FPS = 30;
export const DURATION_IN_FRAMES = 900; // 30.000s

/** Path (under public/) to the finished Jet Set master used as the hero footage. */
export const HERO_SRC = "shanairai/final-jet-set-ad.mp4";

/** Contiguous section windows [startFrame, length]. */
export const SECTIONS = {
  hook: { from: 0, len: 120 }, // 0.0–4.0  — the hook
  reveal: { from: 120, len: 120 }, // 4.0–8.0  — the reveal
  claude: { from: 240, len: 180 }, // 8.0–14.0 — Claude Code
  remotion: { from: 420, len: 180 }, // 14.0–20.0 — Remotion
  result: { from: 600, len: 150 }, // 20.0–25.0 — the result
  cta: { from: 750, len: 150 }, // 25.0–30.0 — the business CTA
} as const;

/**
 * Clean in-points (seconds) into the 60s master. Each is safely inside one shot.
 * Shot map (cuts): 4.58 · 8.38 · 12.17 · 15.08 · 16.79 · 18.00 · 21.58 · 24.58 · 27.58 ·
 * 31.17 · 34.17 · 37.17 · 40.17 · 42.92 · 44.42 · 45.92 · 53.42.
 */
export const SHOTS = {
  deskExhale: 0.6, // ordinary life — opening
  balconyDoors: 9.0, // doors open onto the ocean (reveal)
  yacht: 15.35, // yacht, laughing, ocean spray
  nightDance: 25.0, // night, string lights, drums
  dubaiSkyline: 31.5, // Burj Khalifa skyline, balcony silhouette
  rooftopDinner: 34.6, // candlelit rooftop dinner, gold dress
  poolJump: 37.7, // body entering water — splash
  neonDance: 40.6, // gold dress, neon, dancing
  boardwalk: 43.2, // boardwalk, hands, golden hour
  balconySunset: 46.2, // balcony overlook, sunset, robe
} as const;

/** Music bed: the license-verified, owned track from the locked master. */
export const MUSIC = {
  src: "jetset/audio/music/bed-afrobeat-lyria-02953.wav",
  /** Seconds trimmed from the head of the bed to reach an energetic bar. */
  startAt: 2.5,
  /** Peak bed level. Ducked automatically under the CTA VO (see ShanairCommercial). */
  gain: 0.62,
} as const;

/**
 * Sound-design placeholders — subtle, owned SFX at the two biggest turns. Low level so they
 * read as texture, not stingers. Disable by emptying the array.
 */
export const SFX: Array<{ src: string; at: number; gain: number }> = [
  { src: "jetset/audio/sfx/sfxWhoosh.wav", at: SECTIONS.reveal.from - 6, gain: 0.4 }, // into the reveal
  { src: "jetset/audio/sfx/sfxWhoosh.wav", at: SECTIONS.result.from - 6, gain: 0.34 }, // into the result
  { src: "jetset/audio/sfx/sfxWhoosh.wav", at: SECTIONS.cta.from - 8, gain: 0.26 }, // into the CTA (kept low; VO is playing)
];

/**
 * VOICEOVER — drop-in. The edit is TIMED to this narration (the `beats` are where each line
 * lands, in frames). No audio ships yet, so `enabled` is false and the film renders clean.
 * To add it later: drop a ~27–28s file at public/<src>, set `enabled: true`. Nothing else moves.
 *
 * Script (≈27–28s):
 *  "I created this commercial without a traditional production studio. I used Claude Code to
 *   help build the experience, and Remotion to turn code, footage, motion, music, and branding
 *   into a finished commercial. This is what happens when creativity meets AI and code. And now,
 *   I'm creating commercials like this for businesses. Your brand could be next."
 */
export const VOICEOVER = {
  enabled: true,
  gain: 1,
  /**
   * The narration, generated in natural sentence-chunks (Artlist · "Aspire", Eleven v3, American)
   * and locked to the beats: each `at` is the composition frame the chunk starts on, `len` its
   * length in frames. The music bed ducks automatically under every chunk (see ShanairCommercial).
   * To re-voice: replace the files at public/<src> and update `len` to the new durations.
   */
  clips: [
    // "I created this commercial without a traditional production studio."
    { src: "shanairai/vo/vo-1-hook.mp3", at: 24, len: 108 },
    // "I used Claude Code to help build the experience, and Remotion to turn code, footage,
    //  motion, music, and branding into a finished commercial."
    { src: "shanairai/vo/vo-2-build.mp3", at: 250, len: 305 },
    // "This is what happens when creativity meets AI and code."
    { src: "shanairai/vo/vo-3-result.mp3", at: 605, len: 125 },
    // "And now, I'm creating commercials like this for businesses. Your brand could be next."
    // Placed so "…could be next." lands on the wordmark and finishes just before frame 900.
    { src: "shanairai/vo/vo-4-cta.mp3", at: 734, len: 163 },
  ],
} as const;

/** All on-screen copy, per section. Editing a line here re-letters the film. */
export const COPY = {
  hook: { line1: "I MADE THIS", line2: "COMMERCIAL.", turn: "But not the way you think." },
  reveal: { a: "No film crew.", b: "No production studio.", tool1: "Claude Code", plus: "+", tool2: "Remotion" },
  claude: {
    prompt: "Create a cinematic 60-second luxury travel commercial…",
    direct: "I direct the vision.",
    build: "Claude Code helps build it.",
  },
  remotion: {
    lead: "Remotion turns code into video.",
    tracks: ["VIDEO", "TEXT", "MOTION", "MUSIC", "BRANDING"],
    every: ["Every scene.", "Every transition.", "Every frame."],
    built: "Built with code.",
  },
  result: { q: "The result?", a: "A cinematic commercial.", b: "Built differently." },
  cta: {
    eyebrow: "For your business",
    head: "YOUR BUSINESS COULD LOOK LIKE THIS.",
    sub1: "Custom Commercial Ads",
    sub2: "Powered by AI + Code",
    action: "Let's create yours.",
    site: "www.shanairai.com",
  },
} as const;

/* ─────────────────────────── variants (A/B) ─────────────────────────── */

/** The on-screen copy contract — one shape, so a variant can re-letter the film. */
export type PromoCopy = {
  hook: { line1: string; line2: string; turn: string };
  reveal: { a: string; b: string; tool1: string; plus: string; tool2: string };
  claude: { prompt: string; direct: string; build: string };
  remotion: { lead: string; tracks: readonly string[]; every: readonly string[]; built: string };
  result: { q: string; a: string; b: string };
  cta: { eyebrow: string; head: string; sub1: string; sub2: string; action: string; site: string };
};

export type MusicSpec = { src: string; startAt: number; gain: number };
export type SfxCue = { src: string; at: number; gain: number };
export type VoiceoverSpec = {
  enabled: boolean;
  gain: number;
  clips: ReadonlyArray<{ src: string; at: number; len: number }>;
};

/** Everything that can differ between cuts. Sections read `copy`; the assembler reads the audio. */
export type PromoVariant = {
  id: string;
  copy: PromoCopy;
  music: MusicSpec;
  sfx: ReadonlyArray<SfxCue>;
  voiceover: VoiceoverSpec;
};

/** Variant A — the original cut. */
export const variantA: PromoVariant = {
  id: "ShanairAI-RemotionCommercial",
  copy: COPY,
  music: MUSIC,
  sfx: SFX,
  voiceover: VOICEOVER,
};

/**
 * Variant B — the A/B test: a more direct hook, alternate copy accents, and a cooler,
 * purpose-generated cinematic music bed (Lyria 3 Pro, instrumental). Same footage, same
 * cloned-voice narration (the script is unchanged), same CTA (the brand message is the constant).
 */
export const variantB: PromoVariant = {
  id: "ShanairAI-RemotionCommercial-B",
  copy: {
    hook: { line1: "THIS IS A REAL", line2: "COMMERCIAL.", turn: "I built it with code." },
    reveal: { a: "No film crew.", b: "No editing suite.", tool1: "Claude Code", plus: "+", tool2: "Remotion" },
    claude: { prompt: COPY.claude.prompt, direct: "I set the direction.", build: "Claude Code builds it." },
    remotion: {
      lead: "Remotion renders every frame.",
      tracks: COPY.remotion.tracks,
      every: COPY.remotion.every,
      built: "Built with code.",
    },
    result: { q: "The result?", a: "A real commercial.", b: "Made differently." },
    cta: COPY.cta,
  },
  // Cooler cinematic bed (Lyria 3 Pro, 101s). Start at 46s so the film opens mid-build and
  // blooms into the track's full climax across the reveal → result → CTA.
  music: { src: "shanairai/audio/music-cinematic-b.mp3", startAt: 46, gain: 0.55 },
  sfx: SFX,
  voiceover: VOICEOVER,
};
