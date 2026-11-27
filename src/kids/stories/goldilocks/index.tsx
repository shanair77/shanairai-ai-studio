/** Goldilocks and the Three Bears: wiring for the story video and its thumbnail. */

import React from "react";
import { StoryShell, ThumbnailFrame, storyAudioDefaults, type StoryAudioProps } from "../../kit";
import { Forest, GROUND_Y } from "./Backgrounds";
import { Bear, Bowl, GC, Lamb } from "./Characters";
import { BedsScene, CabinScene, ChairsScene, FixScene, FoundScene, HomeScene, KnockScene, MoralScene, PorridgeScene, TitleScene } from "./Scenes";
import { SCENES, type Scene, type SceneId } from "./story";

export const GOLDILOCKS_COMPONENTS: Record<SceneId, React.FC<{ scene: Scene }>> = {
  title: TitleScene,
  cabin: CabinScene,
  knock: KnockScene,
  porridge: PorridgeScene,
  chairs: ChairsScene,
  beds: BedsScene,
  home: HomeScene,
  found: FoundScene,
  fix: FixScene,
  moral: MoralScene,
};

export const defaultGoldilocksStoryProps: StoryAudioProps = storyAudioDefaults("kids/goldilocks/music.mp3");

export const GoldilocksStory: React.FC<StoryAudioProps> = (p) => <StoryShell scenes={SCENES} components={GOLDILOCKS_COMPONENTS} {...p} />;

export const GoldilocksThumbnail: React.FC = () => (
  <ThumbnailFrame
    lines={[{ en: "Goldilocks", es: "Ricitos" }, { en: "and the", es: "de Oro y" }, { en: "Three Bears", es: "los Tres Osos" }]}
    colors={[GC.curlDark, C_PINK, GC.papaDark]}
    side="left"
  >
    <Forest backdrop={false} cabin={false}>
      <Bear kind="papa" x={1380} y={GROUND_Y + 160} size={700} eyes="wide" mouthOpen={0.4} />
      <Lamb x={1700} y={GROUND_Y + 170} size={560} eyes="happy" pose="eat" yum />
      <Bowl x={1640} y={GROUND_Y + 80} kind="little" fill={0.9} steam={1} />
    </Forest>
  </ThumbnailFrame>
);

const C_PINK = "#EFA3C0";
