/**
 * The Boy Who Cried Wolf (Aesop), 2026 spin: Toby, a young bear cub, minds the sheep on a
 * green hill above a little village. The villagers give him a walkie-talkie whose button
 * beeps every phone in the village. He plays the "Wolf!" trick twice (they zoom up on bikes
 * and scooters); when a real wolf comes, nobody believes him. Gentle: the sheep scatter and
 * the wolf gives up and slinks off (nobody is hurt); Toby says sorry, and the villagers use
 * the sheep's little tracker collars to find every one of them.
 */

import type { StoryScene } from "../../kit";

export type SceneId = "title" | "hill" | "bored" | "trick1" | "trick2" | "realWolf" | "nobody" | "sorry" | "moral";

export type Scene = StoryScene & { id: SceneId };

/** What the narrator is asked to say (with ElevenLabs v4 tags), per scene. */
export const NARRATION: Record<SceneId, { en: string; es: string }> = {
  title: { en: "[warmly] The Boy Who Cried Wolf.", es: "[warmly] El Pastorcito Mentiroso." },
  hill: {
    en: '[warmly] Once upon a time, on a green hill above a little village, a young bear cub named Toby looked after the sheep. The villagers gave him a shiny walkie-talkie. [kindly] "If a wolf ever comes, just press the button, and we\'ll all come running!"',
    es: "[warmly] Había una vez, en una colina verde sobre un pueblito, un osito llamado Toby que cuidaba las ovejas. Los vecinos le dieron un walkie-talkie brillante. [kindly] «Si alguna vez viene un lobo, aprieta el botón, ¡y todos vendremos corriendo!»",
  },
  bored: {
    en: 'But watching sheep was slow. Toby counted clouds. He counted sheep. [yawns] Then he counted the sheep again. [mischievously] "This is boring. I know a funny trick!"',
    es: "Pero cuidar ovejas era muy lento. Toby contó las nubes. Contó las ovejas. [yawns] Y luego volvió a contar las ovejas. [mischievously] «Qué aburrido. ¡Ya sé un truco divertido!»",
  },
  trick1: {
    en: 'Toby pressed the big button. [shouting] "Wolf! Wolf! A wolf is chasing the sheep!" Down in the village, every phone went beep, beep, beep! Everyone zoomed up the hill on bikes and scooters... but there was no wolf at all. [giggles] "Ha ha! Just joking!"',
    es: "Toby apretó el botón grande. [shouting] «¡El lobo! ¡El lobo! ¡Un lobo persigue a las ovejas!» Abajo en el pueblo, todos los teléfonos hicieron ¡bip, bip, bip! Todos subieron la colina a toda prisa en bicicletas y patinetas... pero no había ningún lobo. [giggles] «¡Ja, ja! ¡Era una broma!»",
  },
  trick2: {
    en: 'The villagers frowned. [sternly] "That wasn\'t funny, Toby." But the very next day, he did it again. [shouting] "Wolf! Wolf!" Up they all puffed and panted... and once again, there was no wolf. [sighs] The villagers shook their heads and walked slowly home.',
    es: "Los vecinos fruncieron el ceño. [sternly] «Eso no fue gracioso, Toby.» Pero al día siguiente, lo hizo otra vez. [shouting] «¡El lobo! ¡El lobo!» Todos subieron resoplando y jadeando... y otra vez, no había ningún lobo. [sighs] Los vecinos movieron la cabeza y volvieron despacito a casa.",
  },
  realWolf: {
    en: 'Then one evening, something rustled in the long grass. Two pointy ears... a bushy grey tail... [whispering] It was a real wolf! [shouting] "Wolf! Wolf! Please come, it\'s real this time!"',
    es: "Entonces, una tarde, algo se movió entre la hierba alta. Dos orejas puntiagudas... una cola gris y peluda... [whispering] ¡Era un lobo de verdad! [shouting] «¡El lobo! ¡El lobo! ¡Por favor, vengan, esta vez es verdad!»",
  },
  nobody: {
    en: 'Down in the village, the phones went beep, beep, beep. But everyone said, [tiredly] "Oh, it\'s just Toby, joking again." And nobody came. [gasps] The sheep scattered all over the hills, until the hungry wolf gave up and slunk away.',
    es: "Abajo en el pueblo, los teléfonos hicieron bip, bip, bip. Pero todos dijeron: [tiredly] «Ay, es Toby, otra vez bromeando.» Y nadie vino. [gasps] Las ovejas corrieron por todas las colinas, hasta que el lobo hambriento se rindió y se fue a escondidas.",
  },
  sorry: {
    en: 'Toby ran down to the village with tears in his eyes. [softly] "I\'m sorry I tricked you. I really need your help." The villagers could see he meant it. They checked the sheep\'s little tracker collars on their phones, and together, they found every single sheep, safe and sound.',
    es: "Toby bajó corriendo al pueblo, con lágrimas en los ojos. [softly] «Perdón por engañarlos. De verdad necesito su ayuda.» Los vecinos vieron que lo decía de corazón. Revisaron en sus teléfonos los collares localizadores de las ovejas, y juntos encontraron a todas las ovejas, sanas y salvas.",
  },
  moral: {
    en: "[warmly] And the moral of the story is: if you tell fibs, people may not believe you, even when you tell the truth. So only call for help when it's real, and everyone will come running. The end!",
    es: "[warmly] Y la moraleja del cuento es: si dices mentiras, puede que no te crean, aunque digas la verdad. Así que pide ayuda solo cuando sea de verdad, y todos vendrán corriendo. ¡Fin!",
  },
};

