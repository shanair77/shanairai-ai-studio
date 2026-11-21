/**
 * The Three Little Pigs (English folk tale), 2026 spin: three pigs build on a sunny
 * countryside cul-de-sac — straw (then a hammock and a tablet), sticks (then dancing to a
 * little speaker), and bricks with solar panels and a video doorbell. Gentle: the grumpy
 * Wolf huffs the straw and stick houses away (nobody is hurt), can't budge the brick one,
 * runs out of puff and goes home for a nap. Then the pigs build together.
 */

import type { StoryScene } from "../../kit";

export type SceneId =
  | "title"
  | "leave"
  | "straw"
  | "sticks"
  | "bricks"
  | "wolfStraw"
  | "wolfSticks"
  | "doorbell"
  | "together"
  | "moral";

export type Scene = StoryScene & { id: SceneId };

/** What the narrator is asked to say (with ElevenLabs v4 tags), per scene. */
export const NARRATION: Record<SceneId, { en: string; es: string }> = {
  title: { en: "[warmly] The Three Little Pigs.", es: "[warmly] Los Tres Cerditos." },
  leave: {
    en: '[warmly] Once upon a time, three little pigs packed their bags to build homes of their own, on a sunny little street at the edge of the countryside. Mama Pig waved goodbye. [lovingly] "Build strong houses, my darlings!"',
    es: "[warmly] Había una vez tres cerditos que hicieron sus maletas para construir sus propias casitas, en una calle soleada a la orilla del campo. Mamá Cerda les dijo adiós. [lovingly] «¡Construyan casas fuertes, mis amores!»",
  },
  straw: {
    en: 'The first little pig was in a hurry. [cheerfully] "Straw is quick!" He piled it up in one morning, then flopped into his hammock with his tablet. "All done! Time to play!"',
    es: "El primer cerdito tenía mucha prisa. [cheerfully] «¡La paja es rápida!» La amontonó en una sola mañana, y luego se tumbó en su hamaca con su tableta. «¡Listo! ¡A jugar!»",
  },
  sticks: {
    en: 'The second little pig gathered sticks. [cheerfully] "Sticks are quick too!" She tied them together with string, then danced to music from her little speaker. "Finished! Let\'s dance!"',
    es: "La segunda cerdita juntó palitos. [cheerfully] «¡Los palitos también son rápidos!» Los ató con un cordel, y luego bailó con la música de su altavoz. «¡Terminé! ¡A bailar!»",
  },
  bricks: {
    en: 'The third little pig worked hard all week. Brick by brick, she built a strong little house, with solar panels on the roof and a video doorbell by the door. [proudly] "Slow and strong," she smiled.',
    es: "La tercera cerdita trabajó duro toda la semana. Ladrillo a ladrillo, construyó una casita fuerte, con paneles solares en el techo y un timbre con cámara junto a la puerta. [proudly] «Despacito y fuerte», sonrió.",
  },
  wolfStraw: {
    en: 'Then along came a big, grumpy Wolf. [gruffly] "Little pig, little pig, let me come in!" [squeaky] "Not by the hair of my chinny chin chin!" [gruffly] "Then I\'ll huff, and I\'ll puff..." Whoosh! The straw blew away, and the little pig ran to his sister\'s house.',
    es: "Entonces llegó un lobo grande y gruñón. [gruffly] «¡Cerdito, cerdito, déjame entrar!» [squeaky] «¡No, no, por los pelitos de mi barbilla!» [gruffly] «Entonces soplaré, y soplaré...» ¡Fuuu! La paja salió volando, y el cerdito corrió a casa de su hermana.",
  },
  wolfSticks: {
    en: "[gruffly] The Wolf huffed and puffed at the stick house too. Whoosh! The sticks went flying! [gasps] The two little pigs ran as fast as their trotters could go, all the way to the brick house.",
    es: "[gruffly] El lobo sopló y sopló también la casa de palitos. ¡Fuuu! ¡Los palitos salieron volando! [gasps] Los dos cerditos corrieron tan rápido como pudieron, hasta la casa de ladrillos.",
  },
  doorbell: {
    en: 'Ding dong! The Wolf rang the video doorbell. [gruffly] "Little pigs, let me come in!" [cheerfully] "Not by the hair of our chinny chin chins!" He huffed and puffed, and puffed and huffed... but the brick house stood strong. [sighs] "I\'m all out of puff," said the Wolf, and he went home for a nap.',
    es: "¡Din, don! El lobo tocó el timbre con cámara. [gruffly] «¡Cerditos, déjenme entrar!» [cheerfully] «¡No, no, por los pelitos de nuestras barbillas!» Sopló y sopló, y volvió a soplar... pero la casa de ladrillos se quedó firme. [sighs] «Me quedé sin aire», dijo el lobo, y se fue a casa a dormir una siesta.",
  },
  together: {
    en: '[warmly] The three little pigs shared a cosy dinner. And the next day, they worked together to build two more strong brick houses, side by side. [cheerfully] "Teamwork makes it easy!"',
    es: "[warmly] Los tres cerditos compartieron una cena calentita. Y al día siguiente, trabajaron juntos para construir dos casas de ladrillo más, una al lado de la otra. [cheerfully] «¡En equipo es más fácil!»",
  },
  moral: {
    en: "[warmly] And the moral of the story is: take your time, and do your work well. It's fun to play, but finish the job first. And helping each other makes everything stronger. The end!",
    es: "[warmly] Y la moraleja del cuento es: tómate tu tiempo y haz bien tu trabajo. Jugar es divertido, pero primero termina la tarea. Y ayudarnos unos a otros hace todo más fuerte. ¡Fin!",
  },
};

