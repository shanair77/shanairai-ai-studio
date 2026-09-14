/**
 * shots — the shot library + cut list for the OldMoneyReel.
 *
 * Think of this file as the edit decision list an editor would hand a colourist: WHAT
 * footage exists (`SHOTS`) and in WHAT ORDER and for HOW LONG it plays (`CUT_LIST`). The
 * composition never hard-codes footage — it reads this data, so re-cutting the reel is a
 * data edit, not a code edit.
 *
 * Every shot has a `src`: a `public/`-relative path or an `https://` URL. The library is 36
 * Higgsfield clips (Kling 3.0 pro, 9:16, 5 s, silent) stored in `public/oldmoney/`; see that
 * folder's README for the shot table. Set `src: null` on any shot to fall back to a procedural
 * placeholder plate in that shot's palette.
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

const MOSS: ShotLook = { base: "#1a2418", mid: "#3d4f33", glow: "#c9d3a3" };
const OAK: ShotLook = { base: "#24190f", mid: "#5a3f24", glow: "#e0b97a" };
const CREAM: ShotLook = { base: "#2a2418", mid: "#6b5a3e", glow: "#f3e6c8" };
const MIST: ShotLook = { base: "#22282a", mid: "#55636a", glow: "#dfe6e4" };
const BRASS: ShotLook = { base: "#2a1f0e", mid: "#6a5220", glow: "#f1cf7a" };
const BURGUNDY: ShotLook = { base: "#24100f", mid: "#5a2320", glow: "#d98a7c" };
const SLATE: ShotLook = { base: "#1b2126", mid: "#3f4c58", glow: "#b8c6d1" };
const HONEY: ShotLook = { base: "#2b1f0d", mid: "#7a5a22", glow: "#ffd98a" };

/** The footage library. Swap any `src` to re-cast a shot. */
export const SHOTS: Shot[] = [
  // — establish (0–13 s) —
  { id: "manor-drive", label: "Gravel drive · stone manor", src: "oldmoney/manor-drive.mp4", look: HONEY, motion: "push-in" },
  { id: "library", label: "Oak library · brass lamp", src: "oldmoney/library.mp4", look: OAK, motion: "drift-left" },
  { id: "horse-paddock", label: "Bay horse · misty paddock", src: "oldmoney/horse-paddock.mp4", look: MIST, motion: "drift-right" },
  { id: "tea-service", label: "Silver tea service · linen", src: "oldmoney/tea-service.mp4", look: CREAM, motion: "push-in" },
  { id: "vintage-bentley", label: "Vintage Bentley · gravel", src: "oldmoney/vintage-bentley.mp4", look: MOSS, motion: "pull-out" },
  { id: "staircase", label: "Sweeping staircase · afternoon", src: "oldmoney/staircase.mp4", look: OAK, motion: "rise" },
  { id: "lake", label: "Still lake · boathouse", src: "oldmoney/lake.mp4", look: SLATE, motion: "drift-left" },
  { id: "tweed", label: "Tweed and gloves · hall chair", src: "oldmoney/tweed.mp4", look: BURGUNDY, motion: "push-in" },
  { id: "topiary", label: "Yew topiary · long shadows", src: "oldmoney/topiary.mp4", look: MOSS, motion: "drift-right" },
  { id: "great-hall", label: "Great hall · stone fireplace", src: "oldmoney/great-hall.mp4", look: BRASS, motion: "push-in" },
  { id: "pocket-watch", label: "Pocket watch · leather desk", src: "oldmoney/pocket-watch.mp4", look: BRASS, motion: "rise" },
  { id: "rose-garden", label: "Walled rose garden · dew", src: "oldmoney/rose-garden.mp4", look: BURGUNDY, motion: "drift-left" },
  { id: "croquet", label: "Croquet lawn · dusk", src: "oldmoney/croquet.mp4", look: MOSS, motion: "push-in" },
  { id: "conservatory", label: "Conservatory · ferns · mist", src: "oldmoney/conservatory.mp4", look: MIST, motion: "pull-out" },
  { id: "decanter", label: "Crystal decanter · sideboard", src: "oldmoney/decanter.mp4", look: HONEY, motion: "push-in" },
  { id: "chapel", label: "Estate chapel · evening", src: "oldmoney/chapel.mp4", look: SLATE, motion: "drift-right" },
  // — build (13–22 s) —
  { id: "gates", label: "Wrought-iron gates · mist", src: "oldmoney/gates.mp4", look: MIST, motion: "push-in" },
  { id: "riding-boots", label: "Riding boots · boot room", src: "oldmoney/riding-boots.mp4", look: OAK, motion: "rise" },
  { id: "manor-aerial", label: "Manor and parterre · aerial", src: "oldmoney/manor-aerial.mp4", look: HONEY, motion: "pull-out" },
  { id: "letter-desk", label: "Fountain pen · wax seal · hands", src: "oldmoney/letter-desk.mp4", look: CREAM, motion: "push-in" },
  { id: "stables", label: "Stable block · brick arches", src: "oldmoney/stables.mp4", look: BRASS, motion: "drift-left" },
  { id: "dining-table", label: "Long table · candelabra", src: "oldmoney/dining-table.mp4", look: HONEY, motion: "drift-right" },
  { id: "labrador", label: "Labrador · country kitchen", src: "oldmoney/labrador.mp4", look: OAK, motion: "push-in" },
  { id: "fountain", label: "Stone fountain · courtyard", src: "oldmoney/fountain.mp4", look: CREAM, motion: "rise" },
  { id: "gallery", label: "Gilt frames · long corridor", src: "oldmoney/gallery.mp4", look: BRASS, motion: "drift-left" },
  { id: "rowing-boat", label: "Wooden rowing boat · lake", src: "oldmoney/rowing-boat.mp4", look: SLATE, motion: "drift-right" },
  { id: "orangery", label: "Orangery · citrus in terracotta", src: "oldmoney/orangery.mp4", look: MOSS, motion: "pull-out" },
  { id: "whisky-study", label: "Cut crystal · leather chair · fire", src: "oldmoney/whisky-study.mp4", look: BURGUNDY, motion: "push-in" },
  { id: "hedgerow-lane", label: "Hedgerow lane · sun through mist", src: "oldmoney/hedgerow-lane.mp4", look: MOSS, motion: "push-in" },
  { id: "signet-ring", label: "Signet ring · mahogany dresser", src: "oldmoney/signet-ring.mp4", look: BRASS, motion: "rise" },
  { id: "greenhouse", label: "Victorian greenhouse · condensation", src: "oldmoney/greenhouse.mp4", look: MIST, motion: "drift-left" },
  { id: "cricket", label: "Cricket pavilion · dusk", src: "oldmoney/cricket.mp4", look: CREAM, motion: "drift-right" },
  // — land + end-card (22–30 s) —
  { id: "lantern-walk", label: "Gas lanterns · gravel path · dusk", src: "oldmoney/lantern-walk.mp4", look: HONEY, motion: "push-in" },
  { id: "four-poster", label: "Four-poster · leaded windows", src: "oldmoney/four-poster.mp4", look: CREAM, motion: "drift-left" },
  { id: "deer-park", label: "Red deer · misty park · dawn", src: "oldmoney/deer-park.mp4", look: MIST, motion: "pull-out" },
  { id: "manor-dusk", label: "Manor at dusk · windows lit", src: "oldmoney/manor-dusk.mp4", look: SLATE, motion: "push-in" },
];

