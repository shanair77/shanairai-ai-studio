/**
 * Narration-driven timing for kids' stories.
 *
 * Every scene lasts `lead + voSeconds + tail`, and on-screen events are cued to
 * *phrases* in the spoken line (`cueFrame`), so re-recording a line only means
 * updating its `voSeconds`.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type StoryScene = {
  /** Unique within the story; picks the scene component. */
  id: string;
  /** Shown in the Studio timeline. */
  label: string;
  /** `public/`-relative narration clip. Played only if present in `public/`. */
  vo: string;
  /** Measured length of the narration clip, in seconds (ffprobe it). */
  voSeconds: number;
  /** Seconds of picture before the narration starts. */
  lead: number;
  /** Seconds of picture after the narration ends. */
  tail: number;
  /** On-screen storybook captions, in spoken order. Joined, they are the spoken line. */
  captions: string[];
  /** The spoken line when it differs from the captions (e.g. a title or moral card with no captions). */
  spoken?: string;
};

export const sceneFrames = (s: StoryScene, fps: number) => Math.round((s.lead + s.voSeconds + s.tail) * fps);

export const layoutScenes = <S extends StoryScene>(scenes: S[], fps: number) => {
  let from = 0;
  return scenes.map((scene) => {
    const durationInFrames = sceneFrames(scene, fps);
    const placed = { scene, from, durationInFrames };
    from += durationInFrames;
    return placed;
  });
};

export const totalFrames = (scenes: StoryScene[], fps: number) =>
  layoutScenes(scenes, fps).reduce((sum, s) => sum + s.durationInFrames, 0);

export const spokenText = (s: StoryScene) => s.spoken ?? s.captions.join(" ");

/**
 * Scene-local frame at which `phrase` is (approximately) spoken. Narration pace is
 * close enough to constant that character position ≈ time position.
 */
export const cueFrame = (s: StoryScene, phrase: string, fps: number): number => {
  const text = spokenText(s);
  const idx = text.indexOf(phrase);
  if (idx < 0) {
    throw new Error(`Cue "${phrase}" not found in scene "${s.id}"`);
  }
  return Math.round((s.lead + (idx / text.length) * s.voSeconds) * fps);
};
