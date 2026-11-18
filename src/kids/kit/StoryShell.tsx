/**
 * StoryShell — everything a narrated kids' story shares except its pictures.
 *
 * Layers (bottom → top):
 *   0. Series intro sting and outro card (`branding`), around the story.
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
import { INTRO_SECONDS, OUTRO_SECONDS, SeriesIntro, SeriesOutro } from "./brand";
import { LangProvider, type Lang } from "./lang";
import { clamp } from "./motion";
import { C } from "./palette";
import { type StoryScene, captionStarts, layoutScenes, localizeScene, totalFrames } from "./timeline";

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
  /** Narration, captions and on-screen text language. */
  lang: Lang;
  /** Series intro sting before the story and outro card after it. */
  branding: boolean;
};

export const storyAudioDefaults = (music: string | null): StoryAudioProps => ({
  showCaptions: true,
  narrationVolume: 1,
  music,
  musicVolume: 0.32,
  musicDuck: 0.4,
  lang: "en",
  branding: true,
});

/** Total frames of a story video, including the series intro/outro when branded. */
export const storyDuration = (scenes: StoryScene[], fps: number, branding: boolean) =>
  totalFrames(scenes, fps) + (branding ? Math.round((INTRO_SECONDS + OUTRO_SECONDS) * fps) : 0);

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

/** Storybook captions for one scene, timed to its narration. */
export const Captions: React.FC<{ scene: StoryScene; layout?: "landscape" | "portrait" }> = ({
  scene,
  layout = "landscape",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const chunks = scene.displayCaptions ?? scene.captions;
  if (chunks.length === 0) return null;
  const starts = captionStarts(scene, fps);
  const ends = starts.map((_, i) => (i + 1 < starts.length ? starts[i + 1] : durationInFrames - 8));
  const portrait = layout === "portrait";
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
      {chunks.map((text, i) => {
        if (frame < starts[i] || frame >= ends[i]) return null;
        const local = frame - starts[i];
        const len = ends[i] - starts[i];
        const opacity = interpolate(local, [0, 6, len - 5, len], [0, 1, 1, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: portrait ? 70 : 46,
              maxWidth: portrait ? 980 : 1560,
              padding: portrait ? "26px 40px" : "20px 44px",
              background: "rgba(255,248,238,0.94)",
              borderRadius: 40,
              boxShadow: "0 8px 0 rgba(94,75,110,0.12)",
              color: C.ink,
              fontSize: portrait ? 58 : 46,
              fontWeight: 600,
              lineHeight: 1.22,
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

/** Narration for one scene, starting after its lead. Skipped if the file is missing. */
export const Narration: React.FC<{ scene: StoryScene; volume: number }> = ({ scene, volume }) => {
  const { fps } = useVideoConfig();
  const available = new Set(getStaticFiles().map((f) => f.name));
  if (!available.has(scene.vo)) return null;
  return (
    <Sequence name={`Narration · ${scene.label}`} from={Math.round(scene.lead * fps)} layout="none">
      <Audio src={staticFile(scene.vo)} volume={volume} />
    </Sequence>
  );
};

export type StoryShellProps<S extends StoryScene> = StoryAudioProps & {
  scenes: S[];
  /** One component per scene id. */
  components: Record<string, React.FC<{ scene: S }>>;
};

export function StoryShell<S extends StoryScene>({
  scenes: sourceScenes,
  components,
  showCaptions,
  narrationVolume,
  music,
  musicVolume,
  musicDuck,
  lang = "en",
  branding = true,
}: StoryShellProps<S>) {
  useStoryFont();
  const { fps } = useVideoConfig();
  const scenes = sourceScenes.map((s) => localizeScene(s, lang));
  const timeline = layoutScenes(scenes, fps);
  const storyLen = totalFrames(scenes, fps);
  const introLen = branding ? Math.round(INTRO_SECONDS * fps) : 0;
  const outroLen = branding ? Math.round(OUTRO_SECONDS * fps) : 0;
  const available = new Set(getStaticFiles().map((f) => f.name));
  // Story-relative frame ranges where narration plays, so the music can dip under the voice.
  const speech = timeline
    .filter(({ scene }) => available.has(scene.vo))
    .map(({ scene, from }) => {
      const start = from + Math.round(scene.lead * fps);
      return [start, start + Math.round(scene.voSeconds * fps)] as const;
    });
  const musicLen = storyLen + outroLen;
  const musicLevel = (f: number) => {
    const ducking = speech.reduce(
      (m, [s, e]) => Math.max(m, interpolate(f, [s - 10, s, e, e + 15], [0, 1, 1, 0], clamp)),
      0,
    );
    const edges = interpolate(f, [0, fps, musicLen - 2 * fps, musicLen], [0, 1, 1, 0], clamp);
    return musicVolume * edges * (1 - ducking * (1 - musicDuck));
  };

  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ backgroundColor: C.cream, fontFamily: STORY_FONT }}>
        {branding ? (
          <Sequence name="Series intro" durationInFrames={introLen}>
            <SeriesIntro />
          </Sequence>
        ) : null}
        <Sequence name="Story" from={introLen} durationInFrames={storyLen}>
          {timeline.map(({ scene, from, durationInFrames: len }, i) => {
            const Comp = components[scene.id];
            if (!Comp) throw new Error(`No component for scene "${scene.id}"`);
            return (
              <Sequence key={scene.id} name={`${i + 1} · ${scene.label}`} from={from} durationInFrames={len}>
                <PageTurn first={i === 0 && !branding} last={i === timeline.length - 1 && !branding}>
                  <Comp scene={scene} />
                </PageTurn>
                {showCaptions ? (
                  <Sequence name={`Captions · ${scene.label}`} layout="none">
                    <Captions scene={scene} />
                  </Sequence>
                ) : null}
                <Narration scene={scene} volume={narrationVolume} />
              </Sequence>
            );
          })}
        </Sequence>
        {branding ? (
          <Sequence name="Series outro" from={introLen + storyLen} durationInFrames={outroLen}>
            <SeriesOutro />
          </Sequence>
        ) : null}
        {music && available.has(music) ? (
          <Sequence name="Music" from={introLen} durationInFrames={musicLen} layout="none">
            <Audio src={staticFile(music)} loop volume={musicLevel} />
          </Sequence>
        ) : null}
      </AbsoluteFill>
    </LangProvider>
  );
}
