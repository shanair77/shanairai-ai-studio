/**
 * StoryShell — everything a narrated kids' story shares except its pictures.
 *
 * Layers (bottom → top):
 *   1. Scenes: one <Sequence> per story beat, each dipping to cream at its edges (page turn).
 *   2. Storybook captions, timed to the narration.
 *   3. Narration: one clip per scene, offset by the scene lead. A clip missing from
 *      `public/` is skipped, so a story still renders (silently) before its VO exists.
 *   4. Music bed, ducked under the narrator, with fades at both ends.
 */

import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  continueRender,
  delayRender,
  getStaticFiles,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp } from "./motion";
import { C } from "./palette";
import { type StoryScene, cueFrame, layoutScenes } from "./timeline";

/** Fredoka (SIL OFL), self-hosted so stories render offline and behind strict proxies. */
export const STORY_FONT = "Fredoka";

/** Loads the font once per tab, holding the render until it is ready. */
export const useStoryFont = () => {
  const [handle] = React.useState(() => delayRender("Loading Fredoka", { timeoutInMilliseconds: 60000 }));
  React.useEffect(() => {
    const face = new FontFace(STORY_FONT, `url(${staticFile("kids/fonts/Fredoka-latin.woff2")}) format("woff2")`, {
      weight: "300 700",
    });
    face
      .load()
      .then((f) => document.fonts.add(f))
      .catch((err) => console.error("Fredoka failed to load", err))
      .finally(() => continueRender(handle));
  }, [handle]);
};

/** Props every story composition exposes in the Studio. */
export type StoryAudioProps = {
  showCaptions: boolean;
  narrationVolume: number;
  /** `public/`-relative music file, or null for none. */
  music: string | null;
  /** Music level when nobody is speaking. */
  musicVolume: number;
  /** Fraction of `musicVolume` kept while the narrator speaks (ducking). */
  musicDuck: number;
};

export const storyAudioDefaults = (music: string | null): StoryAudioProps => ({
  showCaptions: true,
  narrationVolume: 1,
  music,
  musicVolume: 0.32,
  musicDuck: 0.4,
});

/** Dips each scene in from / out to cream so cuts feel like turning a page. */
const PageTurn: React.FC<{ children: React.ReactNode; first: boolean; last: boolean }> = ({ children, first, last }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeIn = first ? 1 : 10;
  const fadeOut = last ? 30 : 10;
  const veil = interpolate(frame, [0, fadeIn, durationInFrames - fadeOut, durationInFrames], [1, 0, 0, 1], clamp);
  return (
    <AbsoluteFill>
      {children}
      <AbsoluteFill style={{ backgroundColor: C.cream, opacity: veil }} />
    </AbsoluteFill>
  );
};

const Captions: React.FC<{ scene: StoryScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  if (scene.captions.length === 0) return null;
  const starts = scene.captions.map((c, i) => (i === 0 ? 0 : cueFrame(scene, c, fps)));
  const ends = starts.map((_, i) => (i + 1 < starts.length ? starts[i + 1] : durationInFrames - 8));
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 46 }}>
      {scene.captions.map((text, i) => {
        if (frame < starts[i] || frame >= ends[i]) return null;
        const local = frame - starts[i];
        const len = ends[i] - starts[i];
        const opacity = interpolate(local, [0, 6, len - 5, len], [0, 1, 1, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 46,
              maxWidth: 1560,
              padding: "20px 44px",
              background: "rgba(255,248,238,0.94)",
              borderRadius: 40,
              boxShadow: "0 8px 0 rgba(94,75,110,0.12)",
              color: C.ink,
              fontSize: 46,
              fontWeight: 600,
              lineHeight: 1.25,
              textAlign: "center",
              opacity,
              translate: `0px ${interpolate(local, [0, 8], [16, 0], clamp)}px`,
            }}
          >
            {text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export type StoryShellProps<S extends StoryScene> = StoryAudioProps & {
  scenes: S[];
  /** One component per scene id. */
  components: Record<string, React.FC<{ scene: S }>>;
};

export function StoryShell<S extends StoryScene>({
  scenes,
  components,
  showCaptions,
  narrationVolume,
  music,
  musicVolume,
  musicDuck,
}: StoryShellProps<S>) {
  useStoryFont();
  const { fps, durationInFrames } = useVideoConfig();
  const timeline = layoutScenes(scenes, fps);
  const available = new Set(getStaticFiles().map((f) => f.name));
  // Global frame ranges where narration plays, so the music can dip under the voice.
  const speech = timeline
    .filter(({ scene }) => available.has(scene.vo))
    .map(({ scene, from }) => {
      const start = from + Math.round(scene.lead * fps);
      return [start, start + Math.round(scene.voSeconds * fps)] as const;
    });
  const musicLevel = (f: number) => {
    const ducking = speech.reduce(
      (m, [s, e]) => Math.max(m, interpolate(f, [s - 10, s, e, e + 15], [0, 1, 1, 0], clamp)),
      0,
    );
    const edges = interpolate(f, [0, fps, durationInFrames - 2 * fps, durationInFrames], [0, 1, 1, 0], clamp);
    return musicVolume * edges * (1 - ducking * (1 - musicDuck));
  };

  return (
    <AbsoluteFill style={{ backgroundColor: C.cream, fontFamily: STORY_FONT }}>
      {timeline.map(({ scene, from, durationInFrames: len }, i) => {
        const Comp = components[scene.id];
        if (!Comp) throw new Error(`No component for scene "${scene.id}"`);
        return (
          <Sequence key={scene.id} name={`${i + 1} · ${scene.label}`} from={from} durationInFrames={len}>
            <PageTurn first={i === 0} last={i === timeline.length - 1}>
              <Comp scene={scene} />
            </PageTurn>
            {showCaptions ? (
              <Sequence name={`Captions · ${scene.label}`} layout="none">
                <Captions scene={scene} />
              </Sequence>
            ) : null}
            {available.has(scene.vo) ? (
              <Sequence name={`Narration · ${scene.label}`} from={Math.round(scene.lead * fps)} layout="none">
                <Audio src={staticFile(scene.vo)} volume={narrationVolume} />
              </Sequence>
            ) : null}
          </Sequence>
        );
      })}
      {music && available.has(music) ? (
        <Sequence name="Music" layout="none">
          <Audio src={staticFile(music)} loop volume={musicLevel} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
}