const n2 = (n: number) => String(n).padStart(2, "0");
const V = (n: number) => `kids/boy-wolf/vo${n2(n)}.mp3`;
const E = (n: number) => `kids/boy-wolf/es${n2(n)}.mp3`;

export const SCENES: Scene[] = [
  {
    id: "title",
    label: "Title",
    vo: V(1),
    voSeconds: 2.43,
    lead: 1.6,
    tail: 1.6,
    captions: [],
    spoken: "The Boy Who Cried Wolf.",
    es: { vo: E(1), voSeconds: 2.19, captions: [], spoken: "El Pastorcito Mentiroso." },
  },
  {
    id: "hill",
    label: "Toby and the sheep",
    vo: V(2),
    voSeconds: 14.68,
    lead: 0.6,
    tail: 1.2,
    captions: [
      "Once upon a time, on a green hill above a little village, a young bear cub named Toby looked after the sheep.",
      "The villagers gave him a shiny walkie-talkie.",
      "“If a wolf ever comes, just press the button, and we’ll all come running!”",
    ],
    es: {
      vo: E(2),
      voSeconds: 15.15,
      captions: [
        "Había una vez, en una colina verde sobre un pueblito, un osito llamado Toby que cuidaba las ovejas.",
        "Los vecinos le dieron un walkie-talkie brillante.",
        "«Si alguna vez viene un lobo, aprieta el botón, ¡y todos vendremos corriendo!»",
      ],
    },
  },
  {
    id: "bored",
    label: "Counting sheep",
    vo: V(3),
    voSeconds: 12.2,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "But watching sheep was slow. Toby counted clouds. He counted sheep.",
      "Then he counted the sheep again.",
      "“This is boring. I know a funny trick!”",
    ],
    es: {
      vo: E(3),
      voSeconds: 13.64,
      captions: [
        "Pero cuidar ovejas era muy lento. Toby contó las nubes. Contó las ovejas.",
        "Y luego volvió a contar las ovejas.",
        "«Qué aburrido. ¡Ya sé un truco divertido!»",
      ],
    },
  },
  {
    id: "trick1",
    label: "The first trick",
    vo: V(4),
    voSeconds: 18.05,
    lead: 0.5,
    tail: 1.3,
    captions: [
      "Toby pressed the big button. “Wolf! Wolf! A wolf is chasing the sheep!”",
      "Down in the village, every phone went beep, beep, beep!",
      "Everyone zoomed up the hill on bikes and scooters… but there was no wolf at all.",
      "“Ha ha! Just joking!”",
    ],
    es: {
      vo: E(4),
      voSeconds: 20.04,
      captions: [
        "Toby apretó el botón grande. «¡El lobo! ¡El lobo! ¡Un lobo persigue a las ovejas!»",
        "Abajo en el pueblo, todos los teléfonos hicieron ¡bip, bip, bip!",
        "Todos subieron la colina a toda prisa en bicicletas y patinetas… pero no había ningún lobo.",
        "«¡Ja, ja! ¡Era una broma!»",
      ],
    },
  },
  {
    id: "trick2",
    label: "The second trick",
    vo: V(5),
    voSeconds: 18.21,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "The villagers frowned. “That wasn’t funny, Toby.”",
      "But the very next day, he did it again. “Wolf! Wolf!”",
      "Up they all puffed and panted… and once again, there was no wolf.",
      "The villagers shook their heads and walked slowly home.",
    ],
    es: {
      vo: E(5),
      voSeconds: 20.35,
      captions: [
        "Los vecinos fruncieron el ceño. «Eso no fue gracioso, Toby.»",
        "Pero al día siguiente, lo hizo otra vez. «¡El lobo! ¡El lobo!»",
        "Todos subieron resoplando y jadeando… y otra vez, no había ningún lobo.",
        "Los vecinos movieron la cabeza y volvieron despacito a casa.",
      ],
    },
  },
  {
    id: "realWolf",
    label: "A real wolf",
    vo: V(6),
    voSeconds: 13.71,
    lead: 0.6,
    tail: 1.2,
    captions: [
      "Then one evening, something rustled in the long grass.",
      "Two pointy ears… a bushy grey tail…",
      "It was a real wolf!",
      "“Wolf! Wolf! Please come, it’s real this time!”",
    ],
    es: {
      vo: E(6),
      voSeconds: 15.23,
      captions: [
        "Entonces, una tarde, algo se movió entre la hierba alta.",
        "Dos orejas puntiagudas… una cola gris y peluda…",
        "¡Era un lobo de verdad!",
        "«¡El lobo! ¡El lobo! ¡Por favor, vengan, esta vez es verdad!»",
      ],
    },
  },
  {
    id: "nobody",
    label: "Nobody came",
    vo: V(7),
    voSeconds: 16.77,
    lead: 0.5,
    tail: 1.3,
    captions: [
      "Down in the village, the phones went beep, beep, beep.",
      "But everyone said, “Oh, it’s just Toby, joking again.” And nobody came.",
      "The sheep scattered all over the hills, until the hungry wolf gave up and slunk away.",
    ],
    es: {
      vo: E(7),
      voSeconds: 17.48,
      captions: [
        "Abajo en el pueblo, los teléfonos hicieron bip, bip, bip.",
        "Pero todos dijeron: «Ay, es Toby, otra vez bromeando.» Y nadie vino.",
        "Las ovejas corrieron por todas las colinas, hasta que el lobo hambriento se rindió y se fue a escondidas.",
      ],
    },
  },
  {
    id: "sorry",
    label: "Sorry",
    vo: V(8),
    voSeconds: 16.67,
    lead: 0.5,
    tail: 1.4,
    captions: [
      "Toby ran down to the village with tears in his eyes.",
      "“I’m sorry I tricked you. I really need your help.” The villagers could see he meant it.",
      "They checked the sheep’s little tracker collars on their phones,",
      "and together, they found every single sheep, safe and sound.",
    ],
    es: {
      vo: E(8),
      voSeconds: 19.49,
      captions: [
        "Toby bajó corriendo al pueblo, con lágrimas en los ojos.",
        "«Perdón por engañarlos. De verdad necesito su ayuda.» Los vecinos vieron que lo decía de corazón.",
        "Revisaron en sus teléfonos los collares localizadores de las ovejas,",
        "y juntos encontraron a todas las ovejas, sanas y salvas.",
      ],
    },
  },
  {
    id: "moral",
    label: "The moral",
    vo: V(9),
    voSeconds: 12.12,
    lead: 0.6,
    tail: 2.6,
    captions: [],
    spoken:
      "And the moral of the story is: if you tell fibs, people may not believe you, even when you tell the truth. So only call for help when it's real, and everyone will come running. The end!",
    es: {
      vo: E(9),
      voSeconds: 12.04,
      captions: [],
      spoken:
        "Y la moraleja del cuento es: si dices mentiras, puede que no te crean, aunque digas la verdad. Así que pide ayuda solo cuando sea de verdad, y todos vendrán corriendo. ¡Fin!",
    },
  },
];
