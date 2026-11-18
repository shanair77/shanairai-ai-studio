/**
 * The Country Mouse and the City Mouse — story data.
 *
 * The edit is driven by the narration: every scene lasts `lead + voSeconds + tail`,
 * and on-screen events are cued to *phrases* in the spoken line (see `cueFrame`),
 * so re-recording a line only means updating its `voSeconds`.
 */

import type { StoryScene } from "../kids/kit/timeline";

export { C } from "../kids/kit/palette";
export { FPS, HEIGHT, WIDTH, cueFrame, layoutScenes, totalFrames } from "../kids/kit/timeline";

export type SceneId =
  | "title"
  | "meadow"
  | "visit"
  | "journey"
  | "feast"
  | "cat"
  | "dog"
  | "home"
  | "moral";

export type Scene = StoryScene & { id: SceneId };

/** Spoken text of the moral scene (shown as a card, not as captions). */
export const MORAL_SPOKEN =
  "And the moral of the story is: a simple life, with peace and safety, is better than a fancy life full of worry. The end!";

export const SCENES: Scene[] = [
  {
    id: "title",
    label: "Title",
    vo: "mouse/vo01.mp3",
    voSeconds: 2.85,
    lead: 1.6,
    tail: 1.6,
    captions: [],
  },
  {
    id: "meadow",
    label: "The meadow",
    vo: "mouse/vo02.mp3",
    voSeconds: 13.79,
    lead: 0.6,
    tail: 1.0,
    captions: [
      "Once upon a time, in a quiet green meadow, there lived a little Country Mouse.",
      "Her home was a cozy burrow under an old oak tree,",
      "and every day she nibbled on seeds, sweet berries, and golden corn.",
    ],
  },
  {
    id: "visit",
    label: "Cousin visits",
    vo: "mouse/vo03.mp3",
    voSeconds: 17.08,
    lead: 0.5,
    tail: 1.0,
    captions: [
      "One sunny morning, her cousin, the City Mouse, came to visit.",
      "Country Mouse shared all of her favorite food.",
      "But City Mouse wrinkled up her nose.",
      "“Seeds and berries? Oh, cousin, you must come to the city! There, we eat like kings!”",
    ],
  },
  {
    id: "journey",
    label: "The journey",
    vo: "mouse/vo04.mp3",
    voSeconds: 8.52,
    lead: 0.5,
    tail: 1.4,
    captions: [
      "So off they went, down the long and winding road,",
      "until the fields turned into tall buildings and busy, bright streets.",
    ],
  },
  {
    id: "feast",
    label: "The feast",
    vo: "mouse/vo05.mp3",
    voSeconds: 16.04,
    lead: 0.5,
    tail: 1.0,
    captions: [
      "City Mouse led her into a grand house. And on the table… was a feast!",
      "Creamy cheese, fluffy cake, and wobbly pink jelly.",
      "“Oh my!” said Country Mouse. “I have never seen so much food!”",
    ],
  },
  {
    id: "cat",
    label: "The cat",
    vo: "mouse/vo06.mp3",
    voSeconds: 16.27,
    lead: 0.4,
    tail: 1.0,
    captions: [
      "But just as they took their very first bite… the door creaked open.",
      "In crept a big, hungry cat!",
      "“Run!” squeaked City Mouse.",
      "The two little mice scurried into a tiny hole in the wall, their hearts going thump, thump, thump.",
    ],
  },
  {
    id: "dog",
    label: "The dog",
    vo: "mouse/vo07.mp3",
    voSeconds: 12.36,
    lead: 0.4,
    tail: 1.0,
    captions: [
      "They tiptoed out to try again… when, WOOF! WOOF!",
      "A great big dog came bounding in!",
      "Back into the hole they dashed, shaking from their ears to the tips of their tails.",
    ],
  },
  {
    id: "home",
    label: "Going home",
    vo: "mouse/vo08.mp3",
    voSeconds: 15.31,
    lead: 0.6,
    tail: 1.4,
    captions: [
      "Country Mouse took a deep breath.",
      "“Thank you, cousin,” she said, “but I am going home.",
      "I would rather eat simple seeds in peace, than fancy cake in fear.”",
      "And back to her quiet meadow she went, happy and safe.",
    ],
  },
  {
    id: "moral",
    label: "The moral",
    vo: "mouse/vo09.mp3",
    voSeconds: 9.25,
    lead: 0.6,
    tail: 2.6,
    captions: [],
    spoken: MORAL_SPOKEN,
  },
];

export const getScene = (id: SceneId): Scene => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};
