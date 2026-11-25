/** The Crow and the Pitcher: wiring for the story video and its thumbnail. */

import React from "react";
import { StoryShell, ThumbnailFrame, storyAudioDefaults, type StoryAudioProps } from "../../kit";
import { BeanPoles, GROUND_Y, Garden } from "./Backgrounds";
import { Crow, PC, Pitcher, Snail, pitcherRim } from "./Characters";
import { DrinkScene, GardenScene, MoralScene, PebblesScene, PitcherScene, PosterScene, RobotScene, TitleScene, TriesScene } from "./Scenes";
import { SCENES, type Scene, type SceneId } from "./story";

export const CROW_PITCHER_COMPONENTS: Record<SceneId, React.FC<{ scene: Scene }>> = {
  title: TitleScene,
  garden: GardenScene,
  pitcher: PitcherScene,
  tries: TriesScene,
  poster: PosterScene,
  robot: RobotScene,
  pebbles: PebblesScene,
  drink: DrinkScene,
  moral: MoralScene,
};

export const defaultCrowPitcherStoryProps: StoryAudioProps = storyAudioDefaults("kids/crow-pitcher/music.mp3");

export const CrowPitcherStory: React.FC<StoryAudioProps> = (p) => <StoryShell scenes={SCENES} components={CROW_PITCHER_COMPONENTS} {...p} />;

const C_PINK = "#EFA3C0";
const TH = { x: 1460, y: 1050, h: 620 };
const thumbRim = pitcherRim(TH.x, TH.y, TH.h);

export const CrowPitcherThumbnail: React.FC = () => (
  <ThumbnailFrame
    lines={[{ en: "The Crow", es: "El Cuervo" }, { en: "and the", es: "y la" }, { en: "Pitcher", es: "Jarra" }]}
    colors={[PC.crowDark, C_PINK, "#6FB7DA"]}
    side="left"
  >
    <Garden backdrop={false} scenery={<BeanPoles x={1840} y={GROUND_Y + 40} h={700} />}>
      <Pitcher id="th" x={TH.x} y={TH.y} h={TH.h} level={0.55} pebbles={5} />
      <Crow x={thumbRim.x - thumbRim.w / 2 - 20} y={thumbRim.y + 2} size={400} pebble eyes="happy" />
      <Pitcher id="thf" x={TH.x} y={TH.y} h={TH.h} front />
      <Snail x={760} y={1060} size={330} eyes="wide" stretch={0.6} />
    </Garden>
  </ThumbnailFrame>
);
