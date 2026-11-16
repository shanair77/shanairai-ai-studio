import { Composition } from "remotion";
import {
  CountryMouseStory,
  FPS,
  HEIGHT,
  WIDTH,
  calculateCountryMouseStoryMetadata,
  defaultCountryMouseStoryProps,
} from "./CountryMouseStory";

export const MouseRoot: React.FC = () => (
  <Composition
    id="CountryMouseStory"
    component={CountryMouseStory}
    durationInFrames={120 * FPS}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={defaultCountryMouseStoryProps}
    calculateMetadata={calculateCountryMouseStoryMetadata}
  />
);
