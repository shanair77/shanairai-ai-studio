/**
 * CompositionBuilder — assemble a composition from configuration.
 *
 * `buildComposition(config)` is the engine's entry point: it validates the schema, resolves
 * the canvas, brand theme, and timeline, then returns a `<Composition>`-ready descriptor
 * whose `component` renders the whole video. The tree is assembled programmatically with
 * `React.createElement` (no hardcoded JSX): music, then one `<Sequence>` per timeline entry,
 * each crossfading in over its resolved transition overlap, all under the brand theme.
 *
 * Usage in Root.tsx:
 *   const built = buildComposition(myConfig);
 *   <Composition id={built.id} component={built.component}
 *     durationInFrames={built.durationInFrames} fps={built.fps}
 *     width={built.width} height={built.height} />
 */

import React, { createElement } from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, useCurrentFrame } from "remotion";
import { secondsToFrames } from "../config/Timing";
import { type Registry } from "../registry";
import {
  resolveNamedAsset,
  validateComposition,
  type CompositionSchema,
  type CompositionSchemaBase,
  type CompositionSchemaFor,
} from "./CompositionSchema";
import { BrandThemeProvider, resolveBrand } from "./BrandConfig";
import { resolveVideoConfig } from "./VideoConfig";
import { buildTimeline, type TimelineEntry } from "./Timeline";
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

/** Wraps a scene and crossfades it in over `fadeInFrames` (sequence-local frames). */
const SceneClip: React.FC<{ fadeInFrames: number; children?: React.ReactNode }> = ({ fadeInFrames, children }) => {
  const frame = useCurrentFrame();
  const opacity =
    fadeInFrames > 0
      ? interpolate(frame, [0, fadeInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 1;
  return createElement(AbsoluteFill, { style: { opacity } }, children);
};

const renderEntry = (entry: TimelineEntry): React.ReactElement =>
  createElement(
    Sequence,
    { key: entry.key, from: entry.from, durationInFrames: entry.durationInFrames, name: entry.label ?? entry.name },
    createElement(
      SceneClip,
      { fadeInFrames: entry.transitionIn.frames },
      createElement(entry.component, entry.props),
    ),
  );

/** Validate and assemble a composition from its configuration (built-in scenes). */
export function buildComposition(config: CompositionSchema): BuiltComposition;
/** Validate and assemble a composition against a custom scene registry. */
export function buildComposition<M extends SceneMap>(
  config: CompositionSchemaFor<M>,
  registry: Registry<M>,
): BuiltComposition;
export function buildComposition(
  config: CompositionSchemaBase,
  registry: SceneResolver = sceneRegistry,
): BuiltComposition {
  validateComposition(config);

  const video = resolveVideoConfig(config);
  const brand = resolveBrand(config.brand ?? (config.theme ? { mode: config.theme } : {}));
  const timeline = buildTimeline(config, video.fps, registry);
  const durationInFrames = Math.max(1, Math.round(video.durationInFrames ?? timeline.durationInFrames));

  const { music, assets } = config;
  const { fps } = video;

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

    timeline.entries.forEach((entry) => layers.push(renderEntry(entry)));

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
