/**
 * CompositionBuilder — assemble a composition from configuration (ADR-002).
 *
 * `buildComposition(config)` validates the schema, resolves the canvas, brand theme, and the
 * slim timeline, then returns a `<Composition>`-ready descriptor. The scene tree is assembled
 * programmatically with `React.createElement` (no hardcoded JSX): scenes connected by real
 * transitions are grouped into `<TransitionSeries>` runs (interleaved `.Sequence` / `.Transition`);
 * "cut" boundaries (0 overlap, e.g. `none`) split runs so they contribute no duration — giving
 * exact `Σ(scene) − Σ(transition)` parity. Music and the `BrandThemeProvider` remain outer
 * siblings, so audio continuity is unaffected.
 *
 * Usage in Root.tsx:
 *   const built = buildComposition(myConfig);
 *   <Composition id={built.id} component={built.component}
 *     durationInFrames={built.durationInFrames} fps={built.fps}
 *     width={built.width} height={built.height} />
 */

import React, { createElement } from "react";
import { AbsoluteFill, Audio, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { secondsToFrames } from "../config/Timing";
import { type Registry } from "../registry";
import { transitionRegistry, type TransitionContext, type TransitionResolver } from "../transitions";
import {
  resolveNamedAsset,
  validateComposition,
  type CompositionSchema,
  type CompositionSchemaBase,
  type CompositionSchemaFor,
} from "./CompositionSchema";
import { BrandThemeProvider, resolveBrand } from "./BrandConfig";
import { resolveVideoConfig } from "./VideoConfig";
import { resolveTimeline, type ResolvedBoundary, type ResolvedScene, type Timeline } from "./Timeline";
import { sceneRegistry, type SceneMap, type SceneResolver } from "./SceneRegistry";

/** A `<Composition>`-ready descriptor produced from configuration. */
export type BuiltComposition = {
  id: string;
  component: React.FC;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
};

const sceneElement = (scene: ResolvedScene): React.ReactElement =>
  createElement(scene.component, scene.props as Record<string, unknown>);

/** Render one run (transition-connected scenes) as a positioned Sequence. */
const renderRun = (
  scenes: ResolvedScene[],
  boundaries: ResolvedBoundary[],
  from: number,
  durationInFrames: number,
  ctx: TransitionContext,
  runIndex: number,
): React.ReactElement => {
  if (scenes.length === 1) {
    const s = scenes[0];
    return createElement(Sequence, { key: `run-${runIndex}`, from, durationInFrames, name: s.label ?? s.name }, sceneElement(s));
  }

  const children: React.ReactNode[] = [];
  scenes.forEach((s, k) => {
    if (k > 0) {
      const b = boundaries[k - 1];
      children.push(
        createElement(TransitionSeries.Transition, {
          key: `t-${k}`,
          timing: linearTiming({ durationInFrames: b.frames }),
          presentation: b.definition.presentation(b.options, ctx),
        }),
      );
    }
    children.push(
      createElement(
        TransitionSeries.Sequence,
        { key: `s-${k}`, durationInFrames: s.durationInFrames, name: s.label ?? s.name },
        sceneElement(s),
      ),
    );
  });

  return createElement(
    Sequence,
    { key: `run-${runIndex}`, from, durationInFrames },
    createElement(TransitionSeries, null, children),
  );
};

/** Group scenes into transition-connected runs and render each at its cumulative offset. */
const assembleRuns = (timeline: Timeline, ctx: TransitionContext): React.ReactNode[] => {
  const { scenes, boundaries } = timeline;
  const runs: React.ReactNode[] = [];
  let from = 0;
  let i = 0;
  let runIndex = 0;

  while (i < scenes.length) {
    const runScenes: ResolvedScene[] = [scenes[i]];
    const runBoundaries: ResolvedBoundary[] = [];
    let j = i;
    while (j + 1 < scenes.length && boundaries[j + 1].frames > 0) {
      runBoundaries.push(boundaries[j + 1]);
      runScenes.push(scenes[j + 1]);
      j += 1;
    }

    const sceneFrames = runScenes.reduce((sum, s) => sum + s.durationInFrames, 0);
    const overlap = runBoundaries.reduce((sum, b) => sum + b.frames, 0);
    const runDuration = sceneFrames - overlap;

    runs.push(renderRun(runScenes, runBoundaries, from, runDuration, ctx, runIndex));
    from += runDuration;
    runIndex += 1;
    i = j + 1;
  }

  return runs;
};

/** Validate and assemble a composition from its configuration (built-in scenes). */
export function buildComposition(config: CompositionSchema): BuiltComposition;
/** Validate and assemble a composition against a custom scene registry. */
export function buildComposition<M extends SceneMap>(
  config: CompositionSchemaFor<M>,
  scenes: Registry<M>,
): BuiltComposition;
export function buildComposition(
  config: CompositionSchemaBase,
  scenes: SceneResolver = sceneRegistry,
  transitions: TransitionResolver = transitionRegistry,
): BuiltComposition {
  validateComposition(config);

  const video = resolveVideoConfig(config);
  const brand = resolveBrand(config.brand ?? (config.theme ? { mode: config.theme } : {}));
  const timeline = resolveTimeline(config, video.fps, scenes, transitions);
  const durationInFrames = Math.max(1, Math.round(video.durationInFrames ?? timeline.durationInFrames));

  const { music, assets } = config;
  const { fps } = video;
  const ctx: TransitionContext = { width: video.width, height: video.height };

  const Root: React.FC = () => {
    const layers: React.ReactNode[] = [];

    if (music) {
      layers.push(
        createElement(Audio, {
          key: "music",
          src: resolveNamedAsset(assets, music.src),
          volume: music.volume ?? 1,
          loop: music.loop ?? true,
          trimBefore: music.startFrom !== undefined ? secondsToFrames(music.startFrom, fps) : undefined,
        }),
      );
    }

    assembleRuns(timeline, ctx).forEach((run) => layers.push(run));

    return createElement(BrandThemeProvider, { theme: brand.theme }, createElement(AbsoluteFill, null, layers));
  };

  return {
    id: config.id,
    component: Root,
    durationInFrames,
    fps: video.fps,
    width: video.width,
    height: video.height,
  };
}
