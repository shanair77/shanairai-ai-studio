/**
 * The Crow and the Pitcher (Aesop), 2026 spin: on a hot day in a community garden, Pip the
 * little crow finds a tall glass pitcher with a drop of water at the bottom. The sprinklers are
 * on a sunset timer, so she can't wait. A garden kid's science-fair poster gives her the idea,
 * and the garden's friendly delivery robot lends her its tray of pebbles. Plink by plink, the
 * water rises. She shares, gives the pebbles back, and everyone dances in the sunset sprinklers.
 */

import type { StoryScene } from "../../kit";

export type SceneId = "title" | "garden" | "pitcher" | "tries" | "poster" | "robot" | "pebbles" | "drink" | "moral";

export type Scene = StoryScene & { id: SceneId };

/** What the narrator is asked to say (with ElevenLabs v4 tags), per scene. */
export const NARRATION: Record<SceneId, { en: string; es: string }> = {
  title: { en: "[warmly] The Crow... and the Pitcher.", es: "[warmly] El Cuervo... y la Jarra." },
  garden: {
    en: '[warmly] Once upon a time, on a hot, hot summer day, a little crow called Pip flew over the community garden. The sun was blazing, the flowers were drooping, and the sprinklers were fast asleep. They only switched on at sunset. [sighs] "I\'m so thirsty!" said Pip.',
    es: "[warmly] Había una vez, en un día de verano muy, muy caluroso, una cuervita llamada Pip que volaba sobre el huerto comunitario. El sol brillaba con fuerza, las flores estaban marchitas y los aspersores estaban dormidos. Solo se encendían al atardecer. [sighs] «¡Tengo mucha sed!», dijo Pip.",
  },
  pitcher: {
    en: "Then Pip spotted something shiny by the bean poles. A tall glass pitcher! [excitedly] And at the very bottom, there was a little bit of water. Pip pushed her beak in as far as it would go... [strained] but she couldn't reach it. Her beak was just too short.",
    es: "Entonces Pip vio algo brillante junto a las varas de los frijoles. ¡Una jarra de vidrio muy alta! [excitedly] Y en el fondo, había un poquito de agua. Pip metió el pico hasta donde pudo... [strained] pero no alcanzaba. Su pico era demasiado corto.",
  },
  tries: {
    en: 'Pip tried to tip the pitcher over. [grunting] Heave! It was much too heavy. She stretched up on her tiptoes. Not even close! A sleepy snail peeked out of his shell. [yawning] "Too hard, little crow. Why not give up?" [determined] "No," said Pip. "I\'m going to think."',
    es: "Pip intentó volcar la jarra. [grunting] ¡Upa! Era demasiado pesada. Se estiró de puntitas. ¡Ni de cerca! Un caracol dormilón se asomó de su concha. [yawning] «Es muy difícil, cuervita. ¿Por qué no te rindes?» [determined] «No», dijo Pip. «Voy a pensar.»",
  },
  poster: {
    en: 'Pip looked around the garden. On the shed, there was a bright science-fair poster, made by one of the garden kids. It showed a glass of water and some stones. [reading slowly] "Drop stones in the water... and the water goes up!" [gasps] "That\'s it!" said Pip. "An experiment!"',
    es: "Pip miró por todo el huerto. En el cobertizo había un cartel de feria de ciencias muy colorido, hecho por uno de los niños del huerto. Mostraba un vaso de agua y unas piedras. [reading slowly] «Echa piedras en el agua... ¡y el agua sube!» [gasps] «¡Eso es!», dijo Pip. «¡Un experimento!»",
  },
  robot: {
    en: 'Just then, the garden\'s little delivery robot came rolling down the path, carrying a tray of smooth, round pebbles for the flower beds. [politely] "Excuse me," said Pip. "May I borrow a few pebbles, please?" The robot blinked its lights. [robotic voice] "Beep boop! Yes, you may!"',
    es: "Justo entonces, el pequeño robot repartidor del huerto llegó rodando por el camino, con una bandeja de piedritas lisas y redondas para los canteros de flores. [politely] «Disculpa», dijo Pip. «¿Me prestas unas piedritas, por favor?» El robot parpadeó sus luces. [robotic voice] «¡Bip bup! ¡Sí, claro!»",
  },
  pebbles: {
    en: 'One by one, Pip dropped the pebbles into the pitcher. [counting slowly] Plink! One. Plink! Two. Plink! Three. With every pebble, the water crept up a little higher. The snail stretched out to watch. [amazed] "It\'s working!"',
    es: "Una por una, Pip echó las piedritas en la jarra. [counting slowly] ¡Plin! Una. ¡Plin! Dos. ¡Plin! Tres. Con cada piedrita, el agua subía un poquito más. El caracol se estiró para mirar. [amazed] «¡Está funcionando!»",
  },
  drink: {
    en: 'Plink! Plink! Plink! At last, the water reached the top. Pip took a long, cool drink. [happily] "Ahhh!" Then she shared with a thirsty bee and the snail too, and put every pebble back on the robot\'s tray. And at sunset, the sprinklers whooshed on, and everyone danced in the spray.',
    es: "¡Plin! ¡Plin! ¡Plin! Por fin, el agua llegó hasta arriba. Pip tomó un trago largo y fresquito. [happily] «¡Aaah!» Luego compartió con una abeja sedienta y también con el caracol, y devolvió cada piedrita a la bandeja del robot. Y al atardecer, los aspersores se encendieron, ¡fiuuu!, y todos bailaron bajo el rocío.",
  },
  moral: {
    en: "[warmly] And the moral of the story is: little by little does the trick. When something seems too hard, stop, think, and try a new idea, just like a scientist! The end!",
    es: "[warmly] Y la moraleja del cuento es: poquito a poquito se logra mucho. Cuando algo parece muy difícil, detente, piensa, y prueba una idea nueva, ¡como una científica! ¡Fin!",
  },
};

