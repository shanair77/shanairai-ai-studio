/**
 * JetSetTwin — the twin-led master, registered for Studio and render.
 *
 * Same engine, same registries, same brand as the locked film. The only difference is the
 * asset kit: `jetSetTwinKit` is `jetSetKit` plus the twin media, so the locked film's own kit
 * and its manifest are untouched by this exploration.
 */

import { Composition } from "remotion";
import { buildComposition, sceneRegistry } from "./composition";
import { transitionRegistry } from "./transitions";
import { brandRegistry } from "./brand";
import { jetSetAdventures, JET_SET } from "./jetset/brand";
import { jetSetTwinKit } from "./jetset/twin-assets";
import { jetSetTwinConfig } from "./jetset/CampaignConfigTwin";

// THE KIT IS SWAPPED ON THE BRAND, NOT ON THE BUILDER. `BrandContext` installs a brand's own
// `assets` as a provider INSIDE the one `buildComposition` creates, so the brand's kit wins and
// the builder's `assets` argument is only a fallback for brands that ship none. Passing the twin
// kit positionally looks correct and silently does nothing. `extend` is immutable, so the locked
// film's brand is untouched by this override.
const twinBrand = { ...jetSetAdventures, assets: jetSetTwinKit };
const brands = brandRegistry.extend({ [JET_SET]: twinBrand });

const twin = buildComposition(
  jetSetTwinConfig,
  sceneRegistry,
  transitionRegistry,
  jetSetTwinKit.registry,
  brands,
);

export const JetSetTwin: React.FC = () => (
  <Composition
    id={twin.id}
    component={twin.component}
    durationInFrames={twin.durationInFrames}
    fps={twin.fps}
    width={twin.width}
    height={twin.height}
  />
);
