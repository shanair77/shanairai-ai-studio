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
import { DomainError } from "../errors";
import { secondsToFrames } from "../config/Timing";
import { type Registry } from "../registry";
import { transitionRegistry, type TransitionContext, type TransitionResolver } from "../transitions";
import {
  AssetRegistryProvider,
  assetRegistry,
  assertCategory,
  audioVolume,
  duckedVolume,
  resolveAsset,
  type AssetRegistry,
  type DuckWindow,
} from "../assets";
import {
  validateComposition,
  type AudioCue,
  type AudioRole,
  type CompositionSchema,
  type CompositionSchemaBase,
  type CompositionSchemaFor,
  type MusicConfig,
} from "./CompositionSchema";
import { BrandProvider, brandRegistry, resolveBrand, type BrandDefinition, type BrandRegistry } from "../brand";
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

/** Resolve a named audio asset to a file src, failing clearly on the wrong category/kind. */
const audioSrc = (name: string, assets: AssetRegistry): string => {
  const def = assets.require(name); // throws with a clear message if missing
  assertCategory(name, def, ["audio"]);
  const resolved = resolveAsset(name, def);
  if (resolved.kind !== "file") {
    throw new Error(`Audio asset "${name}" did not resolve to a file-backed source.`);
  }
  return resolved.src;
};

/** Seconds → frames for the optional trim fields shared by music and cues. */
const trimProps = (
  trimBefore: number | undefined,
  trimAfter: number | undefined,
  fps: number,
): Record<string, unknown> => ({
  ...(trimBefore !== undefined ? { trimBefore: secondsToFrames(trimBefore, fps) } : {}),
  ...(trimAfter !== undefined ? { trimAfter: secondsToFrames(trimAfter, fps) } : {}),
});

/** A cue resolved to its frame window and `<Audio>` props. */
type ResolvedCue = {
  key: string;
  from: number;
  durationInFrames: number;
  role: AudioRole;
  name: string;
  props: Record<string, unknown>;
};

const DEFAULT_DUCK_LEVEL = 0.28;
const DEFAULT_DUCK_RAMP = 0.35;
const DEFAULT_DUCK_ROLES: AudioRole[] = ["voiceover"];

/**
 * Resolve positioned audio cues. Each cue's fade envelope is computed against ITS OWN length,
 * because the `<Audio>` sits inside a positioned `<Sequence>` and therefore sees frames relative
 * to the cue rather than to the composition.
 */
const resolveAudioCues = (
  cues: AudioCue[],
  assets: AssetRegistry,
  fps: number,
  totalFrames: number,
): ResolvedCue[] =>
  cues.map((cue, i) => {
    if (!cue.asset) {
      throw new DomainError({
        code: "invalid-composition",
        message: `AudioCue[${i}]: \`asset\` is required.`,
        path: `audio[${i}].asset`,
      });
    }
    const src = audioSrc(cue.asset, assets);
    const from = Math.max(0, secondsToFrames(cue.startAt ?? 0, fps));
    const requested =
      cue.duration !== undefined ? secondsToFrames(cue.duration, fps) : totalFrames - from;
    // Clamp so a cue can never extend past the composition, which would silently drop it.
    const durationInFrames = Math.max(1, Math.min(requested, Math.max(1, totalFrames - from)));
    const role = cue.role ?? "sfx";

    return {
      key: `cue-${i}`,
      from,
      durationInFrames,
      role,
      name: cue.label ?? `${role}: ${cue.asset}`,
      props: {
        src,
        volume: audioVolume(
          cue.volume ?? 1,
          secondsToFrames(cue.fadeIn ?? 0, fps),
          secondsToFrames(cue.fadeOut ?? 0, fps),
          durationInFrames,
        ),
        loop: cue.loop ?? false,
        ...trimProps(cue.trimBefore, cue.trimAfter, fps),
      },
    };
  });

/** The frame windows music should duck beneath, taken from cues in the configured roles. */
const duckWindowsFrom = (cues: ResolvedCue[], roles: AudioRole[]): DuckWindow[] =>
  cues
    .filter((c) => roles.includes(c.role))
    .map((c) => ({ start: c.from, end: c.from + c.durationInFrames }));

