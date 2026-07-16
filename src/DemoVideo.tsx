/**
 * DemoVideo — the configuration-driven demo composition.
 *
 * Replaces the old hardcoded `MyComp`: the whole video is described by `demoConfig` and
 * assembled by the Composition Engine's `buildComposition`, which returns a ready
 * `<Composition>` descriptor (id, component, duration, fps, dimensions). No hardcoded
 * scene tree lives here — it all comes from configuration.
 *
 * (Named DemoVideo rather than Composition to avoid a case clash with `src/composition/`
 * on case-insensitive filesystems.)
 */

import { Composition } from "remotion";
import { buildComposition } from "./composition";
import { demoConfig } from "./demo/DemoConfig";

const demo = buildComposition(demoConfig);

export const DemoVideo: React.FC = () => (
  <Composition
    id={demo.id}
    component={demo.component}
    durationInFrames={demo.durationInFrames}
    fps={demo.fps}
    width={demo.width}
    height={demo.height}
  />
);
