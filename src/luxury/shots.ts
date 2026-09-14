/**
 * shots — the shot library + cut list for the LuxuryReel.
 *
 * Think of this file as the edit decision list an editor would hand a colourist: WHAT
 * footage exists (`SHOTS`) and in WHAT ORDER and for HOW LONG it plays (`CUT_LIST`). The
 * composition never hard-codes footage — it reads this data, so re-cutting the reel is a
 * data edit, not a code edit.
 *
 * Every shot has a `src`: a `public/`-relative path or an `https://` URL. The shipped set
 * was generated with Higgsfield (Kling 3.0 pro, 9:16, 5 s, silent; `chef`, `champagne`,
 * `aerial` and `watch` with Seedance 2.5 at 1080p) and points at the CDN URLs it returned; run `node scripts/download-luxury-clips.mjs` to pull them into
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
  { id: "lambo-arch", label: "Lamborghini · hotel entrance", src: "luxury/lambo-arch.mp4", look: AMBER, motion: "push-in" },
  { id: "chandelier", label: "Crystal chandelier · lounge", src: "luxury/chandelier.mp4", look: GOLD, motion: "rise" },
  { id: "car-interior", label: "Ambient cabin · violet light", src: "luxury/car-interior.mp4", look: VIOLET, motion: "drift-left" },
  { id: "eiffel", label: "Eiffel Tower · night", src: "luxury/eiffel.mp4", look: GOLD, motion: "pull-out" },
  { id: "skyline", label: "Rooftop · city skyline", src: "luxury/skyline.mp4", look: NAVY, motion: "drift-right" },
  { id: "rolls-dash", label: "Rolls-Royce dashboard", src: "luxury/rolls-dash.mp4", look: CREAM, motion: "push-in" },
  { id: "candlelit", label: "Candlelit table for two", src: "luxury/candlelit.mp4", look: AMBER, motion: "rise" },
  { id: "chef", label: "Private chef · plating", src: "luxury/chef.mp4", look: CREAM, motion: "drift-left" },
  { id: "marina", label: "Marina · sunset yacht", src: "luxury/marina.mp4", look: ROSE, motion: "pull-out" },
  { id: "aerial", label: "City lights · aerial", src: "luxury/aerial.mp4", look: GOLD, motion: "push-in" },
  { id: "bar", label: "Cocktail bar · low light", src: "luxury/bar.mp4", look: AMBER, motion: "drift-right" },
  { id: "penthouse", label: "Penthouse · night view", src: "luxury/penthouse.mp4", look: NAVY, motion: "pull-out" },
  { id: "watch", label: "Timepiece · macro", src: "luxury/watch.mp4", look: SILVER, motion: "push-in" },
  { id: "jet", label: "Private jet · tarmac", src: "luxury/jet.mp4", look: SILVER, motion: "drift-left" },
  { id: "lobby", label: "Hotel lobby · marble", src: "luxury/lobby.mp4", look: CREAM, motion: "rise" },
  { id: "champagne", label: "Champagne pour", src: "luxury/champagne.mp4", look: CHAMPAGNE, motion: "push-in" },
  // — second library (added so a 30 s edit no longer repeats each shot three times) —
  { id: "porsche-street", label: "Vintage Porsche · wet cobbles", src: "luxury/porsche-street.mp4", look: AMBER, motion: "push-in" },
  { id: "infinity-pool", label: "Rooftop infinity pool", src: "luxury/infinity-pool.mp4", look: NAVY, motion: "drift-left" },
  { id: "whisky", label: "Whisky over ice · macro", src: "luxury/whisky.mp4", look: AMBER, motion: "push-in" },
  { id: "cufflinks", label: "Cufflinks · velvet tray", src: "luxury/cufflinks.mp4", look: SILVER, motion: "rise" },
  { id: "yacht-deck", label: "Yacht deck · afterglow", src: "luxury/yacht-deck.mp4", look: ROSE, motion: "drift-right" },
  { id: "helicopter", label: "Helipad · city below", src: "luxury/helicopter.mp4", look: NAVY, motion: "pull-out" },
  { id: "spiral-stairs", label: "Marble spiral staircase", src: "luxury/spiral-stairs.mp4", look: CREAM, motion: "rise" },
  { id: "wine-cellar", label: "Wine cellar · candlelight", src: "luxury/wine-cellar.mp4", look: AMBER, motion: "drift-left" },
  { id: "piano", label: "Grand piano · lounge", src: "luxury/piano.mp4", look: GOLD, motion: "push-in" },
  { id: "bentley-grille", label: "Bentley grille · rain", src: "luxury/bentley-grille.mp4", look: SILVER, motion: "push-in" },
  { id: "rooftop-bar", label: "Rooftop bar · string lights", src: "luxury/rooftop-bar.mp4", look: GOLD, motion: "drift-right" },
  { id: "dessert", label: "Dessert · gold leaf", src: "luxury/dessert.mp4", look: CREAM, motion: "push-in" },
  { id: "jet-cabin", label: "Private jet · cabin", src: "luxury/jet-cabin.mp4", look: CREAM, motion: "drift-left" },
  { id: "dubai", label: "Dubai skyline · terrace", src: "luxury/dubai.mp4", look: NAVY, motion: "pull-out" },
  { id: "monaco", label: "Monaco harbour · night", src: "luxury/monaco.mp4", look: GOLD, motion: "drift-right" },
  { id: "perfume", label: "Perfume bottle · marble", src: "luxury/perfume.mp4", look: CHAMPAGNE, motion: "rise" },
  { id: "elevator", label: "Gold elevator · doors", src: "luxury/elevator.mp4", look: GOLD, motion: "push-in" },
  { id: "fireplace", label: "Fireplace · leather chairs", src: "luxury/fireplace.mp4", look: AMBER, motion: "push-in" },
  { id: "villa-pool", label: "Villa pool · violet light", src: "luxury/villa-pool.mp4", look: VIOLET, motion: "drift-left" },
  { id: "valet-keys", label: "Valet · keys handed over", src: "luxury/valet-keys.mp4", look: AMBER, motion: "push-in" },
];

/** One entry in the edit: which shot, and for how long (seconds). */
export type Cut = { shot: string; seconds: number };

