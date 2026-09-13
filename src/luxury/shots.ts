/**
 * shots — the shot library + cut list for the LuxuryReel.
 *
 * Think of this file as the edit decision list an editor would hand a colourist: WHAT
 * footage exists (`SHOTS`) and in WHAT ORDER and for HOW LONG it plays (`CUT_LIST`). The
 * composition never hard-codes footage — it reads this data, so re-cutting the reel is a
 * data edit, not a code edit.
 *
 * Every shot has a `src` that points at `public/`. Until you drop a real clip in, leave
 * `src: null` and the reel renders a procedural "placeholder" plate in that shot's palette
 * so the timing, caption, and grade can be reviewed end to end.
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

/** The footage library. Fill in `src` as you collect clips. */
export const SHOTS: Shot[] = [
  { id: "lambo-arch", label: "Lamborghini · hotel entrance", src: null, look: AMBER, motion: "push-in" },
  { id: "chandelier", label: "Crystal chandelier · lounge", src: null, look: GOLD, motion: "rise" },
  { id: "car-interior", label: "Ambient cabin · violet light", src: null, look: VIOLET, motion: "drift-left" },
  { id: "eiffel", label: "Eiffel Tower · night", src: null, look: GOLD, motion: "pull-out" },
  { id: "skyline", label: "Rooftop · city skyline", src: null, look: NAVY, motion: "drift-right" },
  { id: "rolls-dash", label: "Rolls-Royce dashboard", src: null, look: CREAM, motion: "push-in" },
  { id: "candlelit", label: "Candlelit table for two", src: null, look: AMBER, motion: "rise" },
  { id: "chef", label: "Private chef · plating", src: null, look: CREAM, motion: "drift-left" },
  { id: "marina", label: "Marina · sunset yacht", src: null, look: ROSE, motion: "pull-out" },
  { id: "aerial", label: "City lights · aerial", src: null, look: GOLD, motion: "push-in" },
  { id: "bar", label: "Cocktail bar · low light", src: null, look: AMBER, motion: "drift-right" },
  { id: "penthouse", label: "Penthouse · night view", src: null, look: NAVY, motion: "pull-out" },
  { id: "watch", label: "Timepiece · macro", src: null, look: SILVER, motion: "push-in" },
  { id: "jet", label: "Private jet · tarmac", src: null, look: SILVER, motion: "drift-left" },
  { id: "lobby", label: "Hotel lobby · marble", src: null, look: CREAM, motion: "rise" },
  { id: "champagne", label: "Champagne pour", src: null, look: CHAMPAGNE, motion: "push-in" },
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
