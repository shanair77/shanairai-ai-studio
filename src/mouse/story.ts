/**
 * The Country Mouse and the City Mouse — story data.
 *
 * The edit is driven by the narration: every scene lasts `lead + voSeconds + tail`,
 * and on-screen events are cued to *phrases* in the spoken line (see `cueFrame`),
 * so re-recording a line only means updating its `voSeconds`.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Pastel flat palette shared by every scene. */
export const C = {
  ink: "#5E4B6E",
  cream: "#FFF8EE",
  sky: "#CDEBF7",
  skyWarm: "#FFE3D3",
  cloud: "#FFFFFF",
  sun: "#FFE9A8",
  grass: "#BDE6C4",
  grassDark: "#9DD6AA",
  hill: "#D3EFC9",
  trunk: "#D9B99B",
  trunkDark: "#C39E7E",
  leaf: "#A8DDB5",
  leafDark: "#8FCFA0",
  pink: "#F8C8DC",
  pinkDark: "#EFA3C0",
  peach: "#FFD8C2",
  lavender: "#D9CCF2",
  lavenderDark: "#BFAEE6",
  butter: "#FFF1B8",
  butterDark: "#FBDD7E",
  mint: "#C8F0E4",
  blue: "#BCD8F5",
  // characters
  countryFur: "#E8CFB4",
  countryBelly: "#F7E9DA",
  cityFur: "#C9C3DE",
  cityBelly: "#EDE9F7",
  catFur: "#B9B3CF",
  dogFur: "#E9C29F",
};

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

export type Scene = {
  id: SceneId;
  label: string;
  /** `public/`-relative narration file. Played only if present in `public/`. */
  vo: string;
  /** Measured length of the narration clip, in seconds. */
  voSeconds: number;
  /** Seconds of picture before the narration starts. */
  lead: number;
  /** Seconds of picture after the narration ends. */
  tail: number;
  /** On-screen storybook captions, in spoken order. Joined, they are the spoken line. */
  captions: string[];
};

export const SCENES: Scene[] = [
  {
    id: "title",
    label: "Title",
    vo: "mouse/vo01.mp3",
    voSeconds: 2.8,
    lead: 1.6,
    tail: 1.6,
    captions: [],
  },
  {
    id: "meadow",
    label: "The meadow",
    vo: "mouse/vo02.mp3",
    voSeconds: 13.76,
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
    voSeconds: 17.04,
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
    voSeconds: 8.48,
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
    voSeconds: 16.0,
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
    voSeconds: 16.24,
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
    voSeconds: 12.32,
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
    voSeconds: 15.28,
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
    voSeconds: 9.2,
    lead: 0.6,
    tail: 2.6,
    captions: [],
  },
];

/** Spoken text of the moral scene (shown as a card, not as captions). */
export const MORAL_SPOKEN =
  "And the moral of the story is: a simple life, with peace and safety, is better than a fancy life full of worry. The end!";

export const sceneFrames = (s: Scene, fps: number) =>
  Math.round((s.lead + s.voSeconds + s.tail) * fps);

export const layoutScenes = (scenes: Scene[], fps: number) => {
  let from = 0;
  return scenes.map((scene) => {
    const durationInFrames = sceneFrames(scene, fps);
    const placed = { scene, from, durationInFrames };
    from += durationInFrames;
    return placed;
  });
};

export const totalFrames = (scenes: Scene[], fps: number) =>
  layoutScenes(scenes, fps).reduce((sum, s) => sum + s.durationInFrames, 0);

const spokenText = (s: Scene) =>
  s.id === "moral" ? MORAL_SPOKEN : s.captions.join(" ");

/**
 * Scene-local frame at which `phrase` is (approximately) spoken. Narration pace is
 * close enough to constant that character position ≈ time position.
 */
export const cueFrame = (s: Scene, phrase: string, fps: number): number => {
  const text = spokenText(s);
  const idx = text.indexOf(phrase);
  if (idx < 0) {
    throw new Error(`Cue "${phrase}" not found in scene "${s.id}"`);
  }
  return Math.round((s.lead + (idx / text.length) * s.voSeconds) * fps);
};

export const getScene = (id: SceneId): Scene => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};
