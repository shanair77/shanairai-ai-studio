/** Little Red Riding Hood: wiring for the story video and its thumbnail. */

import React from "react";
import { StoryShell, ThumbnailFrame, storyAudioDefaults, type StoryAudioProps } from "../../kit";
import { BigTrunk, GROUND_Y, Woods } from "./Backgrounds";
import { Bunny, RC, Wolf, WolfDisguise } from "./Characters";
import { BedScene, ChatScene, HomeScene, MoralScene, PathScene, ShortcutScene, TeethScene, TitleScene, WoodcutterScene } from "./Scenes";
import { SCENES, type Scene, type SceneId } from "./story";

export const RED_HOOD_COMPONENTS: Record<SceneId, React.FC<{ scene: Scene }>> = {
  title: TitleScene,
  home: HomeScene,
  path: PathScene,
  chat: ChatScene,
  shortcut: ShortcutScene,
  bed: BedScene,
  teeth: TeethScene,
  woodcutter: WoodcutterScene,
  moral: MoralScene,
};

export const defaultRedHoodStoryProps: StoryAudioProps = storyAudioDefaults("kids/red-hood/music.mp3");

export const RedHoodStory: React.FC<StoryAudioProps> = (p) => <StoryShell scenes={SCENES} components={RED_HOOD_COMPONENTS} {...p} />;

export const RedHoodThumbnail: React.FC = () => (
  <ThumbnailFrame lines={[{ en: "Little Red", es: "Caperucita" }, { en: "Riding Hood", es: "Roja" }]} colors={[RC.capeDark, RC.watchDark]} side="top">
    <Woods trees={[]} path>
      <Wolf x={1420} y={GROUND_Y + 200} size={640} flip eyes="grumpy" mouthOpen={0.3} />
      <WolfDisguise x={1420} y={GROUND_Y + 200} size={640} flip />
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <BigTrunk x={1880} />
      </svg>
      <Bunny x={460} y={GROUND_Y + 200} size={600} basket eyes="wide" headTilt={-6} />
    </Woods>
  </ThumbnailFrame>
);
