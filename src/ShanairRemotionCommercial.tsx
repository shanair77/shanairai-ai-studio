/**
 * ShanairRemotionCommercial — the "how it was made" promo, registered for Studio + render.
 *
 * TWO cuts from ONE set of components (the Composition Engine idea, applied to a bespoke film):
 *   • Variant A — the original.
 *   • Variant B — the A/B test: direct hook, alternate copy accents, cooler cinematic bed.
 * Both are NEW standalone compositions; neither touches the Jet Set film or any existing one.
 * 9:16, 1080×1920, 30fps, exactly 900 frames (30.000s).
 */

import { Composition } from "remotion";
import { ShanairCommercial } from "./promo/ShanairCommercial";
import { DURATION_IN_FRAMES, FPS, variantA, variantB } from "./promo/config";
import { BrandFilm } from "./promo/BrandFilm";
import { BF_DURATION, BF_FPS } from "./promo/brandfilmConfig";
import { Commercial45 } from "./promo/Commercial45";
import { C45_DURATION, C45_FPS } from "./promo/commercial45Config";

const VariantA: React.FC = () => <ShanairCommercial variant={variantA} />;
const VariantB: React.FC = () => <ShanairCommercial variant={variantB} />;

export const ShanairRemotionCommercial: React.FC = () => (
  <>
    <Composition
      id={variantA.id}
      component={VariantA}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id={variantB.id}
      component={VariantB}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    {/* A new concept, not a variant: the photo-led client-pitch film. */}
    <Composition
      id="ShanairAI-BrandFilm"
      component={BrandFilm}
      durationInFrames={BF_DURATION}
      fps={BF_FPS}
      width={1080}
      height={1920}
    />
    {/* The 45s "made with Claude Code + Remotion" commercial, cut from NEW moving footage. */}
    <Composition
      id="ShanairAI-RemotionCommercial-V2"
      component={Commercial45}
      durationInFrames={C45_DURATION}
      fps={C45_FPS}
      width={1080}
      height={1920}
    />
  </>
);
