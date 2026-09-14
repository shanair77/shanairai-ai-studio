/**
 * ShanairPromo — the Shanair.AI promotional composition, registered for Studio + render.
 *
 * Mirrors `DemoVideo`: the whole video is `shanairPromoConfig`, and the Composition Engine's
 * `buildComposition` turns it into a `<Composition>`-ready descriptor. The only difference is
 * the registry overload — this one passes the brand registry extended with the Shanair.AI
 * pack, since the framework's default brand registry is empty by design. Scenes, transitions,
 * and assets stay the framework defaults.
 */

import { Composition } from "remotion";
import { assetRegistry } from "./assets";
import { buildComposition, sceneRegistry } from "./composition";
import { transitionRegistry } from "./transitions";
import { brands } from "./shanairai/brand";
import { shanairPromoConfig } from "./shanairai/PromoConfig";

const promo = buildComposition(
  shanairPromoConfig,
  sceneRegistry,
  transitionRegistry,
  assetRegistry,
  brands,
);

export const ShanairPromo: React.FC = () => (
  <Composition
    id={promo.id}
    component={promo.component}
    durationInFrames={promo.durationInFrames}
    fps={promo.fps}
    width={promo.width}
    height={promo.height}
  />
);
