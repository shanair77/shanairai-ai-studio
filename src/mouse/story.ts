/**
 * The Country Mouse and the City Mouse — story data.
 *
 * The edit is driven by the narration: every scene lasts `lead + voSeconds + tail`,
 * and on-screen events are cued to *phrases* in the spoken line (see `cueFrame`),
 * so re-recording a line only means updating its `voSeconds`.
 */

import type { StoryScene } from "../kids/kit/timeline";

export { C } from "../kids/kit/palette";
export {
  FPS,
  HEIGHT,
  WIDTH,
  cueFrame,
  layoutScenes,
  totalFrames,
} from "../kids/kit/timeline";

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
    es: {
      vo: "mouse/es01.mp3",
      voSeconds: 3.32,
      captions: [],
      spoken: "El Ratón de Campo... y el Ratón de Ciudad.",
    },
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
    es: {
      vo: "mouse/es02.mp3",
      voSeconds: 14.29,
      captions: [
        "Había una vez, en una pradera verde y tranquila, un pequeño Ratón de Campo.",
        "Su casa era una madriguera acogedora bajo un viejo roble,",
        "y cada día mordisqueaba semillas, bayas dulces y maíz dorado.",
      ],
    },
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
    es: {
      vo: "mouse/es03.mp3",
      voSeconds: 18.91,
      captions: [
        "Una mañana soleada, su primo, el Ratón de Ciudad, vino de visita.",
        "El Ratón de Campo compartió toda su comida favorita.",
        "Pero el Ratón de Ciudad arrugó la nariz.",
        "«¿Semillas y bayas? ¡Ay, primo, tienes que venir a la ciudad! ¡Allí comemos como reyes!»",
      ],
    },
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
    es: {
      vo: "mouse/es04.mp3",
      voSeconds: 9.09,
      captions: [
        "Así que se fueron por el largo camino lleno de curvas,",
        "hasta que los campos se convirtieron en edificios altos y calles llenas de luces.",
      ],
    },
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
    es: {
      vo: "mouse/es05.mp3",
      voSeconds: 17.55,
      captions: [
        "El Ratón de Ciudad lo llevó a una casa elegante. Y sobre la mesa… ¡había un festín!",
        "Queso cremoso, pastel esponjoso y gelatina rosa que temblaba.",
        "«¡Oh!», dijo el Ratón de Campo. «¡Nunca había visto tanta comida!»",
      ],
    },
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
    es: {
      vo: "mouse/es06.mp3",
      voSeconds: 16.43,
      captions: [
        "Pero justo cuando dieron el primer mordisco… la puerta se abrió despacito.",
        "¡Entró un gato grande y hambriento!",
        "«¡Corre!», chilló el Ratón de Ciudad.",
        "Los dos ratoncitos corrieron a un agujerito en la pared, con el corazón haciendo pum, pum, pum.",
      ],
    },
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
    es: {
      vo: "mouse/es07.mp3",
      voSeconds: 13.71,
      captions: [
        "Salieron de puntillas para intentarlo otra vez… cuando, ¡GUAU! ¡GUAU!",
        "¡Entró saltando un perro enorme!",
        "Volvieron corriendo al agujero, temblando desde las orejas hasta la punta de la cola.",
      ],
    },
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
    es: {
      vo: "mouse/es08.mp3",
      voSeconds: 14.6,
      captions: [
        "El Ratón de Campo respiró hondo.",
        "«Gracias, primo», dijo, «pero me voy a casa.",
        "Prefiero comer semillas sencillas en paz, que pastel elegante con miedo.»",
        "Y volvió a su pradera tranquila, feliz y a salvo.",
      ],
    },
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
    es: {
      vo: "mouse/es09.mp3",
      voSeconds: 9.8,
      captions: [],
      spoken:
        "Y la moraleja del cuento es: una vida sencilla, con paz y seguridad, es mejor que una vida elegante llena de preocupaciones. ¡Fin!",
    },
  },
];

export const getScene = (id: SceneId): Scene => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};
