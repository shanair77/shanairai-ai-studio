/**
 * CountryMouseStory — "The Country Mouse and the City Mouse", a faceless, narrated
 * kids' story (1920×1080, ~2:09) in the pastel flat 2D style. The first story built
 * on the kids' story kit (`src/kids/kit`): this file only wires its scenes into the
 * shared StoryShell (captions, page turns, narration and ducked music).
 */

import React from "react";
import { type CalculateMetadataFunction } from "remotion";
import { StoryShell, type StoryAudioProps, storyAudioDefaults, totalFrames } from "../kids/kit";
import {
  CatScene,
  DogScene,
  FeastScene,
  HomeScene,
  JourneyScene,
  MeadowScene,
  MoralScene,
  TitleScene,
  VisitScene,
} from "./Scenes";
import { FPS, SCENES, type Scene, type SceneId } from "./story";

export { FPS, HEIGHT, WIDTH } from "./story";

export type CountryMouseStoryProps = StoryAudioProps;

export const defaultCountryMouseStoryProps: CountryMouseStoryProps = storyAudioDefaults("mouse/music.mp3");

export const calculateCountryMouseStoryMetadata: CalculateMetadataFunction<CountryMouseStoryProps> = () => ({
  durationInFrames: totalFrames(SCENES, FPS),
});

const SCENE_COMPONENTS: Record<SceneId, React.FC<{ scene: Scene }>> = {
  title: TitleScene,
  meadow: MeadowScene,
  visit: VisitScene,
  journey: JourneyScene,
  feast: FeastScene,
  cat: CatScene,
  dog: DogScene,
  home: HomeScene,
  moral: MoralScene,
};

export const CountryMouseStory: React.FC<CountryMouseStoryProps> = (props) => (
  <StoryShell scenes={SCENES} components={SCENE_COMPONENTS} {...props} />
);
