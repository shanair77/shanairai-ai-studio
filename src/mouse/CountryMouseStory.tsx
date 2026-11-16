/**
 * CountryMouseStory — a faceless, narrated kids' story video (1920×1080, ~2 min)
 * in a pastel flat 2D style: "The Country Mouse and the City Mouse".
 *
 * Layers (bottom → top):
 *   1. Scenes: one <Sequence> per story beat, each dipping to cream at its edges.
 *   2. Storybook captions, timed to the narration.
 *   3. Narration: `public/mouse/vo0N.mp3`, one clip per scene, offset by the scene lead.
 *      A clip that is missing from `public/` is skipped, so the video still renders silent.
 *   4. Optional music bed under the whole piece.
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
  continueRender,
  delayRender,
  type CalculateMetadataFunction,
} from "remotion";
import {
  CatScene,
  DogScene,
  FeastScene,
  HomeScene,
  JourneyScene,
  MeadowScene,
  MoralScene,
  TitleScene,
  VisitScene,
} from "./Scenes";
import { C, FPS, SCENES, type Scene, type SceneId, cueFrame, layoutScenes, totalFrames } from "./story";

/**
 * Fredoka (SIL OFL) is self-hosted in `public/mouse/fonts/` rather than pulled from
 * Google Fonts, so the story renders offline and behind strict proxies.
 */
const fontFamily = "Fredoka";
if (typeof document !== "undefined") {
  const handle = delayRender("Loading Fredoka");
  const face = new FontFace(fontFamily, `url(${staticFile("mouse/fonts/Fredoka-latin.woff2")}) format("woff2")`, {
    weight: "300 700",
  });
  face
    .load()
    .then((f) => document.fonts.add(f))
    .catch((err) => console.error("Fredoka failed to load", err))
    .finally(() => continueRender(handle));
}

export { FPS, HEIGHT, WIDTH } from "./story";

export type CountryMouseStoryProps = {
  showCaptions: boolean;
  narrationVolume: number;
  /** `public/`-relative music file, or null for none. */
  music: string | null;
  musicVolume: number;
};

export const defaultCountryMouseStoryProps: CountryMouseStoryProps = {
  showCaptions: true,
  narrationVolume: 1,
  music: null,
  musicVolume: 0.12,
};

export const calculateCountryMouseStoryMetadata: CalculateMetadataFunction<CountryMouseStoryProps> = () => ({
  durationInFrames: totalFrames(SCENES, FPS),
});

const SCENE_COMPONENTS: Record<SceneId, React.FC<{ scene: Scene }>> = {
  title: TitleScene,
  meadow: MeadowScene,
  visit: VisitScene,
  journey: JourneyScene,
  feast: FeastScene,
  cat: CatScene,
  dog: DogScene,
  home: HomeScene,
  moral: MoralScene,
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

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

const Captions: React.FC<{ scene: Scene }> = ({ scene }) => {
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

export const CountryMouseStory: React.FC<CountryMouseStoryProps> = ({
  showCaptions,
  narrationVolume,
  music,
  musicVolume,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const timeline = layoutScenes(SCENES, fps);
  const available = new Set(getStaticFiles().map((f) => f.name));

  return (
    <AbsoluteFill style={{ backgroundColor: C.cream, fontFamily }}>
      {timeline.map(({ scene, from, durationInFrames: len }, i) => {
        const Comp = SCENE_COMPONENTS[scene.id];
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
      {music ? (
        <Audio
          src={staticFile(music)}
          loop
          volume={(f) =>
            interpolate(f, [0, fps, durationInFrames - 2 * fps, durationInFrames], [0, musicVolume, musicVolume, 0], clamp)
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
