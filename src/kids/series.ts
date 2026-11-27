/**
 * How each story is packaged for the channel, on top of `registry.ts` (what the story is):
 * scene components (for Shorts and compilations), the Short cut, translated title,
 * playlist, and the compilations. Add one `PACKAGING` entry per new story.
 */

import type React from "react";
import type { Localized, ShortSpec, StoryScene } from "./kit";
import { SCENE_COMPONENTS as COUNTRY_MOUSE_COMPONENTS } from "../mouse/CountryMouseStory";
import { LION_MOUSE_COMPONENTS } from "./stories/lion-mouse";
import { TORTOISE_HARE_COMPONENTS } from "./stories/tortoise-hare";
import { ANT_GRASSHOPPER_COMPONENTS } from "./stories/ant-grasshopper";
import { THREE_PIGS_COMPONENTS } from "./stories/three-pigs";
import { BOY_WOLF_COMPONENTS } from "./stories/boy-wolf";
import { RED_HOOD_COMPONENTS } from "./stories/red-hood";
import { CROW_PITCHER_COMPONENTS } from "./stories/crow-pitcher";
import { GOLDILOCKS_COMPONENTS } from "./stories/goldilocks";

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
  LionMouseStory: {
    title: { en: "The Lion and the Mouse", es: "El León y el Ratón" },
    components: LION_MOUSE_COMPONENTS as Record<string, React.FC<{ scene: StoryScene }>>,
    music: "kids/lion-mouse/music.mp3",
    playlist: "fables",
    short: {
      segments: [
        { scene: "scooter", from: 3, focusX: [500, 1200], panAt: [2, 10] },
        { scene: "caught", from: 3.5, zoom: 1, focusX: 1150 },
        { scene: "rescue", focusX: [1150, 900], panAt: [2, 6] },
        { scene: "moral", to: 11.5, zoom: 0.75, focusX: 960 },
      ],
    },
  },
  TortoiseHareStory: {
    title: { en: "The Tortoise and the Hare (2026 Edition)", es: "La Tortuga y la Liebre (Edición 2026)" },
    components: TORTOISE_HARE_COMPONENTS as Record<string, React.FC<{ scene: StoryScene }>>,
    music: "kids/tortoise-hare/music.mp3",
    playlist: "fables",
    short: {
      segments: [
        { scene: "selfie", from: 3, focusX: 1250 },
        { scene: "nap", from: 6, focusX: [1100, 600], panAt: [1, 6] },
        { scene: "finish", from: 4, zoom: 1, focusX: 1050 },
        { scene: "moral", to: 11, zoom: 0.75, focusX: 960 },
      ],
    },
  },
  AntGrasshopperStory: {
    title: { en: "The Ant and the Grasshopper", es: "La Hormiga y el Saltamontes" },
    components: ANT_GRASSHOPPER_COMPONENTS as Record<string, React.FC<{ scene: StoryScene }>>,
    music: "kids/ant-grasshopper/music.mp3",
    playlist: "fables",
    short: {
      segments: [
        { scene: "winter", from: 0.5, focusX: [860, 1100], panAt: [5, 7] },
        { scene: "knock", from: 4, focusX: [950, 1250], panAt: [7, 9] },
        { scene: "party", from: 3, zoom: 1, focusX: [1150, 700], panAt: [4, 7] },
        { scene: "moral", to: 11.5, zoom: 0.75, focusX: 960 },
      ],
    },
  },
  ThreePigsStory: {
    title: { en: "The Three Little Pigs", es: "Los Tres Cerditos" },
    components: THREE_PIGS_COMPONENTS as Record<string, React.FC<{ scene: StoryScene }>>,
    music: "kids/three-pigs/music.mp3",
    playlist: "fables",
    short: {
      segments: [
        { scene: "wolfStraw", from: 9.6, to: 18.5, focusX: [870, 1350], panAt: [3.2, 6] },
        { scene: "wolfSticks", focusX: [870, 1350], panAt: [5.5, 8] },
        { scene: "doorbell", to: 20.2, zoom: 1, focusX: [1250, 1050], panAt: [6, 9.5] },
        { scene: "moral", to: 12.8, zoom: 0.75, focusX: 960 },
      ],
    },
  },
  BoyWolfStory: {
    title: { en: "The Boy Who Cried Wolf", es: "El Pastorcito Mentiroso" },
    components: BOY_WOLF_COMPONENTS as Record<string, React.FC<{ scene: StoryScene }>>,
    music: "kids/boy-wolf/music.mp3",
    playlist: "fables",
    short: {
      segments: [
        { scene: "trick1", from: 0.4, focusX: [780, 1300], panAt: [9.5, 12] },
        { scene: "realWolf", from: 3, focusX: [1350, 780], panAt: [5.5, 7.5] },
        { scene: "nobody", from: 9.6, zoom: 1, focusX: [760, 1300], panAt: [1, 3.5] },
        { scene: "moral", to: 12.8, zoom: 0.75, focusX: 960 },
      ],
    },
  },
  RedHoodStory: {
    title: { en: "Little Red Riding Hood", es: "Caperucita Roja" },
    components: RED_HOOD_COMPONENTS as Record<string, React.FC<{ scene: StoryScene }>>,
    music: "kids/red-hood/music.mp3",
    playlist: "fairy-tales",
    short: {
      segments: [
        { scene: "bed", from: 6.3, zoom: 1, focusX: 800 },
        { scene: "teeth", zoom: 1, focusX: 760 },
        { scene: "woodcutter", to: 15.8, zoom: 1, focusX: 640 },
        { scene: "moral", to: 10.5, zoom: 0.75, focusX: 960 },
      ],
    },
  },
  CrowPitcherStory: {
    title: { en: "The Crow and the Pitcher", es: "El Cuervo y la Jarra" },
    components: CROW_PITCHER_COMPONENTS as Record<string, React.FC<{ scene: StoryScene }>>,
    music: "kids/crow-pitcher/music.mp3",
    playlist: "fables",
    short: {
      segments: [
        { scene: "pitcher", from: 9.2, to: 16.5, zoom: 1, focusX: 1020 },
        { scene: "poster", from: 11.3, focusX: [470, 1100], panAt: [2.5, 4] },
        { scene: "pebbles", from: 4.7, zoom: 1, focusX: [930, 700], panAt: [10.5, 11.5] },
        { scene: "drink", from: 1.8, to: 7.6, zoom: 1, focusX: 960 },
        { scene: "moral", to: 11, zoom: 0.75, focusX: 960 },
      ],
    },
  },
  GoldilocksStory: {
    title: { en: "Goldilocks and the Three Bears", es: "Ricitos de Oro y los Tres Osos" },
    components: GOLDILOCKS_COMPONENTS as Record<string, React.FC<{ scene: StoryScene }>>,
    music: "kids/goldilocks/music.mp3",
    playlist: "fairy-tales",
    short: {
      segments: [
        { scene: "chairs", from: 8.2, to: 19.5, zoom: 1, focusX: 1380 },
        { scene: "home", from: 2.3, zoom: 0.85, focusX: [880, 1400], panAt: [12.4, 13.6] },
        { scene: "found", from: 2.2, zoom: 1, focusX: [880, 1450], panAt: [3.6, 5] },
        { scene: "moral", to: 11, zoom: 0.75, focusX: 960 },
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
export const COMPILATIONS: CompilationSpec[] = [
  {
    id: "Compilation01",
    title: { en: "Bedtime Stories for Kids: Collection 1", es: "Cuentos para dormir: Colección 1" },
    storyIds: ["CountryMouseStory", "TortoiseHareStory", "LionMouseStory", "AntGrasshopperStory", "ThreePigsStory"],
  },
];
