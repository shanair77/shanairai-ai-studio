/**
 * StoryShort — a vertical (1080×1920) YouTube Short cut from a story's own scenes.
 *
 * Each segment replays part of a 16:9 scene (with its narration) through a tall
 * window: the scene is scaled by `zoom` and cropped around `focusX` (a number, or
 * [from, to] to pan across the segment). A header carries the series badge and
 * title; captions sit large at the bottom; a 3 s end card points to the full story.
 * Keep the total under ~58 s and open on the most surprising moment (the hook).
 */

import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  getStaticFiles,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SERIES } from "./brand";
import { LangProvider, useT, type Lang, type Localized } from "./lang";
import { clamp, easeInOut, easeOut } from "./motion";
import { C } from "./palette";
import { Sparkle } from "./Props";
import { Captions, Narration, STORY_FONT, useStoryFont } from "./StoryShell";
import { type StoryScene, localizeScene, sceneFrames } from "./timeline";

export const SHORT_WIDTH = 1080;
export const SHORT_HEIGHT = 1920;
export const SHORT_END_SECONDS = 3;

const HEADER = 250;
const FOOTER = 330;

export type ShortSegment = {
  /** Scene id to replay. */
  scene: string;
  /** Seconds into the scene to start / end (defaults: whole scene). */
  from?: number;
  to?: number;
  /** Scene-space x to centre on; [start, end] pans across the segment. Default 960. */
  focusX?: number | [number, number];
  /** When to pan, in seconds into the segment (default: across the whole segment). */
  panAt?: [number, number];
  /** Scale of the 1920×1080 scene inside the 1080-wide window. Default 1.25. */
  zoom?: number;
};

export type ShortSpec = {
  segments: ShortSegment[];
};

const segmentFrames = (seg: ShortSegment, scene: StoryScene, fps: number) => {
  const start = Math.round((seg.from ?? 0) * fps);
  const end = seg.to !== undefined ? Math.round(seg.to * fps) : sceneFrames(scene, fps);
  return { start, len: Math.max(1, end - start) };
};

export const shortDuration = (spec: ShortSpec, scenes: StoryScene[], fps: number) =>
  spec.segments.reduce((sum, seg) => {
    const scene = scenes.find((s) => s.id === seg.scene);
    if (!scene) throw new Error(`Short segment scene "${seg.scene}" not found`);
    return sum + segmentFrames(seg, scene, fps).len;
  }, 0) + Math.round(SHORT_END_SECONDS * fps);

const SceneWindow: React.FC<{ seg: ShortSegment; len: number; children: React.ReactNode }> = ({ seg, len, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = seg.zoom ?? 1.25;
  const [p0, p1] = seg.panAt ? [seg.panAt[0] * fps, seg.panAt[1] * fps] : [0, len];
  const focus = Array.isArray(seg.focusX)
    ? interpolate(frame, [p0, Math.max(p0 + 1, p1)], seg.focusX, { ...clamp, easing: easeInOut })
    : (seg.focusX ?? 960);
  const x = Math.min(0, Math.max(SHORT_WIDTH - 1920 * zoom, SHORT_WIDTH / 2 - focus * zoom));
  const height = 1080 * zoom;
  const top = HEADER + (SHORT_HEIGHT - HEADER - FOOTER - height) / 2;
  const veil = interpolate(frame, [0, 6, len - 6, len], [1, 0, 0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, top, width: SHORT_WIDTH, height, overflow: "hidden", borderRadius: 36 }}>
      <div style={{ position: "absolute", left: x, top: 0, width: 1920, height: 1080, scale: `${zoom}`, transformOrigin: "0 0" }}>
        {children}
      </div>
      <AbsoluteFill style={{ backgroundColor: C.cream, opacity: veil }} />
    </div>
  );
};

const Header: React.FC<{ title: Localized }> = ({ title }) => {
  const t = useT();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: SHORT_WIDTH,
        height: HEADER,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          background: C.pinkDark,
          color: "#fff",
          fontSize: 34,
          fontWeight: 700,
          padding: "6px 26px",
          borderRadius: 30,
          rotate: "-2deg",
        }}
      >
        {t(SERIES.name)}
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: C.ink,
          WebkitTextStroke: `10px ${C.cream}`,
          paintOrder: "stroke fill",
          textAlign: "center",
          lineHeight: 1.05,
          maxWidth: 1040,
          textWrap: "balance",
        }}
      >
        {t(title)}
      </div>
    </div>
  );
};

