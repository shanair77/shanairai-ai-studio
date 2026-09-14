/**
 * JetSetCampaign — the Jet Set Adventures master film, registered for Studio and render.
 *
 * Assembled by the Composition Engine from `jetSetCampaignConfig`, against the brand registry
 * extended with the Jet Set pack and the campaign's own asset kit.
 */

import { Composition } from "remotion";
import { buildComposition, sceneRegistry } from "./composition";
import { transitionRegistry } from "./transitions";
import { brandRegistry } from "./brand";
import { jetSetAdventures, JET_SET } from "./jetset/brand";
import { jetSetKit } from "./jetset/assets";
import { jetSetCampaignConfig } from "./jetset/CampaignConfig";

const brands = brandRegistry.extend({ [JET_SET]: jetSetAdventures });

const master = buildComposition(
  jetSetCampaignConfig,
  sceneRegistry,
  transitionRegistry,
  jetSetKit.registry,
  brands,
);

export const JetSetCampaign: React.FC = () => (
  <Composition
    id={master.id}
    component={master.component}
    durationInFrames={master.durationInFrames}
    fps={master.fps}
    width={master.width}
    height={master.height}
  />
);
