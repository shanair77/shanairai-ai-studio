/**
 * shots — the shot library + cut list for the NyelleReel.
 *
 * Think of this file as the edit decision list an editor would hand a colourist: WHAT
 * footage exists (`SHOTS`) and in WHAT ORDER and for HOW LONG it plays (`CUT_LIST`). The
 * composition never hard-codes footage — it reads this data, so re-cutting the reel is a
 * data edit, not a code edit.
 *
 * Every shot has a `src`: a `public/`-relative path or an `https://` URL. Twenty-four shots reuse
 * the LuxuryReel's night-city clips from `public/luxury/`; the twelve `ny-*` shots are Nyelle —
 * Soul 2 stills animated with Kling 3.0 (start-image) — stored in `public/nyelle/`. Set `src: null`
 * on any shot to fall back to a procedural placeholder plate in that shot's palette.
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
  // — night-city world (reused from public/luxury/) —
  { id: "lambo-arch", label: "Lamborghini · hotel entrance", src: "luxury/lambo-arch.mp4", look: AMBER, motion: "push-in" },
  { id: "chandelier", label: "Crystal chandelier · lounge", src: "luxury/chandelier.mp4", look: GOLD, motion: "rise" },
  { id: "car-interior", label: "Ambient cabin · violet light", src: "luxury/car-interior.mp4", look: VIOLET, motion: "drift-left" },
  { id: "eiffel", label: "Eiffel Tower · night", src: "luxury/eiffel.mp4", look: GOLD, motion: "pull-out" },
  { id: "skyline", label: "Rooftop · city skyline", src: "luxury/skyline.mp4", look: NAVY, motion: "drift-right" },
  { id: "rolls-dash", label: "Rolls-Royce dashboard", src: "luxury/rolls-dash.mp4", look: CREAM, motion: "push-in" },
  { id: "candlelit", label: "Candlelit table for two", src: "luxury/candlelit.mp4", look: AMBER, motion: "rise" },
  { id: "marina", label: "Marina · sunset yacht", src: "luxury/marina.mp4", look: ROSE, motion: "pull-out" },
  { id: "aerial", label: "City lights · aerial", src: "luxury/aerial.mp4", look: GOLD, motion: "push-in" },
  { id: "bar", label: "Cocktail bar · low light", src: "luxury/bar.mp4", look: AMBER, motion: "drift-right" },
  { id: "penthouse", label: "Penthouse · night view", src: "luxury/penthouse.mp4", look: NAVY, motion: "pull-out" },
  { id: "jet", label: "Private jet · tarmac", src: "luxury/jet.mp4", look: SILVER, motion: "drift-left" },
  { id: "champagne", label: "Champagne pour", src: "luxury/champagne.mp4", look: CHAMPAGNE, motion: "push-in" },
  { id: "porsche-street", label: "Vintage Porsche · wet cobbles", src: "luxury/porsche-street.mp4", look: AMBER, motion: "push-in" },
  { id: "infinity-pool", label: "Rooftop infinity pool", src: "luxury/infinity-pool.mp4", look: NAVY, motion: "drift-left" },
  { id: "whisky", label: "Whisky over ice · macro", src: "luxury/whisky.mp4", look: AMBER, motion: "push-in" },
  { id: "helicopter", label: "Helipad · city below", src: "luxury/helicopter.mp4", look: NAVY, motion: "pull-out" },
  { id: "spiral-stairs", label: "Marble spiral staircase", src: "luxury/spiral-stairs.mp4", look: CREAM, motion: "rise" },
  { id: "piano", label: "Grand piano · lounge", src: "luxury/piano.mp4", look: GOLD, motion: "push-in" },
  { id: "rooftop-bar", label: "Rooftop bar · string lights", src: "luxury/rooftop-bar.mp4", look: GOLD, motion: "drift-right" },
  { id: "jet-cabin", label: "Private jet · cabin", src: "luxury/jet-cabin.mp4", look: CREAM, motion: "drift-left" },
  { id: "monaco", label: "Monaco harbour · night", src: "luxury/monaco.mp4", look: GOLD, motion: "drift-right" },
  { id: "elevator", label: "Gold elevator · doors", src: "luxury/elevator.mp4", look: GOLD, motion: "push-in" },
  { id: "villa-pool", label: "Villa pool · violet light", src: "luxury/villa-pool.mp4", look: VIOLET, motion: "drift-left" },
  // — Nyelle (public/nyelle/) —
  { id: "ny-entrance", label: "Nyelle · hotel entrance · lanterns", src: "nyelle/ny-entrance.mp4", look: AMBER, motion: "push-in" },
  { id: "ny-window", label: "Nyelle · penthouse window · city", src: "nyelle/ny-window.mp4", look: NAVY, motion: "drift-left" },
  { id: "ny-bar", label: "Nyelle · at the bar · low light", src: "nyelle/ny-bar.mp4", look: AMBER, motion: "push-in" },
  { id: "ny-stairs", label: "Nyelle · marble staircase", src: "nyelle/ny-stairs.mp4", look: CREAM, motion: "rise" },
  { id: "ny-car", label: "Nyelle · back seat · ambient light", src: "nyelle/ny-car.mp4", look: VIOLET, motion: "drift-right" },
  { id: "ny-balcony", label: "Nyelle · balcony · Eiffel", src: "nyelle/ny-balcony.mp4", look: GOLD, motion: "pull-out" },
  { id: "ny-elevator", label: "Nyelle · gold elevator", src: "nyelle/ny-elevator.mp4", look: GOLD, motion: "push-in" },
  { id: "ny-cuff", label: "Nyelle · hands · clutch and cuff", src: "nyelle/ny-cuff.mp4", look: CHAMPAGNE, motion: "push-in" },
  { id: "ny-rooftop", label: "Nyelle · rooftop · skyline", src: "nyelle/ny-rooftop.mp4", look: NAVY, motion: "drift-left" },
  { id: "ny-corridor", label: "Nyelle · hotel corridor · walking", src: "nyelle/ny-corridor.mp4", look: CREAM, motion: "push-in" },
  { id: "ny-jet", label: "Nyelle · jet stairs", src: "nyelle/ny-jet.mp4", look: SILVER, motion: "drift-right" },
  { id: "ny-turn", label: "Nyelle · turns to camera · end card", src: "nyelle/ny-turn.mp4", look: GOLD, motion: "push-in" },
];

/** One entry in the edit: which shot, and for how long (seconds). */
export type Cut = { shot: string; seconds: number };

