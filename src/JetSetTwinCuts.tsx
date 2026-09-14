/**
 * JetSetTwinCuts — the twin-led 30s and 15s derivative cuts, registered for Studio and render.
 *
 * Same engine and registries as the locked cutdowns; the difference is the asset kit. As in
 * `JetSetTwin`, the twin kit is installed on the BRAND (not passed positionally to the builder),
 * because `BrandContext` installs the brand's own `assets` provider inside the composition and the
 * brand's kit wins. `extend` is immutable, so the locked film's brand is untouched.
 */

import { Composition } from "remotion";
import { buildComposition, sceneRegistry } from "./composition";
import { transitionRegistry } from "./transitions";
import { brandRegistry } from "./brand";
import { jetSetAdventures, JET_SET } from "./jetset/brand";
import { jetSetTwinKit } from "./jetset/twin-assets";
import { jetSetTwin30Config } from "./jetset/CampaignConfigTwin30";
import { jetSetTwin15Config } from "./jetset/CampaignConfigTwin15";

const twinBrand = { ...jetSetAdventures, assets: jetSetTwinKit };
const brands = brandRegistry.extend({ [JET_SET]: twinBrand });

const build = (config: typeof jetSetTwin30Config) =>
  buildComposition(config, sceneRegistry, transitionRegistry, jetSetTwinKit.registry, brands);

const twinCut30 = build(jetSetTwin30Config);
const twinCut15 = build(jetSetTwin15Config);

export const JetSetTwinCuts: React.FC = () => (
  <>
    <Composition
      id={twinCut30.id}
      component={twinCut30.component}
      durationInFrames={twinCut30.durationInFrames}
      fps={twinCut30.fps}
      width={twinCut30.width}
      height={twinCut30.height}
    />
    <Composition
      id={twinCut15.id}
      component={twinCut15.component}
      durationInFrames={twinCut15.durationInFrames}
      fps={twinCut15.fps}
      width={twinCut15.width}
      height={twinCut15.height}
    />
  </>
);
