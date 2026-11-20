/**
 * Every published kids' story. Add one entry per new story; `KidsCompositions`
 * registers its video composition (`<id>`) and thumbnail still (`<id>Thumbnail`).
 */

import type React from "react";
import type { StoryAudioProps, StoryScene } from "./kit";
import { CountryMouseStory, defaultCountryMouseStoryProps } from "../mouse/CountryMouseStory";
import { SCENES as COUNTRY_MOUSE_SCENES } from "../mouse/story";
import { CountryMouseThumbnail } from "../mouse/Thumbnail";
import { LionMouseStory, LionMouseThumbnail, defaultLionMouseStoryProps } from "./stories/lion-mouse";
import { SCENES as LION_MOUSE_SCENES } from "./stories/lion-mouse/story";
import { TortoiseHareStory, TortoiseHareThumbnail, defaultTortoiseHareStoryProps } from "./stories/tortoise-hare";
import { SCENES as TORTOISE_HARE_SCENES } from "./stories/tortoise-hare/story";
import { AntGrasshopperStory, AntGrasshopperThumbnail, defaultAntGrasshopperStoryProps } from "./stories/ant-grasshopper";
import { SCENES as ANT_GRASSHOPPER_SCENES } from "./stories/ant-grasshopper/story";

export type KidsStory = {
  /** Composition id (letters, digits, hyphens). */
  id: string;
  title: string;
  component: React.FC<StoryAudioProps>;
  defaultProps: StoryAudioProps;
  scenes: StoryScene[];
  Thumbnail: React.FC;
};

export const STORIES: KidsStory[] = [
  {
    id: "CountryMouseStory",
    title: "The Country Mouse and the City Mouse",
    component: CountryMouseStory,
    defaultProps: defaultCountryMouseStoryProps,
    scenes: COUNTRY_MOUSE_SCENES,
    Thumbnail: CountryMouseThumbnail,
  },
  {
    id: "LionMouseStory",
    title: "The Lion and the Mouse",
    component: LionMouseStory,
    defaultProps: defaultLionMouseStoryProps,
    scenes: LION_MOUSE_SCENES,
    Thumbnail: LionMouseThumbnail,
  },
  {
    id: "TortoiseHareStory",
    title: "The Tortoise and the Hare (2026 Edition)",
    component: TortoiseHareStory,
    defaultProps: defaultTortoiseHareStoryProps,
    scenes: TORTOISE_HARE_SCENES,
    Thumbnail: TortoiseHareThumbnail,
  },
  {
    id: "AntGrasshopperStory",
    title: "The Ant and the Grasshopper",
    component: AntGrasshopperStory,
    defaultProps: defaultAntGrasshopperStoryProps,
    scenes: ANT_GRASSHOPPER_SCENES,
    Thumbnail: AntGrasshopperThumbnail,
  },
];
