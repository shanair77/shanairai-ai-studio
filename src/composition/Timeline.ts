/**
 * Timeline — slim resolver: scenes + boundary transitions + total (ADR-002 §5).
 *
 * It no longer computes absolute frame windows (`TransitionSeries` owns sequencing/overlap).
 * It resolves, in order: each scene's frame length + effective opacity; each boundary's
 * transition definition, options, and CLAMPED overlap frames; and the total duration as
 * `Σ(scene frames) − Σ(boundary frames)`. `boundaries[i]` is the transition INTO `scenes[i]`
 * (`boundaries[0]` is a cut with 0 frames). It also enforces the opacity contract: a
 * transition requiring an opaque incoming scene is rejected when that scene is non-opaque.
 */

import { DomainError } from "../errors";
import { theme } from "../config/Theme";
import { secondsToFrames } from "../config/Timing";
import { type CompositionSchemaBase } from "./CompositionSchema";
import { sceneRegistry, type SceneComponent, type SceneResolver } from "./SceneRegistry";
import { transitionRegistry } from "../transitions";
import type { TransitionDefinition, TransitionResolver } from "../transitions";

export type ResolvedScene = {
  key: string;
  name: string;
  label?: string;
  component: SceneComponent;
  /** Opaque config-supplied props, passed straight to the scene component. */
  props: unknown;
  durationInFrames: number;
  /** Effective opacity (config ?? definition ?? true). */
  opaque: boolean;
};

export type ResolvedBoundary = {
  /** Transition name. `boundaries[i]` transitions INTO `scenes[i]`. */
  type: string;
  /** Clamped overlap frames (0 = hard cut / first scene). */
  frames: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  definition: TransitionDefinition<any>;
  /** User-supplied presentation options (opaque here; typed in `TransitionConfigFor`). */
  options: unknown;
};

export type Timeline = {
  scenes: ResolvedScene[];
  /** Same length as `scenes`; `boundaries[i]` is the transition into `scenes[i]`. */
  boundaries: ResolvedBoundary[];
  /** Content length in frames: Σ(scene frames) − Σ(boundary frames). */
  durationInFrames: number;
  fps: number;
};

/** Resolve a composition's scenes + transitions into the slim timeline model. */
export const resolveTimeline = (
  config: CompositionSchemaBase,
  fps: number,
  scenes: SceneResolver = sceneRegistry,
  transitions: TransitionResolver = transitionRegistry,
): Timeline => {
  const defaultTransition = config.transitions ?? { type: "none" };

  const resolvedScenes: ResolvedScene[] = config.scenes.map((scene, i) => {
    const def = scenes.require(scene.scene);
    const durationInFrames = secondsToFrames(
      scene.duration ?? config.timing?.defaultSceneDuration ?? def.defaultDuration,
      fps,
    );
    const opaque = scene.opaque ?? def.opaque ?? true;
    return { key: `${scene.scene}-${i}`, name: scene.scene, label: scene.label, component: def.component, props: scene.props ?? {}, durationInFrames, opaque };
  });

  const boundaries: ResolvedBoundary[] = config.scenes.map((scene, i) => {
    const transition = scene.transition ?? defaultTransition;
    const def = transitions.require(transition.type);
    const isCut = !def.capabilities.affectsEntering && !def.capabilities.affectsExiting;

    // Opacity contract: reject a transition that needs an opaque incoming scene against a
    // non-opaque one. (Never applies to the first scene or a cut.)
    if (i > 0 && !isCut && def.capabilities.requiresOpaqueIncoming && !resolvedScenes[i].opaque) {
      throw new DomainError({
        code: "opacity-contract",
        message:
          `Transition "${transition.type}" requires an opaque incoming scene, but scene "${resolvedScenes[i].name}" ` +
          `(index ${i}) is declared non-opaque. Use a transparency-safe transition (e.g. "dissolve").`,
        path: `scenes[${i}]`,
      });
    }

    if (i === 0 || isCut) {
      return { type: transition.type, frames: 0, definition: def, options: transition.options };
    }

    const requested =
      transition.duration !== undefined
        ? secondsToFrames(transition.duration, fps)
        : (def.defaultDurationInFrames ?? secondsToFrames(theme.timing.durations.base, fps));
    const frames = Math.max(
      0,
      Math.min(requested, resolvedScenes[i - 1].durationInFrames, resolvedScenes[i].durationInFrames),
    );
    return { type: transition.type, frames, definition: def, options: transition.options };
  });

  const totalScene = resolvedScenes.reduce((sum, s) => sum + s.durationInFrames, 0);
  const totalOverlap = boundaries.reduce((sum, b) => sum + b.frames, 0);

  return { scenes: resolvedScenes, boundaries, durationInFrames: totalScene - totalOverlap, fps };
};
