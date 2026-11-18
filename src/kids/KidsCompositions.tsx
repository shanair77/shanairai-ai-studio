/**
 * Registers every kids' story format:
 *   <Id>            the story (16:9), with series intro/outro      <Id>Es           in Spanish
 *   <Id>Thumbnail   YouTube thumbnail (1280×720)                    <Id>ThumbnailEs  in Spanish
 *   <Id>Short       vertical Short cut from the story (1080×1920)   <Id>ShortEs      in Spanish
 *   <CompId>        compilation of several stories                  <CompId>Es       in Spanish
 * Spanish variants exist only when every scene of the story has an `es` block.
 */

import React from "react";
import { Composition, Still, type CalculateMetadataFunction } from "remotion";
import {
  Compilation,
  FPS,
  HEIGHT,
  LangProvider,
  SHORT_HEIGHT,
  SHORT_WIDTH,
  StoryShort,
  THUMB_HEIGHT,
  THUMB_WIDTH,
  WIDTH,
  compilationLayout,
  localizeScene,
  shortDuration,
  storyDuration,
  type CompilationItem,
  type Lang,
  type StoryAudioProps,
} from "./kit";
import { STORIES, type KidsStory } from "./registry";
import { COMPILATIONS, PACKAGING } from "./series";

const getStory = (id: string): KidsStory => {
  const s = STORIES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown story ${id}`);
  return s;
};

const hasSpanish = (story: KidsStory) => story.scenes.every((s) => s.es);

const storyMetadata =
  (story: KidsStory): CalculateMetadataFunction<StoryAudioProps> =>
  ({ props }) => ({
    durationInFrames: storyDuration(
      story.scenes.map((s) => localizeScene(s, props.lang)),
      FPS,
      props.branding,
    ),
  });

type ShortProps = { storyId: string; lang: Lang };

const ShortVideo: React.FC<ShortProps> = ({ storyId, lang }) => {
  const story = getStory(storyId);
  const pack = PACKAGING[storyId];
  return (
    <StoryShort
      scenes={story.scenes}
      components={pack.components}
      spec={pack.short}
      title={pack.title}
      Thumbnail={story.Thumbnail}
      music={pack.music}
      lang={lang}
    />
  );
};

const shortMetadata: CalculateMetadataFunction<ShortProps> = ({ props }) => {
  const story = getStory(props.storyId);
  const scenes = story.scenes.map((s) => localizeScene(s, props.lang));
  return { durationInFrames: shortDuration(PACKAGING[props.storyId].short, scenes, FPS) };
};

type CompilationProps = { compilationId: string; lang: Lang };

const compilationItems = (compilationId: string): CompilationItem[] => {
  const spec = COMPILATIONS.find((c) => c.id === compilationId);
  if (!spec) throw new Error(`Unknown compilation ${compilationId}`);
  return spec.storyIds.map((id) => ({
    id,
    scenes: getStory(id).scenes,
    components: PACKAGING[id].components,
    music: PACKAGING[id].music,
  }));
};

const CompilationVideo: React.FC<CompilationProps> = ({ compilationId, lang }) => (
  <Compilation items={compilationItems(compilationId)} lang={lang} />
);

const compilationMetadata: CalculateMetadataFunction<CompilationProps> = ({ props }) => ({
  durationInFrames: compilationLayout(compilationItems(props.compilationId), FPS, props.lang).total,
});

const withLang = (Thumb: React.FC, lang: Lang): React.FC => {
  const Localized: React.FC = () => (
    <LangProvider lang={lang}>
      <Thumb />
    </LangProvider>
  );
  return Localized;
};

export const KidsCompositions: React.FC = () => (
  <>
    {STORIES.map((story) => {
      const langs: Lang[] = hasSpanish(story) ? ["en", "es"] : ["en"];
      const pack = PACKAGING[story.id];
      return (
        <React.Fragment key={story.id}>
          {langs.map((lang) => {
            const suffix = lang === "en" ? "" : "Es";
            return (
              <React.Fragment key={lang}>
                <Composition
                  id={`${story.id}${suffix}`}
                  component={story.component}
                  durationInFrames={storyDuration(story.scenes, FPS, true)}
                  fps={FPS}
                  width={WIDTH}
                  height={HEIGHT}
                  defaultProps={{ ...story.defaultProps, lang }}
                  calculateMetadata={storyMetadata(story)}
                />
                <Still
                  id={`${story.id}Thumbnail${suffix}`}
                  component={withLang(story.Thumbnail, lang)}
                  width={THUMB_WIDTH}
                  height={THUMB_HEIGHT}
                />
                {pack ? (
                  <Composition
                    id={`${story.id}Short${suffix}`}
                    component={ShortVideo}
                    durationInFrames={30 * FPS}
                    fps={FPS}
                    width={SHORT_WIDTH}
                    height={SHORT_HEIGHT}
                    defaultProps={{ storyId: story.id, lang }}
                    calculateMetadata={shortMetadata}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      );
    })}
    {COMPILATIONS.map((comp) => {
      const spanish = comp.storyIds.every((id) => hasSpanish(getStory(id)));
      return (["en", "es"] as Lang[])
        .filter((lang) => lang === "en" || spanish)
        .map((lang) => (
          <Composition
            key={`${comp.id}-${lang}`}
            id={`${comp.id}${lang === "en" ? "" : "Es"}`}
            component={CompilationVideo}
            durationInFrames={60 * FPS}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={{ compilationId: comp.id, lang }}
            calculateMetadata={compilationMetadata}
          />
        ));
    })}
  </>
);
