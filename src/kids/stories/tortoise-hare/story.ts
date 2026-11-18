/**
 * The Tortoise and the Hare (Aesop), 2026 Edition: a fun-run in a city park. The Hare
 * stops for selfies and "just one more video", then naps; the Tortoise's little
 * step-counter watch beeps him along; a camera drone films the finish. Kind ending:
 * the two walk home together.
 */

import type { StoryScene } from "../../kit";

export type SceneId = "title" | "brag" | "start" | "selfie" | "nap" | "pass" | "finish" | "friends" | "moral";

export type Scene = StoryScene & { id: SceneId };

/** What the narrator is asked to say (with ElevenLabs v4 tags), per scene. */
export const NARRATION: Record<SceneId, { en: string; es: string }> = {
  title: { en: "[warmly] The Tortoise... and the Hare.", es: "[warmly] La Tortuga... y la Liebre." },
  brag: {
    en: '[warmly] Once upon a time, in a sunny city park, lived a speedy Hare who loved to show off. [proudly] "I\'m the fastest in the whole park!" he boasted. A gentle Tortoise smiled. [softly] "Shall we have a race?" [laughs] The Hare laughed. "You? Race me? You\'re on!"',
    es: "[warmly] Había una vez, en un soleado parque de la ciudad, una liebre muy veloz a la que le encantaba presumir. [proudly] «¡Soy la más rápida de todo el parque!», decía orgullosa. Una tortuga amable sonrió. [softly] «¿Hacemos una carrera?» [laughs] La liebre se rió. «¿Tú? ¿Contra mí? ¡Trato hecho!»",
  },
  start: {
    en: '[excited] All the park friends came to watch the big fun-run. Ducks and squirrels lined the path, and a little camera drone buzzed up high. "Ready, steady... GO!" Zoom! The Hare shot off like a rocket.',
    es: "[excited] Todos los amigos del parque vinieron a ver la gran carrera. Patos y ardillas llenaban el camino, y un pequeño dron con cámara zumbaba en lo alto. «En sus marcas, listos... ¡FUERA!» ¡Zum! La liebre salió disparada como un cohete.",
  },
  selfie: {
    en: 'The Hare was so far ahead, he stopped under a shady tree. [cheerfully] "Time for a selfie!" Click, click! Then he watched a funny video. [yawns] "Just one more," he said. And one more... and one more...',
    es: "La liebre iba tan adelantada que se detuvo bajo un árbol con sombra. [cheerfully] «¡Hora de una selfi!» ¡Clic, clic! Luego vio un video muy gracioso. [yawns] «Solo uno más», dijo. Y uno más... y uno más...",
  },
  nap: {
    en: "[softly] Soon his eyes grew heavy, and the Hare fell fast asleep, with his phone on his tummy. Meanwhile, the Tortoise kept going. Step, step, step. His little watch counted every one. Beep! Beep! Beep!",
    es: "[softly] Pronto se le cerraron los ojitos, y la liebre se quedó profundamente dormida, con el teléfono en la barriga. Mientras tanto, la tortuga siguió caminando. Paso, paso, paso. Su relojito contaba cada uno. ¡Bip! ¡Bip! ¡Bip!",
  },
  pass: {
    en: "[whispering] The Tortoise walked right past the sleeping Hare. He didn't stop. He didn't rush. Slow and steady, he plodded on, closer and closer to the finish line.",
    es: "[whispering] La tortuga pasó justo al lado de la liebre dormida. No se detuvo. No se apuró. Despacito y sin parar, siguió adelante, cada vez más cerca de la meta.",
  },
  finish: {
    en: 'Suddenly, the Hare woke up. [gasps] "Oh no!" [excited] He raced as fast as he could... but the Tortoise was already crossing the finish line! The drone filmed it all, and everyone cheered. "Hooray!"',
    es: "De pronto, la liebre se despertó. [gasps] «¡Ay, no!» [excited] Corrió tan rápido como pudo... ¡pero la tortuga ya estaba cruzando la meta! El dron lo grabó todo, y todos aplaudieron. «¡Hurra!»",
  },
  friends: {
    en: '[warmly] The Hare hopped over, all out of breath. [sheepishly] "Well done," he said, with a shy smile. "I should have kept going." "Thank you," said the Tortoise kindly. "Shall we walk home together?" And so they did, side by side.',
    es: "[warmly] La liebre llegó saltando, sin aliento. [sheepishly] «¡Bien hecho!», dijo con una sonrisa tímida. «Debí seguir adelante.» «Gracias», dijo la tortuga con cariño. «¿Volvemos a casa juntas?» Y así lo hicieron, lado a lado.",
  },
  moral: {
    en: "[warmly] And the moral of the story is: slow and steady wins the race. And sometimes, it's okay to put the phone down, and keep going. The end!",
    es: "[warmly] Y la moraleja del cuento es: despacio y sin parar se gana la carrera. Y a veces, está bien dejar el teléfono a un lado y seguir adelante. ¡Fin!",
  },
};

