/**
 * JetSetCuts — the 30s and 15s derivative cuts, registered for Studio and render.
 *
 * Same registries as the master: same scenes, same transitions, same asset kit, same brand.
 * Only the configuration differs, which is the whole point of the Composition Engine.
 */

import { Composition } from "remotion";
import { buildComposition, sceneRegistry } from "./composition";
import { transitionRegistry } from "./transitions";
import { brandRegistry } from "./brand";
import { jetSetAdventures, JET_SET } from "./jetset/brand";
import { jetSetKit } from "./jetset/assets";
import { jetSetCampaign30Config } from "./jetset/CampaignConfig30";
import { jetSetCampaign15Config } from "./jetset/CampaignConfig15";

const brands = brandRegistry.extend({ [JET_SET]: jetSetAdventures });

const build = (config: typeof jetSetCampaign30Config) =>
  buildComposition(config, sceneRegistry, transitionRegistry, jetSetKit.registry, brands);

const cut30 = build(jetSetCampaign30Config);
const cut15 = build(jetSetCampaign15Config);

export const JetSetCuts: React.FC = () => (
  <>
    <Composition
      id={cut30.id}
      component={cut30.component}
      durationInFrames={cut30.durationInFrames}
      fps={cut30.fps}
      width={cut30.width}
      height={cut30.height}
    />
    <Composition
      id={cut15.id}
      component={cut15.component}
      durationInFrames={cut15.durationInFrames}
      fps={cut15.fps}
      width={cut15.width}
      height={cut15.height}
    />
  </>
);
