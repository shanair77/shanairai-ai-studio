/**
 * Compilation — several stories back to back for long, TV-friendly viewing:
 * one series intro, each story (its own title card, narration and music), one outro.
 */

import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { INTRO_SECONDS, OUTRO_SECONDS, SeriesIntro, SeriesOutro } from "./brand";
import { LangProvider, type Lang } from "./lang";
import { C } from "./palette";
import { STORY_FONT, StoryShell, storyAudioDefaults, storyDuration, useStoryFont } from "./StoryShell";
import { type StoryScene, localizeScene } from "./timeline";

export type CompilationItem = {
  id: string;
  scenes: StoryScene[];
  components: Record<string, React.FC<{ scene: StoryScene }>>;
  music: string | null;
};

const itemFrames = (item: CompilationItem, fps: number, lang: Lang) =>
  storyDuration(item.scenes.map((s) => localizeScene(s, lang)), fps, false);

/** Frame offsets of each story (after the intro), for YouTube chapter timestamps. */
export const compilationLayout = (items: CompilationItem[], fps: number, lang: Lang) => {
  let at = Math.round(INTRO_SECONDS * fps);
  const starts = items.map((item) => {
    const from = at;
    at += itemFrames(item, fps, lang);
    return { id: item.id, from };
  });
  return { starts, total: at + Math.round(OUTRO_SECONDS * fps) };
};

export const Compilation: React.FC<{ items: CompilationItem[]; lang: Lang }> = ({ items, lang }) => {
  useStoryFont();
  const { fps } = useVideoConfig();
  const { starts } = compilationLayout(items, fps, lang);
  const introLen = Math.round(INTRO_SECONDS * fps);
  const last = starts.length ? starts[starts.length - 1].from + itemFrames(items[items.length - 1], fps, lang) : introLen;
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ backgroundColor: C.cream, fontFamily: STORY_FONT }}>
        <Sequence name="Series intro" durationInFrames={introLen}>
          <SeriesIntro />
        </Sequence>
        {items.map((item, i) => (
          <Sequence key={item.id} name={`${i + 1} · ${item.id}`} from={starts[i].from} durationInFrames={itemFrames(item, fps, lang)}>
            <StoryShell
              scenes={item.scenes}
              components={item.components}
              {...storyAudioDefaults(item.music)}
              lang={lang}
              branding={false}
            />
          </Sequence>
        ))}
        <Sequence name="Series outro" from={last} durationInFrames={Math.round(OUTRO_SECONDS * fps)}>
          <SeriesOutro />
        </Sequence>
      </AbsoluteFill>
    </LangProvider>
  );
};
