/** The Ant and the Grasshopper: wiring for the story video and its thumbnail. */

import React from "react";
import { StoryShell, ThumbnailFrame, storyAudioDefaults, type StoryAudioProps } from "../../kit";
import { Anthill, Field, GROUND_Y } from "./Backgrounds";
import { AC, Ant, Grasshopper } from "./Characters";
import {
  AntsScene,
  AutumnScene,
  InviteScene,
  KnockScene,
  MoralScene,
  PartyScene,
  SummerScene,
  TitleScene,
  WinterScene,
} from "./Scenes";
import { SCENES, type Scene, type SceneId } from "./story";

export const ANT_GRASSHOPPER_COMPONENTS: Record<SceneId, React.FC<{ scene: Scene }>> = {
  title: TitleScene,
  summer: SummerScene,
  ants: AntsScene,
  invite: InviteScene,
  autumn: AutumnScene,
  winter: WinterScene,
  knock: KnockScene,
  party: PartyScene,
  moral: MoralScene,
};

export const defaultAntGrasshopperStoryProps: StoryAudioProps = storyAudioDefaults("kids/ant-grasshopper/music.mp3");

export const AntGrasshopperStory: React.FC<StoryAudioProps> = (p) => (
  <StoryShell scenes={SCENES} components={ANT_GRASSHOPPER_COMPONENTS} {...p} />
);

export const AntGrasshopperThumbnail: React.FC = () => (
  <ThumbnailFrame
    lines={[{ en: "The Ant", es: "La Hormiga" }, { en: "& the Grasshopper", es: "y el Saltamontes" }]}
    colors={[AC.antDark, AC.ghDark]}
    side="top"
  >
    <Field season="summer">
      <Anthill x={1640} season="summer" door={0.6} />
      <Grasshopper x={400} y={GROUND_Y + 200} size={640} guitar="play" strum={1} eyes="happy" mouthOpen={0.6} />
      <Ant x={1200} y={GROUND_Y + 170} size={470} leader flip carry="berry" />
    </Field>
  </ThumbnailFrame>
);