/** One entry in the edit: which shot, and for how long (seconds). */
export type Cut = { shot: string; seconds: number };

/**
 * The 30-second edit. Three movements, like a piece of music:
 *   1. Establish (0–13s): sixteen locations once, ~0.7–1.4s each, opening on the hero drive.
 *   2. Build (13–22s): sixteen *new* locations at half a beat — nothing the viewer has seen.
 *   3. Land (22–30s): three fresh shots slowing down, one callback to the hero drive, then the
 *      manor at dusk held for the handle end-card.
 * 36 distinct shots across 37 cuts — only the hero shot appears twice.
 * Cuts are hard (no cross-fades) — that is the format's language.
 */
export const CUT_LIST: Cut[] = [
  // 1 — establish
  { shot: "manor-drive", seconds: 1.4 },
  { shot: "library", seconds: 0.8 },
  { shot: "horse-paddock", seconds: 0.7 },
  { shot: "tea-service", seconds: 0.9 },
  { shot: "vintage-bentley", seconds: 0.8 },
  { shot: "staircase", seconds: 0.7 },
  { shot: "lake", seconds: 1.0 },
  { shot: "tweed", seconds: 0.8 },
  { shot: "topiary", seconds: 0.9 },
  { shot: "great-hall", seconds: 0.7 },
  { shot: "pocket-watch", seconds: 0.8 },
  { shot: "rose-garden", seconds: 0.7 },
  { shot: "croquet", seconds: 0.6 },
  { shot: "conservatory", seconds: 0.9 },
  { shot: "decanter", seconds: 0.7 },
  { shot: "chapel", seconds: 0.8 },
  // 2 — build (new footage, faster)
  { shot: "gates", seconds: 0.6 },
  { shot: "riding-boots", seconds: 0.5 },
  { shot: "manor-aerial", seconds: 0.6 },
  { shot: "letter-desk", seconds: 0.5 },
  { shot: "stables", seconds: 0.6 },
  { shot: "dining-table", seconds: 0.5 },
  { shot: "labrador", seconds: 0.6 },
  { shot: "fountain", seconds: 0.5 },
  { shot: "gallery", seconds: 0.6 },
  { shot: "rowing-boat", seconds: 0.5 },
  { shot: "orangery", seconds: 0.6 },
  { shot: "whisky-study", seconds: 0.5 },
  { shot: "hedgerow-lane", seconds: 0.6 },
  { shot: "signet-ring", seconds: 0.5 },
  { shot: "greenhouse", seconds: 0.6 },
  { shot: "cricket", seconds: 0.5 },
  // 3 — land
  { shot: "lantern-walk", seconds: 1.2 },
  { shot: "four-poster", seconds: 1.0 },
  { shot: "deer-park", seconds: 1.0 },
  { shot: "manor-drive", seconds: 1.5 },
  // end-card hold (the handle fades in over this shot)
  { shot: "manor-dusk", seconds: 3.3 },
];

/** Total edit length in seconds (30.0 for the shipped cut list). */
export const totalSeconds = (cuts: Cut[] = CUT_LIST): number =>
  cuts.reduce((sum, c) => sum + c.seconds, 0);

/** Look up a shot by id; throws on a typo so a bad cut list fails loudly at build time. */
export const getShot = (id: string, shots: Shot[] = SHOTS): Shot => {
  const shot = shots.find((s) => s.id === id);
  if (!shot) throw new Error(`OldMoneyReel: cut list references unknown shot "${id}".`);
  return shot;
};
