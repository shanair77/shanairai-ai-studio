/**
 * How each story is packaged for the channel, on top of `registry.ts` (what the story is):
 * scene components (for Shorts and compilations), the Short cut, translated title,
 * playlist, and the compilations. Add one `PACKAGING` entry per new story.
 */

import type React from "react";
import type { Localized, ShortSpec, StoryScene } from "./kit";
import { SCENE_COMPONENTS as COUNTRY_MOUSE_COMPONENTS } from "../mouse/CountryMouseStory";

/** Playlists on the channel (YouTube playlist ids live in `docs/kids-stories/QUEUE.md`). */
export type PlaylistKey = "fables" | "fairy-tales";

export type StoryPackaging = {
  /** Video title (without the " | Bedtime Story for Kids" suffix), per language. */
  title: Localized;
  /** One component per scene id: the same map the story's main composition uses. */
  components: Record<string, React.FC<{ scene: StoryScene }>>;
  /** Music bed (public/-relative). */
  music: string;
  /** The vertical Short cut from this story. */
  short: ShortSpec;
  playlist: PlaylistKey;
};

export const PACKAGING: Record<string, StoryPackaging> = {
  CountryMouseStory: {
    title: { en: "The Country Mouse and the City Mouse", es: "El Ratón de Campo y el Ratón de Ciudad" },
    components: COUNTRY_MOUSE_COMPONENTS as Record<string, React.FC<{ scene: StoryScene }>>,
    music: "mouse/music.mp3",
    playlist: "fables",
    short: {
      segments: [
        { scene: "feast", from: 6, focusX: [1150, 760], panAt: [3.5, 5] },
        { scene: "cat", focusX: [450, 1450], panAt: [8, 9.8] },
        { scene: "dog", zoom: 1, focusX: [1000, 1300], panAt: [8, 10] },
        { scene: "moral", to: 10.3, zoom: 0.75, focusX: 960 },
      ],
    },
  },
};

export type CompilationSpec = {
  /** Composition id (letters, digits, hyphens). */
  id: string;
  title: Localized;
  /** Story composition ids, in order. */
  storyIds: string[];
};

/**
 * Compilations: after every 5 new stories, add one (see the kids-story skill).
 * The scheduled run appends entries here.
 */
export const COMPILATIONS: CompilationSpec[] = [];
