import React from "react";
import { Composition, Still } from "remotion";
import { FPS, HEIGHT, THUMB_HEIGHT, THUMB_WIDTH, WIDTH, totalFrames } from "./kit";
import { STORIES } from "./registry";

/** Registers every kids' story video and its YouTube thumbnail. */
export const KidsCompositions: React.FC = () => (
  <>
    {STORIES.map((story) => (
      <React.Fragment key={story.id}>
        <Composition
          id={story.id}
          component={story.component}
          durationInFrames={totalFrames(story.scenes, FPS)}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          defaultProps={story.defaultProps}
        />
        <Still id={`${story.id}Thumbnail`} component={story.Thumbnail} width={THUMB_WIDTH} height={THUMB_HEIGHT} />
      </React.Fragment>
    ))}
  </>
);