/**
 * The 30-second edit. Same three movements as the LuxuryReel, but with a through-line: Nyelle
 * appears in twelve of the thirty-six cuts, always as the longer beat (1.0–1.4 s — a face at half
 * a second reads as a glitch), with the empty night-city shots cutting fast between her
 * appearances. She opens the reel and she closes it: the last shot is her turning to camera,
 * held under the end-card. No shot repeats.
 */
export const CUT_LIST: Cut[] = [
  // 1 — establish
  { shot: "ny-entrance", seconds: 1.4 },
  { shot: "lambo-arch", seconds: 0.7 },
  { shot: "chandelier", seconds: 0.7 },
  { shot: "ny-window", seconds: 1.2 },
  { shot: "eiffel", seconds: 0.7 },
  { shot: "skyline", seconds: 0.6 },
  { shot: "ny-bar", seconds: 1.2 },
  { shot: "whisky", seconds: 0.6 },
  { shot: "bar", seconds: 0.7 },
  { shot: "ny-stairs", seconds: 1.1 },
  { shot: "spiral-stairs", seconds: 0.6 },
  { shot: "champagne", seconds: 0.7 },
  { shot: "ny-car", seconds: 1.2 },
  { shot: "car-interior", seconds: 0.6 },
  { shot: "rolls-dash", seconds: 0.6 },
  { shot: "porsche-street", seconds: 0.6 },
  // 2 — build
  { shot: "ny-balcony", seconds: 1.0 },
  { shot: "aerial", seconds: 0.5 },
  { shot: "monaco", seconds: 0.5 },
  { shot: "helicopter", seconds: 0.5 },
  { shot: "ny-elevator", seconds: 1.0 },
  { shot: "elevator", seconds: 0.5 },
  { shot: "piano", seconds: 0.5 },
  { shot: "candlelit", seconds: 0.5 },
  { shot: "ny-cuff", seconds: 1.0 },
  { shot: "infinity-pool", seconds: 0.5 },
  { shot: "villa-pool", seconds: 0.5 },
  { shot: "marina", seconds: 0.5 },
  { shot: "ny-rooftop", seconds: 1.0 },
  { shot: "rooftop-bar", seconds: 0.5 },
  { shot: "jet-cabin", seconds: 0.5 },
  // 3 — land
  { shot: "ny-corridor", seconds: 1.0 },
  { shot: "jet", seconds: 0.7 },
  { shot: "ny-jet", seconds: 1.1 },
  { shot: "penthouse", seconds: 0.9 },
  // end-card hold (the handle fades in over her)
  { shot: "ny-turn", seconds: 3.6 },
];

/** Total edit length in seconds (30.0 for the shipped cut list). */
export const totalSeconds = (cuts: Cut[] = CUT_LIST): number =>
  cuts.reduce((sum, c) => sum + c.seconds, 0);

/** Look up a shot by id; throws on a typo so a bad cut list fails loudly at build time. */
export const getShot = (id: string, shots: Shot[] = SHOTS): Shot => {
  const shot = shots.find((s) => s.id === id);
  if (!shot) throw new Error(`NyelleReel: cut list references unknown shot "${id}".`);
  return shot;
};
