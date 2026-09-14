/**
 * AurelleCommercial — registers the ShanairAICommercial45 composition for Studio + render.
 *
 * A NEW standalone composition (a hand-authored cinematic film, not a config-engine build).
 * It touches no existing composition; it only adds one entry to the root. 1080×1920 · 30fps.
 */

import { Composition } from "remotion";
import { ShanairAICommercial45 } from "./aurelle/ShanairAICommercial45";
import { DURATION, FPS, HEIGHT, WIDTH } from "./aurelle/config";

export const AurelleCommercial: React.FC = () => (
  <Composition
    id="ShanairAICommercial45"
    component={ShanairAICommercial45}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
