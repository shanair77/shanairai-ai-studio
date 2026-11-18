/** The Tortoise and the Hare (2026 Edition): wiring for the story video and its thumbnail. */

import React from "react";
import { C, StoryShell, ThumbnailFrame, storyAudioDefaults, type StoryAudioProps } from "../../kit";
import { GROUND_Y, Park } from "./Backgrounds";
import { Drone, Hare, TC, Tortoise } from "./Characters";
import {
  BragScene,
  FinishScene,
  FriendsScene,
  MoralScene,
  NapScene,
  PassScene,
  SelfieScene,
  StartScene,
  TitleScene,
} from "./Scenes";
import { SCENES, type Scene, type SceneId } from "./story";

export const TORTOISE_HARE_COMPONENTS: Record<SceneId, React.FC<{ scene: Scene }>> = {
  title: TitleScene,
  brag: BragScene,
  start: StartScene,
  selfie: SelfieScene,
  nap: NapScene,
  pass: PassScene,
  finish: FinishScene,
  friends: FriendsScene,
  moral: MoralScene,
};

export const defaultTortoiseHareStoryProps: StoryAudioProps = storyAudioDefaults("kids/tortoise-hare/music.mp3");

export const TortoiseHareStory: React.FC<StoryAudioProps> = (p) => (
  <StoryShell scenes={SCENES} components={TORTOISE_HARE_COMPONENTS} {...p} />
);

export const TortoiseHareThumbnail: React.FC = () => (
  <ThumbnailFrame
    lines={[{ en: "The Tortoise", es: "La Tortuga" }, { en: "& the Hare", es: "y la Liebre" }]}
    colors={[TC.shellDark, C.pinkDark]}
    side="top"
  >
    <Park trees={[]} bushes={[]}>
      <Drone x={1700} y={560} size={190} flip />
      <Tortoise x={1240} y={GROUND_Y + 130} size={560} medal eyes="happy" />
      <Hare x={480} y={GROUND_Y + 130} size={720} pose="sit" phone={1} screen="video" eyes="sleepy" droop={0.5} />
    </Park>
  </ThumbnailFrame>
);