const EndCard: React.FC<{ Thumbnail: React.FC }> = ({ Thumbnail }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const pop = interpolate(frame, [0, 12], [0.7, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill style={{ backgroundColor: C.lavender, alignItems: "center", justifyContent: "center", gap: 50 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <Sparkle
          key={i}
          x={(i * 211 + 80) % 1080}
          y={((i * 337 + 120) % 1700) + 100}
          size={50}
          t={(frame - i * 3) / 7}
          color={[C.butterDark, C.pink, C.mint][i % 3]}
        />
      ))}
      <div style={{ fontSize: 76, fontWeight: 700, color: C.ink, textAlign: "center", maxWidth: 940, lineHeight: 1.1, scale: `${pop}` }}>
        {t({ en: "Watch the whole story!", es: "¡Mira el cuento completo!" })}
      </div>
      <div
        style={{
          width: 960,
          height: 540,
          borderRadius: 36,
          overflow: "hidden",
          boxShadow: "0 14px 0 rgba(94,75,110,0.16)",
          scale: `${pop}`,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", width: 1280, height: 720, scale: "0.75", transformOrigin: "0 0" }}>
          <Thumbnail />
        </div>
      </div>
      <div style={{ fontSize: 50, fontWeight: 600, color: C.ink }}>{t(SERIES.name)}</div>
    </AbsoluteFill>
  );
};

export type StoryShortProps<S extends StoryScene> = {
  scenes: S[];
  components: Record<string, React.FC<{ scene: S }>>;
  spec: ShortSpec;
  title: Localized;
  Thumbnail: React.FC;
  music: string | null;
  lang: Lang;
};

export function StoryShort<S extends StoryScene>({
  scenes: sourceScenes,
  components,
  spec,
  title,
  Thumbnail,
  music,
  lang,
}: StoryShortProps<S>) {
  useStoryFont();
  const { fps, durationInFrames } = useVideoConfig();
  const scenes = sourceScenes.map((s) => localizeScene(s, lang));
  const available = new Set(getStaticFiles().map((f) => f.name));
  const endLen = Math.round(SHORT_END_SECONDS * fps);
  let at = 0;
  const placed = spec.segments.map((seg) => {
    const scene = scenes.find((s) => s.id === seg.scene);
    if (!scene) throw new Error(`Short segment scene "${seg.scene}" not found`);
    const { start, len } = segmentFrames(seg, scene, fps);
    const p = { seg, scene, start, len, from: at };
    at += len;
    return p;
  });

  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ backgroundColor: C.sky, fontFamily: STORY_FONT }}>
        <Header title={title} />
        {placed.map(({ seg, scene, start, len, from }, i) => {
          const Comp = components[scene.id];
          return (
            <Sequence key={i} name={`Short ${i + 1} · ${scene.label}`} from={from} durationInFrames={len}>
              <SceneWindow seg={seg} len={len}>
                <Sequence from={-start} durationInFrames={sceneFrames(scene, fps)}>
                  <Comp scene={scene} />
                </Sequence>
              </SceneWindow>
              <Sequence from={-start} durationInFrames={sceneFrames(scene, fps)} layout="none">
                <Captions scene={scene} layout="portrait" />
                <Narration scene={scene} volume={1} />
              </Sequence>
            </Sequence>
          );
        })}
        <Sequence name="End card" from={at} durationInFrames={endLen}>
          <EndCard Thumbnail={Thumbnail} />
        </Sequence>
        {music && available.has(music) ? (
          <Sequence name="Music" layout="none">
            <Audio
              src={staticFile(music)}
              loop
              volume={(f) =>
                interpolate(f, [0, 15, durationInFrames - 30, durationInFrames], [0, 0.13, 0.13, 0], clamp)
              }
            />
          </Sequence>
        ) : null}
      </AbsoluteFill>
    </LangProvider>
  );
}
