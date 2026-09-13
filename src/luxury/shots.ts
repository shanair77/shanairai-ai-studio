/**
 * shots — the shot library + cut list for the LuxuryReel.
 *
 * Think of this file as the edit decision list an editor would hand a colourist: WHAT
 * footage exists (`SHOTS`) and in WHAT ORDER and for HOW LONG it plays (`CUT_LIST`). The
 * composition never hard-codes footage — it reads this data, so re-cutting the reel is a
 * data edit, not a code edit.
 *
 * Every shot has a `src`: a `public/`-relative path or an `https://` URL. The shipped set
 * was generated with Higgsfield (Kling 3.0 pro, 9:16, 5 s, silent; `chef` and `champagne`
 * with Seedance 2.5 at 1080p) and points at the CDN URLs it returned; run `node scripts/download-luxury-clips.mjs` to pull them into
 * `public/luxury/` and make the reel render offline. Set `src: null` on any shot to fall
 * back to a procedural "placeholder" plate in that shot's palette.
 */

/** A palette that drives the placeholder plate (and the grade's tint hint). */
export type ShotLook = {
  /** Deep base colour of the plate. */
  base: string;
  /** Second gradient stop. */
  mid: string;
  /** Colour of the bokeh "practical" lights. */
  glow: string;
};

/** Slow camera moves applied on top of the footage (all frame-driven). */
export type ShotMotion = "push-in" | "pull-out" | "drift-left" | "drift-right" | "rise";

export type Shot = {
  /** Stable id referenced by the cut list. */
  id: string;
  /** What the footage should be — doubles as the placeholder label. */
  label: string;
  /**
   * `public/`-relative path of a video (`.mp4`/`.mov`/`.webm`) or image (`.jpg`/`.png`).
   * `null` = not supplied yet → placeholder plate.
   */
  src: string | null;
  /** Seconds into the source clip to start from (videos only). Default 0. */
  trimStart?: number;
  look: ShotLook;
  motion: ShotMotion;
};

const GOLD: ShotLook = { base: "#07060a", mid: "#2a1d0c", glow: "#f2c66d" };
const AMBER: ShotLook = { base: "#080604", mid: "#3a2410", glow: "#ffb45c" };
const VIOLET: ShotLook = { base: "#07050f", mid: "#2a1247", glow: "#c46bff" };
const NAVY: ShotLook = { base: "#03050d", mid: "#0c1a3a", glow: "#8fc3ff" };
const CREAM: ShotLook = { base: "#0a0806", mid: "#4a3521", glow: "#f5e2c8" };
const ROSE: ShotLook = { base: "#0b0510", mid: "#4a1a3a", glow: "#ff8ab8" };
const SILVER: ShotLook = { base: "#060708", mid: "#232830", glow: "#dfe6f0" };
const CHAMPAGNE: ShotLook = { base: "#0a0804", mid: "#3d2e12", glow: "#ffe6a3" };