const n2 = (n: number) => String(n).padStart(2, "0");
const V = (n: number) => `kids/crow-pitcher/vo${n2(n)}.mp3`;
const E = (n: number) => `kids/crow-pitcher/es${n2(n)}.mp3`;

export const SCENES: Scene[] = [
  {
    id: "title",
    label: "Title",
    vo: V(1),
    voSeconds: 2.35,
    lead: 1.6,
    tail: 1.6,
    captions: [],
    spoken: "The Crow... and the Pitcher.",
    es: { vo: E(1), voSeconds: 2.27, captions: [], spoken: "El Cuervo... y la Jarra." },
  },
  {
    id: "garden",
    label: "A hot day in the garden",
    vo: V(2),
    voSeconds: 18.91,
    lead: 0.6,
    tail: 1.2,
    captions: [
      "Once upon a time, on a hot, hot summer day, a little crow called Pip flew over the community garden.",
      "The sun was blazing, the flowers were drooping, and the sprinklers were fast asleep.",
      "They only switched on at sunset.",
      "“I’m so thirsty!” said Pip.",
    ],
    es: {
      vo: E(2),
      voSeconds: 21.08,
      captions: [
        "Había una vez, en un día de verano muy, muy caluroso, una cuervita llamada Pip que volaba sobre el huerto comunitario.",
        "El sol brillaba con fuerza, las flores estaban marchitas y los aspersores estaban dormidos.",
        "Solo se encendían al atardecer.",
        "«¡Tengo mucha sed!», dijo Pip.",
      ],
    },
  },
  {
    id: "pitcher",
    label: "The pitcher",
    vo: V(3),
    voSeconds: 16.12,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "Then Pip spotted something shiny by the bean poles. A tall glass pitcher!",
      "And at the very bottom, there was a little bit of water.",
      "Pip pushed her beak in as far as it would go… but she couldn’t reach it.",
      "Her beak was just too short.",
    ],
    es: {
      vo: E(3),
      voSeconds: 17.08,
      captions: [
        "Entonces Pip vio algo brillante junto a las varas de los frijoles. ¡Una jarra de vidrio muy alta!",
        "Y en el fondo, había un poquito de agua.",
        "Pip metió el pico hasta donde pudo… pero no alcanzaba.",
        "Su pico era demasiado corto.",
      ],
    },
  },
  {
    id: "tries",
    label: "Pip tries",
    vo: V(4),
    voSeconds: 21.08,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "Pip tried to tip the pitcher over. Heave! It was much too heavy.",
      "She stretched up on her tiptoes. Not even close!",
      "A sleepy snail peeked out of his shell. “Too hard, little crow. Why not give up?”",
      "“No,” said Pip. “I’m going to think.”",
    ],
    es: {
      vo: E(4),
      voSeconds: 19.33,
      captions: [
        "Pip intentó volcar la jarra. ¡Upa! Era demasiado pesada.",
        "Se estiró de puntitas. ¡Ni de cerca!",
        "Un caracol dormilón se asomó de su concha. «Es muy difícil, cuervita. ¿Por qué no te rindes?»",
        "«No», dijo Pip. «Voy a pensar.»",
      ],
    },
  },
  {
    id: "poster",
    label: "The science-fair poster",
    vo: V(5),
    voSeconds: 17.48,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "Pip looked around the garden. On the shed, there was a bright science-fair poster, made by one of the garden kids.",
      "It showed a glass of water and some stones.",
      "“Drop stones in the water… and the water goes up!”",
      "“That’s it!” said Pip. “An experiment!”",
    ],
    es: {
      vo: E(5),
      voSeconds: 19.33,
      captions: [
        "Pip miró por todo el huerto. En el cobertizo había un cartel de feria de ciencias muy colorido, hecho por uno de los niños del huerto.",
        "Mostraba un vaso de agua y unas piedras.",
        "«Echa piedras en el agua… ¡y el agua sube!»",
        "«¡Eso es!», dijo Pip. «¡Un experimento!»",
      ],
    },
  },
  {
    id: "robot",
    label: "The delivery robot",
    vo: V(6),
    voSeconds: 16.77,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "Just then, the garden’s little delivery robot came rolling down the path, carrying a tray of smooth, round pebbles for the flower beds.",
      "“Excuse me,” said Pip. “May I borrow a few pebbles, please?”",
      "The robot blinked its lights. “Beep boop! Yes, you may!”",
    ],
    es: {
      vo: E(6),
      voSeconds: 18.44,
      captions: [
        "Justo entonces, el pequeño robot repartidor del huerto llegó rodando por el camino, con una bandeja de piedritas lisas y redondas para los canteros de flores.",
        "«Disculpa», dijo Pip. «¿Me prestas unas piedritas, por favor?»",
        "El robot parpadeó sus luces. «¡Bip bup! ¡Sí, claro!»",
      ],
    },
  },
  {
    id: "pebbles",
    label: "Plink, plink",
    vo: V(7),
    voSeconds: 17.16,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "One by one, Pip dropped the pebbles into the pitcher.",
      "Plink! One. Plink! Two. Plink! Three.",
      "With every pebble, the water crept up a little higher.",
      "The snail stretched out to watch. “It’s working!”",
    ],
    es: {
      vo: E(7),
      voSeconds: 16.85,
      captions: [
        "Una por una, Pip echó las piedritas en la jarra.",
        "¡Plin! Una. ¡Plin! Dos. ¡Plin! Tres.",
        "Con cada piedrita, el agua subía un poquito más.",
        "El caracol se estiró para mirar. «¡Está funcionando!»",
      ],
    },
  },
  {
    id: "drink",
    label: "A long, cool drink",
    vo: V(8),
    voSeconds: 20.69,
    lead: 0.5,
    tail: 1.4,
    captions: [
      "Plink! Plink! Plink! At last, the water reached the top. Pip took a long, cool drink. “Ahhh!”",
      "Then she shared with a thirsty bee and the snail too, and put every pebble back on the robot’s tray.",
      "And at sunset, the sprinklers whooshed on, and everyone danced in the spray.",
    ],
    es: {
      vo: E(8),
      voSeconds: 22.13,
      captions: [
        "¡Plin! ¡Plin! ¡Plin! Por fin, el agua llegó hasta arriba. Pip tomó un trago largo y fresquito. «¡Aaah!»",
        "Luego compartió con una abeja sedienta y también con el caracol, y devolvió cada piedrita a la bandeja del robot.",
        "Y al atardecer, los aspersores se encendieron, ¡fiuuu!, y todos bailaron bajo el rocío.",
      ],
    },
  },
  {
    id: "moral",
    label: "The moral",
    vo: V(9),
    voSeconds: 11.65,
    lead: 0.6,
    tail: 2.6,
    captions: [],
    spoken: "And the moral of the story is: little by little does the trick. When something seems too hard, stop, think, and try a new idea, just like a scientist! The end!",
    es: {
      vo: E(9),
      voSeconds: 12.12,
      captions: [],
      spoken: "Y la moraleja del cuento es: poquito a poquito se logra mucho. Cuando algo parece muy difícil, detente, piensa, y prueba una idea nueva, ¡como una científica! ¡Fin!",
    },
  },
];
