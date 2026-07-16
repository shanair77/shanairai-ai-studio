/**
 * Timeline — resolve ordered scenes + transitions into concrete frame windows.
 *
 * Turns the declarative scene list into absolute placements: each entry gets a start frame,
 * a length in frames, and a resolved entrance transition. Transitions are modelled as
 * OVERLAPS — a `fade` of N frames starts the incoming scene N frames before the previous
 * one ends, so they crossfade — and the overlap is clamped so it can never exceed either
 * neighbouring scene. The reported `durationInFrames` is the content length (sum of scene
 * lengths minus the overlaps), which the builder uses when no explicit duration is set.
 */

import { theme } from "../config/Theme";
import { secondsToFrames } from "../config/Timing";
import { type CompositionSchema, type TransitionType } from "./CompositionSchema";
import { sceneRegistry, type SceneComponent, type SceneResolver } from "./SceneRegistry";

export type ResolvedTransition = {
  type: TransitionType;
  /** Overlap/crossfade length in frames (0 for "none" and the first scene). */
  frames: number;
};

export type TimelineEntry = {
  key: string;
  name: string;
  label?: string;
  component: SceneComponent;
  props: Record<string, unknown>;
  /** Absolute start frame. */
  from: number;
  durationInFrames: number;
  /** Transition into this scene. */
  transitionIn: ResolvedTransition;
};

export type Timeline = {
  entries: TimelineEntry[];
  /** Content length in frames (after transition overlaps). */
  durationInFrames: number;
  fps: number;
};

/** Resolve a composition's scenes into an absolute, transition-aware timeline. */
export const buildTimeline = (
  config: CompositionSchema,
  fps: number,
  registry: SceneResolver = sceneRegistry,
): Timeline => {
  const defaultTransition = config.transitions ?? { type: "none" as const };
  const entries: TimelineEntry[] = [];

  config.scenes.forEach((scene, i) => {
    const def = registry.require(scene.scene);

    const durationInFrames =
      scene.durationInFrames ??
      secondsToFrames(scene.duration ?? config.timing?.defaultSceneDuration ?? def.defaultDuration, fps);

    const transition = scene.transition ?? defaultTransition;
    const prev = entries[i - 1];
    const requestedOverlap =
      i === 0 || transition.type === "none"
        ? 0
        : secondsToFrames(transition.duration ?? theme.timing.durations.base, fps);
    const overlap =
      prev === undefined ? 0 : Math.max(0, Math.min(requestedOverlap, prev.durationInFrames, durationInFrames));

    const from = prev === undefined ? 0 : prev.from + prev.durationInFrames - overlap;

    entries.push({
      key: `${scene.scene}-${i}`,
      name: scene.scene,
      label: scene.label,
      component: def.component,
      props: scene.props ?? {},
      from,
      durationInFrames,
      transitionIn: { type: i === 0 ? "none" : transition.type, frames: overlap },
    });
  });

  const last = entries[entries.length - 1];
  const durationInFrames = last ? last.from + last.durationInFrames : 0;

  return { entries, durationInFrames, fps };
};
