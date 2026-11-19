/**
 * Postcards from Africa — the episode data model.
 *
 * An episode is a list of beats. Each beat is timed to its voiceover line: its length is
 * LEAD + the line's duration + TAIL, never shorter than `minSeconds`. Swapping in a new
 * country means writing a new data file like `morocco.ts`; the engine stays the same.
 */

export type Visual =
  /** AI video clip. `still` is its last frame, shown if the beat outlasts the clip. */
  | { kind: "clip"; src: string; still: string; seconds: number }
  /** A painted plate animated in code, with an optional foreground cut-out layer. */
  | {
      kind: "plate";
      src: string;
      motion: "push" | "pan";
      fg?: {
        src: string;
        /** Width as % of the frame. */
        width: number;
        /** Start/end position of the layer's bottom-left corner, in % of the frame. */
        from: [number, number];
        to: [number, number];
        rotate?: [number, number];
      };
    }
  /** A fully code-drawn scene. */
  | { kind: "scene"; scene: "hook" | "title" | "notes" | "next" };

export type Sound = { src: string; volume: number; at?: number };

export type Beat = {
  id: string;
  /** Narration line, as spoken (also the on-screen caption). */
  text: string;
  /** public/-relative voiceover file and its length in seconds. */
  vo: string;
  voSeconds: number;
  minSeconds?: number;
  visual: Visual;
  /** Location chip, e.g. "Marrakech". */
  place?: string;
  /** Taped note: a fact, tip or phrase. */
  note?: { label: string; text: string };
  /** Hand-written pop-up scribbles over the picture (e.g. theories). */
  scribbles?: string[];
  /** Looping ambient bed. */
  ambient?: Sound;
  /** One-shot effects; `at` is seconds from the beat start. */
  sfx?: Sound[];
};

export type Episode = {
  series: string;
  number: number;
  country: string;
  region: string;
  /** [longitude, latitude] of the stop's pin and of the next stop's pin. */
  pin: [number, number];
  next: { country: string; pin: [number, number] };
  beats: Beat[];
  notes: { title: string; items: [string, string][] };
};
