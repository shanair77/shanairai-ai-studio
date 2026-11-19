import "./index.css";
import { Composition } from "remotion";
import { DemoVideo } from "./DemoVideo";
import { ShanairPromo } from "./ShanairPromo";
import { JetSetCampaign } from "./JetSetCampaign";
import { JetSetAuditions } from "./JetSetAudition";
import { JetSetCuts } from "./JetSetCuts";
import { JetSetTwin } from "./JetSetTwin";
import { JetSetTwinCuts } from "./JetSetTwinCuts";
import { ShanairRemotionCommercial } from "./ShanairRemotionCommercial";
import { AurelleCommercial } from "./AurelleCommercial";
import {
  FPS,
  HEIGHT,
  LuxuryReel,
  WIDTH,
  calculateLuxuryReelMetadata,
  defaultLuxuryReelProps,
} from "./luxury/LuxuryReel";
import {
  OldMoneyReel,
  blackwoodPromoProps,
  calculateOldMoneyReelMetadata,
  defaultOldMoneyReelProps,
} from "./oldmoney/OldMoneyReel";
import {
  NyelleReel,
  calculateNyelleReelMetadata,
  defaultNyelleReelProps,
} from "./nyelle/NyelleReel";
import {
  ODYSSEY_DURATION,
  ODYSSEY_FPS,
  ODYSSEY_HEIGHT,
  ODYSSEY_WIDTH,
  OdysseyStickman,
} from "./odyssey/OdysseyStickman";
import {
  STYLE_TEST_DURATION,
  STYLE_TEST_FPS,
  TravelStyleTest,
} from "./styletest/TravelStyleTest";
import { MOTION_TEST_DURATION, MOTION_TEST_FPS, MotionTest } from "./styletest/MotionTest";
import { BAKEOFF_DURATION, BAKEOFF_FPS, BakeOff } from "./styletest/BakeOff";
import {
  MOROCCO,
  POSTCARDS_FPS,
  PostcardsEpisode,
  calculateEpisodeMetadata,
  episodeFrames,
} from "./postcards";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <DemoVideo />
      <ShanairPromo />
      <JetSetCampaign />
      <JetSetAuditions />
      <JetSetCuts />
      <JetSetTwin />
      <JetSetTwinCuts />
      <ShanairRemotionCommercial />
      <AurelleCommercial />
      <Composition
        id="LuxuryReel"
        component={LuxuryReel}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={defaultLuxuryReelProps}
        calculateMetadata={calculateLuxuryReelMetadata}
      />
      <Composition
        id="OldMoneyReel"
        component={OldMoneyReel}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={defaultOldMoneyReelProps}
        calculateMetadata={calculateOldMoneyReelMetadata}
      />
      <Composition
        id="BlackwoodPromo"
        component={OldMoneyReel}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={blackwoodPromoProps}
        calculateMetadata={calculateOldMoneyReelMetadata}
      />
      <Composition
        id="NyelleReel"
        component={NyelleReel}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={defaultNyelleReelProps}
        calculateMetadata={calculateNyelleReelMetadata}
      />
      <Composition
        id="OdysseyStickman"
        component={OdysseyStickman}
        durationInFrames={ODYSSEY_DURATION}
        fps={ODYSSEY_FPS}
        width={ODYSSEY_WIDTH}
        height={ODYSSEY_HEIGHT}
      />
      <Composition
        id="TravelStyleTest"
        component={TravelStyleTest}
        durationInFrames={STYLE_TEST_DURATION}
        fps={STYLE_TEST_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="MotionTest"
        component={MotionTest}
        durationInFrames={MOTION_TEST_DURATION}
        fps={MOTION_TEST_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="BakeOff"
        component={BakeOff}
        durationInFrames={BAKEOFF_DURATION}
        fps={BAKEOFF_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="PostcardsMorocco"
        component={PostcardsEpisode}
        durationInFrames={episodeFrames(MOROCCO)}
        fps={POSTCARDS_FPS}
        width={1080}
        height={1920}
        defaultProps={{ episode: MOROCCO }}
        calculateMetadata={calculateEpisodeMetadata}
      />
    </>
  );
};