export const SCENES: Scene[] = [
  {
    id: "title",
    label: "Title",
    vo: "kids/tortoise-hare/vo01.mp3",
    voSeconds: 2.35,
    lead: 1.6,
    tail: 1.6,
    captions: [],
    spoken: "The Tortoise... and the Hare.",
    es: { vo: "kids/tortoise-hare/es01.mp3", voSeconds: 2.51, captions: [], spoken: "La Tortuga... y la Liebre." },
  },
  {
    id: "brag",
    label: "The show-off",
    vo: "kids/tortoise-hare/vo02.mp3",
    voSeconds: 18.05,
    lead: 0.6,
    tail: 1.0,
    captions: [
      "Once upon a time, in a sunny city park, lived a speedy Hare who loved to show off.",
      "“I’m the fastest in the whole park!” he boasted.",
      "A gentle Tortoise smiled. “Shall we have a race?”",
      "The Hare laughed. “You? Race me? You’re on!”",
    ],
    es: {
      vo: "kids/tortoise-hare/es02.mp3",
      voSeconds: 19.33,
      captions: [
        "Había una vez, en un soleado parque de la ciudad, una liebre muy veloz a la que le encantaba presumir.",
        "«¡Soy la más rápida de todo el parque!», decía orgullosa.",
        "Una tortuga amable sonrió. «¿Hacemos una carrera?»",
        "La liebre se rió. «¿Tú? ¿Contra mí? ¡Trato hecho!»",
      ],
    },
  },
  {
    id: "start",
    label: "Ready, steady, go",
    vo: "kids/tortoise-hare/vo03.mp3",
    voSeconds: 13.79,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "All the park friends came to watch the big fun-run.",
      "Ducks and squirrels lined the path, and a little camera drone buzzed up high.",
      "“Ready, steady… GO!”",
      "Zoom! The Hare shot off like a rocket.",
    ],
    es: {
      vo: "kids/tortoise-hare/es03.mp3",
      voSeconds: 16.59,
      captions: [
        "Todos los amigos del parque vinieron a ver la gran carrera.",
        "Patos y ardillas llenaban el camino, y un pequeño dron con cámara zumbaba en lo alto.",
        "«En sus marcas, listos… ¡FUERA!»",
        "¡Zum! La liebre salió disparada como un cohete.",
      ],
    },
  },
  {
    id: "selfie",
    label: "Just one more",
    vo: "kids/tortoise-hare/vo04.mp3",
    voSeconds: 14.45,
    lead: 0.5,
    tail: 1.0,
    captions: [
      "The Hare was so far ahead, he stopped under a shady tree.",
      "“Time for a selfie!” Click, click!",
      "Then he watched a funny video.",
      "“Just one more,” he said. And one more… and one more…",
    ],
    es: {
      vo: "kids/tortoise-hare/es04.mp3",
      voSeconds: 15.49,
      captions: [
        "La liebre iba tan adelantada que se detuvo bajo un árbol con sombra.",
        "«¡Hora de una selfi!» ¡Clic, clic!",
        "Luego vio un video muy gracioso.",
        "«Solo uno más», dijo. Y uno más… y uno más…",
      ],
    },
  },
  {
    id: "nap",
    label: "The nap",
    vo: "kids/tortoise-hare/vo05.mp3",
    voSeconds: 15.39,
    lead: 0.5,
    tail: 1.0,
    captions: [
      "Soon his eyes grew heavy, and the Hare fell fast asleep, with his phone on his tummy.",
      "Meanwhile, the Tortoise kept going. Step, step, step.",
      "His little watch counted every one. Beep! Beep! Beep!",
    ],
    es: {
      vo: "kids/tortoise-hare/es05.mp3",
      voSeconds: 18.13,
      captions: [
        "Pronto se le cerraron los ojitos, y la liebre se quedó profundamente dormida, con el teléfono en la barriga.",
        "Mientras tanto, la tortuga siguió caminando. Paso, paso, paso.",
        "Su relojito contaba cada uno. ¡Bip! ¡Bip! ¡Bip!",
      ],
    },
  },
  {
    id: "pass",
    label: "Slow and steady",
    vo: "kids/tortoise-hare/vo06.mp3",
    voSeconds: 11.0,
    lead: 0.5,
    tail: 1.0,
    captions: [
      "The Tortoise walked right past the sleeping Hare.",
      "He didn’t stop. He didn’t rush.",
      "Slow and steady, he plodded on, closer and closer to the finish line.",
    ],
    es: {
      vo: "kids/tortoise-hare/es06.mp3",
      voSeconds: 11.81,
      captions: [
        "La tortuga pasó justo al lado de la liebre dormida.",
        "No se detuvo. No se apuró.",
        "Despacito y sin parar, siguió adelante, cada vez más cerca de la meta.",
      ],
    },
  },
  {
    id: "finish",
    label: "The finish line",
    vo: "kids/tortoise-hare/vo07.mp3",
    voSeconds: 13.56,
    lead: 0.5,
    tail: 1.4,
    captions: [
      "Suddenly, the Hare woke up. “Oh no!”",
      "He raced as fast as he could…",
      "but the Tortoise was already crossing the finish line!",
      "The drone filmed it all, and everyone cheered. “Hooray!”",
    ],
    es: {
      vo: "kids/tortoise-hare/es07.mp3",
      voSeconds: 13.24,
      captions: [
        "De pronto, la liebre se despertó. «¡Ay, no!»",
        "Corrió tan rápido como pudo…",
        "¡pero la tortuga ya estaba cruzando la meta!",
        "El dron lo grabó todo, y todos aplaudieron. «¡Hurra!»",
      ],
    },
  },
  {
    id: "friends",
    label: "Side by side",
    vo: "kids/tortoise-hare/vo08.mp3",
    voSeconds: 15.31,
    lead: 0.5,
    tail: 1.4,
    captions: [
      "The Hare hopped over, all out of breath.",
      "“Well done,” he said, with a shy smile. “I should have kept going.”",
      "“Thank you,” said the Tortoise kindly. “Shall we walk home together?”",
      "And so they did, side by side.",
    ],
    es: {
      vo: "kids/tortoise-hare/es08.mp3",
      voSeconds: 15.23,
      captions: [
        "La liebre llegó saltando, sin aliento.",
        "«¡Bien hecho!», dijo con una sonrisa tímida. «Debí seguir adelante.»",
        "«Gracias», dijo la tortuga con cariño. «¿Volvemos a casa juntas?»",
        "Y así lo hicieron, lado a lado.",
      ],
    },
  },
  {
    id: "moral",
    label: "The moral",
    vo: "kids/tortoise-hare/vo09.mp3",
    voSeconds: 9.09,
    lead: 0.6,
    tail: 2.6,
    captions: [],
    spoken:
      "And the moral of the story is: slow and steady wins the race. And sometimes, it's okay to put the phone down, and keep going. The end!",
    es: {
      vo: "kids/tortoise-hare/es09.mp3",
      voSeconds: 9.8,
      captions: [],
      spoken:
        "Y la moraleja del cuento es: despacio y sin parar se gana la carrera. Y a veces, está bien dejar el teléfono a un lado y seguir adelante. ¡Fin!",
    },
  },
];