/**
 * The 30-second edit. Three movements, like a piece of music:
 *   1. Establish (0–13s): the first sixteen locations once, ~0.7–1.4s each, opening on the
 *      hero shot.
 *   2. Build (13–22s): sixteen *new* locations at half a beat — faster, and every frame is
 *      footage the viewer has not seen yet.
 *   3. Land (22–30s): four more fresh shots slowing back down, one deliberate callback to
 *      the hero shot, then a hold on the penthouse for the handle end-card.
 * 36 distinct shots across 38 cuts — only the hero and the end-card shot appear twice.
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
  // 2 — build (new footage, faster)
  { shot: "porsche-street", seconds: 0.6 },
  { shot: "infinity-pool", seconds: 0.5 },
  { shot: "whisky", seconds: 0.6 },
  { shot: "bentley-grille", seconds: 0.5 },
  { shot: "spiral-stairs", seconds: 0.6 },
  { shot: "helicopter", seconds: 0.5 },
  { shot: "wine-cellar", seconds: 0.6 },
  { shot: "cufflinks", seconds: 0.5 },
  { shot: "yacht-deck", seconds: 0.6 },
  { shot: "jet-cabin", seconds: 0.5 },
  { shot: "perfume", seconds: 0.5 },
  { shot: "rooftop-bar", seconds: 0.6 },
  { shot: "dubai", seconds: 0.5 },
  { shot: "dessert", seconds: 0.6 },
  { shot: "elevator", seconds: 0.5 },
  { shot: "piano", seconds: 0.6 },
  // 3 — land
  { shot: "monaco", seconds: 1.0 },
  { shot: "fireplace", seconds: 0.8 },
  { shot: "villa-pool", seconds: 0.9 },
  { shot: "valet-keys", seconds: 0.8 },
  { shot: "lambo-arch", seconds: 1.2 },
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
