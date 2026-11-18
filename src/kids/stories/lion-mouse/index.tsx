/** The Lion and the Mouse: wiring for the story video and its thumbnail. */

import React from "react";
import { C, StoryShell, ThumbnailFrame, storyAudioDefaults, type StoryAudioProps } from "../../kit";
import { GROUND_Y, Savanna } from "./Backgrounds";
import { LC, Lion, Mouse, Scooter, lionPawTop, lionToScene } from "./Characters";
import {
  CaughtScene,
  CrewScene,
  LaughScene,
  MoralScene,
  NapScene,
  NetScene,
  RescueScene,
  ScooterScene,
  TitleScene,
} from "./Scenes";
import { SCENES, type Scene, type SceneId } from "./story";

export const LION_MOUSE_COMPONENTS: Record<SceneId, React.FC<{ scene: Scene }>> = {
  title: TitleScene,
  nap: NapScene,
  scooter: ScooterScene,
  caught: CaughtScene,
  laugh: LaughScene,
  net: NetScene,
  rescue: RescueScene,
  crew: CrewScene,
  moral: MoralScene,
};

export const defaultLionMouseStoryProps: StoryAudioProps = storyAudioDefaults("kids/lion-mouse/music.mp3");

export const LionMouseStory: React.FC<StoryAudioProps> = (p) => (
  <StoryShell scenes={SCENES} components={LION_MOUSE_COMPONENTS} {...p} />
);

const THUMB_LION = { x: 760, y: GROUND_Y + 150, size: 900 };

export const LionMouseThumbnail: React.FC = () => {
  const paw = lionToScene(THUMB_LION, lionPawTop(1));
  return (
    <ThumbnailFrame
      lines={[{ en: "The Lion", es: "El León" }, { en: "& the Mouse", es: "y el Ratón" }]}
      colors={[LC.maneDark, C.lavenderDark]}
      side="top"
    >
      <Savanna treeX={null}>
        <Lion {...THUMB_LION} pose="lie" pawUp={1} mouthOpen={0.5} />
        <Mouse x={paw.x} y={paw.y} size={240} flip wave mouthOpen={1} />
        <Scooter x={1640} y={1060} size={300} flip />
      </Savanna>
    </ThumbnailFrame>
  );
};
