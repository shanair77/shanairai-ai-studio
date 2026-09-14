/**
 * shanairai/PromoConfig — the Shanair.AI promotional film, described entirely as data.
 *
 * A single `CompositionSchema`: no React tree, no bespoke rendering path. Every scene is
 * resolved BY NAME from the Scene Registry, every duration is folded by the Timeline, and the
 * identity comes from the `shanair-ai` brand pack — including the house `dissolve`, which is
 * deliberately NOT restated here so the brand's own default is the thing that supplies it.
 *
 * Timing (9:16, 30fps — 450 frames):
 *   scenes  3.0 + 3.2 + 2.8 + 3.5 + 2.5 + 2.5 = 17.5s
 *   overlap 5 boundaries x 0.5s dissolve      =  2.5s
 *   total   17.5 − 2.5                        = 15.0s   (Σscene − Σtransition, per ADR-002 §5)
 *
 * Every scene sits in the `social` safe area: 9:16 is a feed format, so the top and bottom
 * bands stay clear of platform chrome. Surfaces alternate background → surface → surfaceAlt
 * to give the six beats a tonal rhythm using nothing but semantic theme roles.
 */

import { type CompositionSchema } from "../composition";
import { ActionChip, CapabilityPill, Wordmark } from "./BrandMarks";
import { SHANAIR_AI } from "./brand";

export const shanairPromoConfig: CompositionSchema = {
  id: "ShanairAI-Promo",
  format: "vertical",
  fps: 30,
  duration: 15,
  brand: SHANAIR_AI,
  scenes: [
    {
      scene: "logo-reveal",
      label: "Mark",
      duration: 3,
      props: {
        safeArea: "social",
        mark: <Wordmark size="lead" />,
        tagline: "Intelligence, refined.",
        drift: 8,
      },
    },
    {
      scene: "hero",
      label: "Hook",
      duration: 3.2,
      props: {
        safeArea: "social",
        eyebrow: "AI Studio",
        title: "Luxury at machine speed",
        subtitle: "Describe the film. The engine renders every frame.",
        maxWidth: 900,
      },
    },
    {
      scene: "centered",
      label: "Premise",
      duration: 2.8,
      props: {
        safeArea: "social",
        surface: "surface",
        eyebrow: "One configuration",
        title: "Everything composes",
        body: "Scenes, motion, typography, and brand — resolved from a single object, compiled to video.",
        maxWidth: 820,
      },
    },
    {
      scene: "feature",
      label: "Capabilities",
      duration: 3.5,
      props: {
        safeArea: "social",
        eyebrow: "Built in",
        title: "Studio-grade primitives",
        maxWidth: 880,
        gap: "md",
        children: [
          <CapabilityPill key="scenes" label="Scene Registry" detail="Ten composable scene primitives" />,
          <CapabilityPill key="motion" label="Motion Engine" detail="Frame-driven, render-exact" />,
          <CapabilityPill key="brand" label="Brand System" detail="One theme, every format" />,
        ],
      },
    },
    {
      scene: "cta",
      label: "Call to action",
      duration: 2.5,
      props: {
        safeArea: "social",
        surface: "surfaceAlt",
        eyebrow: "Now in production",
        title: "Create at the speed of thought",
        subtitle: "Programmatic video for luxury brands.",
        maxWidth: 880,
        actions: <ActionChip>shanair.ai</ActionChip>,
      },
    },
    {
      scene: "outro",
      label: "Sign-off",
      duration: 2.5,
      props: {
        safeArea: "social",
        mark: <Wordmark size="sign-off" />,
        subtitle: "Intelligence, refined.",
        maxWidth: 880,
        actions: <ActionChip>shanair.ai</ActionChip>,
      },
    },
  ],
};
