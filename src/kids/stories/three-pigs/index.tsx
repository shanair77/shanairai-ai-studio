/** The Three Little Pigs: wiring for the story video and its thumbnail. */

import React from "react";
import { StoryShell, ThumbnailFrame, storyAudioDefaults, type StoryAudioProps } from "../../kit";
import { BrickHouse, GROUND_Y, Street } from "./Backgrounds";
import { PC, Pig, Wolf } from "./Characters";
import {
  BricksScene,
  DoorbellScene,
  LeaveScene,
  MoralScene,
  SticksScene,
  StrawScene,
  TitleScene,
  TogetherScene,
  WolfSticksScene,
  WolfStrawScene,
} from "./Scenes";
import { SCENES, type Scene, type SceneId } from "./story";

export const THREE_PIGS_COMPONENTS: Record<SceneId, React.FC<{ scene: Scene }>> = {
  title: TitleScene,
  leave: LeaveScene,
  straw: StrawScene,
  sticks: SticksScene,
  bricks: BricksScene,
  wolfStraw: WolfStrawScene,
  wolfSticks: WolfSticksScene,
  doorbell: DoorbellScene,
  together: TogetherScene,
  moral: MoralScene,
};

export const defaultThreePigsStoryProps: StoryAudioProps = storyAudioDefaults("kids/three-pigs/music.mp3");

export const ThreePigsStory: React.FC<StoryAudioProps> = (p) => (
  <StoryShell scenes={SCENES} components={THREE_PIGS_COMPONENTS} {...p} />
);

export const ThreePigsThumbnail: React.FC = () => (
  <ThumbnailFrame lines={[{ en: "The Three", es: "Los Tres" }, { en: "Little Pigs", es: "Cerditos" }]} colors={[PC.brickDark, "#E58AA8"]} side="top">
    <Street trees={[]}>
      <BrickHouse x={1560} s={1.15} peek={["straw", "sticks"]} happy />
      <Wolf x={420} y={GROUND_Y + 190} size={620} puff={1} eyes="grumpy" />
      <Pig kind="brick" x={1060} y={GROUND_Y + 180} size={480} cheer eyes="happy" />
    </Street>
  </ThumbnailFrame>
);