const n2 = (n: number) => String(n).padStart(2, "0");
const V = (n: number) => `kids/three-pigs/vo${n2(n)}.mp3`;
const E = (n: number) => `kids/three-pigs/es${n2(n)}.mp3`;

export const SCENES: Scene[] = [
  {
    id: "title",
    label: "Title",
    vo: V(1),
    voSeconds: 2.19,
    lead: 1.6,
    tail: 1.6,
    captions: [],
    spoken: "The Three Little Pigs.",
    es: { vo: E(1), voSeconds: 1.8, captions: [], spoken: "Los Tres Cerditos." },
  },
  {
    id: "leave",
    label: "Off they go",
    vo: V(2),
    voSeconds: 12.93,
    lead: 0.6,
    tail: 1.2,
    captions: [
      "Once upon a time, three little pigs packed their bags to build homes of their own,",
      "on a sunny little street at the edge of the countryside.",
      "Mama Pig waved goodbye. “Build strong houses, my darlings!”",
    ],
    es: {
      vo: E(2),
      voSeconds: 12.75,
      captions: [
        "Había una vez tres cerditos que hicieron sus maletas para construir sus propias casitas,",
        "en una calle soleada a la orilla del campo.",
        "Mamá Cerda les dijo adiós. «¡Construyan casas fuertes, mis amores!»",
      ],
    },
  },
  {
    id: "straw",
    label: "The straw house",
    vo: V(3),
    voSeconds: 10.37,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "The first little pig was in a hurry. “Straw is quick!”",
      "He piled it up in one morning, then flopped into his hammock with his tablet.",
      "“All done! Time to play!”",
    ],
    es: {
      vo: E(3),
      voSeconds: 11.0,
      captions: [
        "El primer cerdito tenía mucha prisa. «¡La paja es rápida!»",
        "La amontonó en una sola mañana, y luego se tumbó en su hamaca con su tableta.",
        "«¡Listo! ¡A jugar!»",
      ],
    },
  },
  {
    id: "sticks",
    label: "The stick house",
    vo: V(4),
    voSeconds: 10.53,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "The second little pig gathered sticks. “Sticks are quick too!”",
      "She tied them together with string, then danced to music from her little speaker.",
      "“Finished! Let’s dance!”",
    ],
    es: {
      vo: E(4),
      voSeconds: 11.08,
      captions: [
        "La segunda cerdita juntó palitos. «¡Los palitos también son rápidos!»",
        "Los ató con un cordel, y luego bailó con la música de su altavoz.",
        "«¡Terminé! ¡A bailar!»",
      ],
    },
  },
  {
    id: "bricks",
    label: "The brick house",
    vo: V(5),
    voSeconds: 13.17,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "The third little pig worked hard all week. Brick by brick, she built a strong little house,",
      "with solar panels on the roof and a video doorbell by the door.",
      "“Slow and strong,” she smiled.",
    ],
    es: {
      vo: E(5),
      voSeconds: 14.45,
      captions: [
        "La tercera cerdita trabajó duro toda la semana. Ladrillo a ladrillo, construyó una casita fuerte,",
        "con paneles solares en el techo y un timbre con cámara junto a la puerta.",
        "«Despacito y fuerte», sonrió.",
      ],
    },
  },
  {
    id: "wolfStraw",
    label: "Huff and puff",
    vo: V(6),
    voSeconds: 17.79,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "Then along came a big, grumpy Wolf. “Little pig, little pig, let me come in!”",
      "“Not by the hair of my chinny chin chin!”",
      "“Then I’ll huff, and I’ll puff…” Whoosh!",
      "The straw blew away, and the little pig ran to his sister’s house.",
    ],
    es: {
      vo: E(6),
      voSeconds: 17.4,
      captions: [
        "Entonces llegó un lobo grande y gruñón. «¡Cerdito, cerdito, déjame entrar!»",
        "«¡No, no, por los pelitos de mi barbilla!»",
        "«Entonces soplaré, y soplaré…» ¡Fuuu!",
        "La paja salió volando, y el cerdito corrió a casa de su hermana.",
      ],
    },
  },
  {
    id: "wolfSticks",
    label: "Sticks go flying",
    vo: V(7),
    voSeconds: 12.12,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "The Wolf huffed and puffed at the stick house too. Whoosh!",
      "The sticks went flying!",
      "The two little pigs ran as fast as their trotters could go, all the way to the brick house.",
    ],
    es: {
      vo: E(7),
      voSeconds: 12.43,
      captions: [
        "El lobo sopló y sopló también la casa de palitos. ¡Fuuu!",
        "¡Los palitos salieron volando!",
        "Los dos cerditos corrieron tan rápido como pudieron, hasta la casa de ladrillos.",
      ],
    },
  },
  {
    id: "doorbell",
    label: "Ding dong",
    vo: V(8),
    voSeconds: 19.96,
    lead: 0.5,
    tail: 1.3,
    captions: [
      "Ding dong! The Wolf rang the video doorbell. “Little pigs, let me come in!”",
      "“Not by the hair of our chinny chin chins!”",
      "He huffed and puffed, and puffed and huffed… but the brick house stood strong.",
      "“I’m all out of puff,” said the Wolf, and he went home for a nap.",
    ],
    es: {
      vo: E(8),
      voSeconds: 21.0,
      captions: [
        "¡Din, don! El lobo tocó el timbre con cámara. «¡Cerditos, déjenme entrar!»",
        "«¡No, no, por los pelitos de nuestras barbillas!»",
        "Sopló y sopló, y volvió a soplar… pero la casa de ladrillos se quedó firme.",
        "«Me quedé sin aire», dijo el lobo, y se fue a casa a dormir una siesta.",
      ],
    },
  },
  {
    id: "together",
    label: "Teamwork",
    vo: V(9),
    voSeconds: 10.61,
    lead: 0.5,
    tail: 1.4,
    captions: [
      "The three little pigs shared a cosy dinner.",
      "And the next day, they worked together to build two more strong brick houses, side by side.",
      "“Teamwork makes it easy!”",
    ],
    es: {
      vo: E(9),
      voSeconds: 12.2,
      captions: [
        "Los tres cerditos compartieron una cena calentita.",
        "Y al día siguiente, trabajaron juntos para construir dos casas de ladrillo más, una al lado de la otra.",
        "«¡En equipo es más fácil!»",
      ],
    },
  },
  {
    id: "moral",
    label: "The moral",
    vo: V(10),
    voSeconds: 11.81,
    lead: 0.6,
    tail: 2.6,
    captions: [],
    spoken:
      "And the moral of the story is: take your time, and do your work well. It's fun to play, but finish the job first. And helping each other makes everything stronger. The end!",
    es: {
      vo: E(10),
      voSeconds: 12.36,
      captions: [],
      spoken:
        "Y la moraleja del cuento es: tómate tu tiempo y haz bien tu trabajo. Jugar es divertido, pero primero termina la tarea. Y ayudarnos unos a otros hace todo más fuerte. ¡Fin!",
    },
  },
];