/** The footage library. Swap any `src` to re-cast a shot. */
export const SHOTS: Shot[] = [
  { id: "lambo-arch", label: "Lamborghini · hotel entrance", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165136_17fce50c-f888-4715-8790-805227cfd4d8.mp4", look: AMBER, motion: "push-in" },
  { id: "chandelier", label: "Crystal chandelier · lounge", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165135_727feb2d-938d-42cb-a17e-ff5d31cf8c06.mp4", look: GOLD, motion: "rise" },
  { id: "car-interior", label: "Ambient cabin · violet light", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165135_701036ac-00f1-4a6f-987d-b78a55e5201a.mp4", look: VIOLET, motion: "drift-left" },
  { id: "eiffel", label: "Eiffel Tower · night", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165226_b8e39814-3856-468f-9549-b5def3fc06f8.mp4", look: GOLD, motion: "pull-out" },
  { id: "skyline", label: "Rooftop · city skyline", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165226_4d655bb8-c60d-4289-873e-5e568c42bd87.mp4", look: NAVY, motion: "drift-right" },
  { id: "rolls-dash", label: "Rolls-Royce dashboard", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165135_5ea20494-cb8d-472a-ad80-adf290f743e4.mp4", look: CREAM, motion: "push-in" },
  { id: "candlelit", label: "Candlelit table for two", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165135_db882c40-d954-488e-be3f-e7d047615fcd.mp4", look: AMBER, motion: "rise" },
  { id: "chef", label: "Private chef · plating", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_201353_5e4f799f-d485-49eb-9130-2c31c016da54.mp4", look: CREAM, motion: "drift-left" },
  { id: "marina", label: "Marina · sunset yacht", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165135_e114e740-66ad-45d7-8b97-b7afaccafba1.mp4", look: ROSE, motion: "pull-out" },
  { id: "aerial", label: "City lights · aerial", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165226_bc4f53d5-77a4-40a4-bb22-801f969f63c0.mp4", look: GOLD, motion: "push-in" },
  { id: "bar", label: "Cocktail bar · low light", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165226_298414ac-d485-48e7-8fd6-fdc908d15420.mp4", look: AMBER, motion: "drift-right" },
  { id: "penthouse", label: "Penthouse · night view", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165226_76585147-9248-46d7-8911-7ec6ad37b910.mp4", look: NAVY, motion: "pull-out" },
  { id: "watch", label: "Timepiece · macro", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165155_196f94f5-e983-44af-9850-900ffd822a12.mp4", look: SILVER, motion: "push-in" },
  { id: "jet", label: "Private jet · tarmac", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165226_d2ec55b2-76f3-4eca-b045-74dca0cffd53.mp4", look: SILVER, motion: "drift-left" },
  { id: "lobby", label: "Hotel lobby · marble", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_165156_e5ecaf7c-0f27-4a90-9f84-c1b87a416a8d.mp4", look: CREAM, motion: "rise" },
  { id: "champagne", label: "Champagne pour", src: "https://d8j0ntlcm91z4.cloudfront.net/user_350xJ30dkMG1ZXDgehYxBNghBYM/hf_20260913_201354_86cf475b-92d1-4c1e-9f31-8233223e2bdc.mp4", look: CHAMPAGNE, motion: "push-in" },
];

/** One entry in the edit: which shot, and for how long (seconds). */
export type Cut = { shot: string; seconds: number };

/**
 * The 30-second edit. Three movements, like a piece of music:
 *   1. Establish (0–13s): every location once, ~0.7–1.0s each, opening on the hero shot.
 *   2. Build (13–22s): the same shots again but half a beat faster — the "callback" that
 *      makes a montage feel intentional instead of random.
 *   3. Land (22–30s): slow back down, then hold the last shot for the handle end-card.
 * Cuts are hard (no cross-fades) — that is the reference's language.
 */
export const CUT_LIST: Cut[] = [
  // 1 — establish
  { shot: "lambo-arch", seconds: 1.4 },
  { shot: "chandelier", seconds: 0.8 },
  { shot: "car-interior", seconds: 0.7 },
  { shot: "eiffel", seconds: 0.9 },
  { shot: "skyline", seconds: 0.8 },
  { shot: "rolls-dash", seconds: 0.7 },
  { shot: "candlelit", seconds: 1.0 },
  { shot: "chef", seconds: 0.8 },
  { shot: "marina", seconds: 0.9 },
  { shot: "aerial", seconds: 0.7 },
  { shot: "bar", seconds: 0.8 },
  { shot: "penthouse", seconds: 0.7 },
  { shot: "watch", seconds: 0.6 },
  { shot: "jet", seconds: 0.9 },
  { shot: "lobby", seconds: 0.7 },
  { shot: "champagne", seconds: 0.8 },
  // 2 — build (faster callbacks)
  { shot: "lambo-arch", seconds: 0.6 },
  { shot: "car-interior", seconds: 0.5 },
  { shot: "chandelier", seconds: 0.6 },
  { shot: "rolls-dash", seconds: 0.5 },
  { shot: "eiffel", seconds: 0.6 },
  { shot: "skyline", seconds: 0.5 },
  { shot: "candlelit", seconds: 0.6 },
  { shot: "aerial", seconds: 0.5 },
  { shot: "marina", seconds: 0.6 },
  { shot: "jet", seconds: 0.5 },
  { shot: "watch", seconds: 0.5 },
  { shot: "bar", seconds: 0.6 },
  { shot: "penthouse", seconds: 0.5 },
  { shot: "chef", seconds: 0.6 },
  { shot: "champagne", seconds: 0.5 },
  { shot: "lobby", seconds: 0.6 },
  // 3 — land
  { shot: "lambo-arch", seconds: 1.0 },
  { shot: "chandelier", seconds: 0.8 },
  { shot: "eiffel", seconds: 0.9 },
  { shot: "rolls-dash", seconds: 0.8 },
  { shot: "skyline", seconds: 1.2 },
  // end-card hold (the handle fades in over this shot)
  { shot: "penthouse", seconds: 3.3 },
];

/** Total edit length in seconds (30.0 for the shipped cut list). */
export const totalSeconds = (cuts: Cut[] = CUT_LIST): number =>
  cuts.reduce((sum, c) => sum + c.seconds, 0);

/** Look up a shot by id; throws on a typo so a bad cut list fails loudly at build time. */
export const getShot = (id: string, shots: Shot[] = SHOTS): Shot => {
  const shot = shots.find((s) => s.id === id);
  if (!shot) throw new Error(`LuxuryReel: cut list references unknown shot "${id}".`);
  return shot;
};
