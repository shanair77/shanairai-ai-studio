/**
 * Every published kids' story. Add one entry per new story; `KidsCompositions`
 * registers its video composition (`<id>`) and thumbnail still (`<id>Thumbnail`).
 */

import type React from "react";
import type { StoryAudioProps, StoryScene } from "./kit";
import { CountryMouseStory, defaultCountryMouseStoryProps } from "../mouse/CountryMouseStory";
import { SCENES as COUNTRY_MOUSE_SCENES } from "../mouse/story";
import { CountryMouseThumbnail } from "../mouse/Thumbnail";

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
];
