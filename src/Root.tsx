import "./index.css";
import { Composition } from "remotion";
import { DemoVideo } from "./DemoVideo";
import {
  FPS,
  HEIGHT,
  LuxuryReel,
  WIDTH,
  calculateLuxuryReelMetadata,
  defaultLuxuryReelProps,
} from "./luxury/LuxuryReel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <DemoVideo />
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
    </>
  );
};
