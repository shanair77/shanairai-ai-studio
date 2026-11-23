/** The Boy Who Cried Wolf: wiring for the story video and its thumbnail. */

import React from "react";
import { StoryShell, ThumbnailFrame, storyAudioDefaults, type StoryAudioProps } from "../../kit";
import { GROUND_Y, Hills, LongGrass } from "./Backgrounds";
import { BC, Bear, Sheep, Wolf } from "./Characters";
import {
  BoredScene,
  HillScene,
  MoralScene,
  NobodyScene,
  RealWolfScene,
  SorryScene,
  TitleScene,
  Trick1Scene,
  Trick2Scene,
} from "./Scenes";
import { SCENES, type Scene, type SceneId } from "./story";

export const BOY_WOLF_COMPONENTS: Record<SceneId, React.FC<{ scene: Scene }>> = {
  title: TitleScene,
  hill: HillScene,
  bored: BoredScene,
  trick1: Trick1Scene,
  trick2: Trick2Scene,
  realWolf: RealWolfScene,
  nobody: NobodyScene,
  sorry: SorryScene,
  moral: MoralScene,
};

export const defaultBoyWolfStoryProps: StoryAudioProps = storyAudioDefaults("kids/boy-wolf/music.mp3");

export const BoyWolfStory: React.FC<StoryAudioProps> = (p) => <StoryShell scenes={SCENES} components={BOY_WOLF_COMPONENTS} {...p} />;

export const BoyWolfThumbnail: React.FC = () => (
  <ThumbnailFrame lines={[{ en: "The Boy Who", es: "El Pastorcito" }, { en: "Cried Wolf!", es: "Mentiroso" }]} colors={[BC.bandanaDark, BC.alert]} side="top">
    <Hills trees={[]} village={false}>
      <Wolf x={1560} y={GROUND_Y + 200} size={600} flip eyes="grumpy" />
      <LongGrass from={1180} to={1960} y={GROUND_Y + 220} h={300} />
      <Sheep x={1040} y={GROUND_Y + 210} size={330} flip eyes="wide" />
      <Bear x={430} y={GROUND_Y + 210} size={640} pose="shout" hold="walkie" beep eyes="wide" />
    </Hills>
  </ThumbnailFrame>
);
