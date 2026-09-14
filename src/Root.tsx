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
    </>
  );
};