/** Resolve music into `<Audio>` props from a named audio asset in the registry. */
const resolveMusicProps = (
  music: MusicConfig,
  assets: AssetRegistry,
  fps: number,
  durationInFrames: number,
  windows: DuckWindow[],
): Record<string, unknown> => {
  if (!music.asset) {
    throw new DomainError({ code: "invalid-composition", message: "MusicConfig: `asset` is required.", path: "music.asset" });
  }
  const src = audioSrc(music.asset, assets);
  const base = music.volume ?? 1;
  const fadeIn = secondsToFrames(music.fadeIn ?? 0, fps);
  const fadeOut = secondsToFrames(music.fadeOut ?? 0, fps);
  const duck = music.ducking;
  const startFrame = Math.max(0, secondsToFrames(music.startAt ?? 0, fps));
  // Inside a positioned Sequence the volume callback sees sequence-relative frames, so the duck
  // windows — which are measured in absolute composition frames — have to be rebased to match.
  const rebased = startFrame === 0 ? windows : windows.map((w) => ({ start: w.start - startFrame, end: w.end - startFrame }));
  const playFrames = Math.max(1, durationInFrames - startFrame);

  // Music is a direct child of the root (never inside a Sequence), so its volume callback
  // receives ABSOLUTE composition frames — which is exactly the space the duck windows are in.
  const volume =
    duck && rebased.length > 0
      ? duckedVolume(
          base,
          fadeIn,
          fadeOut,
          playFrames,
          rebased,
          duck.level ?? DEFAULT_DUCK_LEVEL,
          secondsToFrames(duck.ramp ?? DEFAULT_DUCK_RAMP, fps),
        )
      : audioVolume(base, fadeIn, fadeOut, playFrames);

  return {
    src,
    volume,
    startFrame,
    playFrames,
    loop: music.loop ?? true,
    ...trimProps(music.trimBefore, music.trimAfter, fps),
  };
};

/** Validate and assemble a composition from its configuration (built-in scenes). */
export function buildComposition(config: CompositionSchema): BuiltComposition;
/** Validate and assemble a composition against a custom scene registry. */
export function buildComposition<M extends SceneMap>(
  config: CompositionSchemaFor<M>,
  scenes: Registry<M>,
): BuiltComposition;
/** Full control: custom scene / transition / asset / brand registries. */
export function buildComposition(
  config: CompositionSchemaBase,
  scenes: SceneResolver,
  transitions: TransitionResolver,
  assets?: AssetRegistry,
  brands?: BrandRegistry,
): BuiltComposition;
export function buildComposition(
  config: CompositionSchemaBase,
  scenes: SceneResolver = sceneRegistry,
  transitions: TransitionResolver = transitionRegistry,
  assets: AssetRegistry = assetRegistry,
  brands: BrandRegistry = brandRegistry,
): BuiltComposition {
  validateComposition(config);

  const video = resolveVideoConfig(config);
  // Select a registered brand pack by name, or none.
  const brandInput: BrandDefinition | undefined = config.brand ? brands.require(config.brand) : undefined;
  const brand = resolveBrand(brandInput, config.theme);

  // The default transition falls back to the brand's default when the composition omits one.
  const mergedConfig: CompositionSchemaBase = { ...config, transitions: config.transitions ?? brand.transition };
  const timeline = resolveTimeline(mergedConfig, video.fps, scenes, transitions);
  const durationInFrames = Math.max(1, Math.round(video.durationInFrames ?? timeline.durationInFrames));

  // Music: the composition's own track wins; otherwise fall back to the brand's default audio
  // (a brand feature, resolved here where the brand is resolved — not by any upstream producer).
  const music: MusicConfig | undefined =
    config.music ?? (brand.audio?.music ? { asset: brand.audio.music } : undefined);
  const { fps } = video;
  const ctx: TransitionContext = { width: video.width, height: video.height };
  const cues = resolveAudioCues(config.audio ?? [], assets, fps, durationInFrames);
  const duckRoles = music?.ducking?.under ?? DEFAULT_DUCK_ROLES;
  const musicProps = music
    ? resolveMusicProps(music, assets, fps, durationInFrames, duckWindowsFrom(cues, duckRoles))
    : undefined;

  const Root: React.FC = () => {
    const layers: React.ReactNode[] = [];

    if (musicProps) {
      const { startFrame, playFrames, ...audioProps } = musicProps as { startFrame: number; playFrames: number } & Record<string, unknown>;
      layers.push(
        startFrame > 0
          ? createElement(
              Sequence,
              { key: "music", from: startFrame, durationInFrames: playFrames, name: "music" },
              createElement(Audio, audioProps),
            )
          : createElement(Audio, { key: "music", ...audioProps }),
      );
    }

    // Positioned cues sit as siblings of the scene runs, so they are free to cross scene
    // boundaries — which is what makes J-cuts and L-cuts possible.
    cues.forEach((cue) => {
      layers.push(
        createElement(
          Sequence,
          { key: cue.key, from: cue.from, durationInFrames: cue.durationInFrames, name: cue.name },
          createElement(Audio, cue.props),
        ),
      );
    });

    assembleRuns(timeline, ctx).forEach((run) => layers.push(run));

    return createElement(
      AssetRegistryProvider,
      { registry: assets },
      createElement(BrandProvider, { brand }, createElement(AbsoluteFill, null, layers)),
    );
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
