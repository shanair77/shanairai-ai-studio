/**
 * The Ant and the Grasshopper (Aesop), 2026 spin: the Grasshopper streams his songs all
 * summer from a little phone on a tripod, while the Ants fill a solar-powered pantry.
 * In winter his phone battery is empty and the field is snowy. Kind ending: the Ants
 * share, and he plays his guitar at their winter party.
 */

import type { StoryScene } from "../../kit";

export type SceneId = "title" | "summer" | "ants" | "invite" | "autumn" | "winter" | "knock" | "party" | "moral";

export type Scene = StoryScene & { id: SceneId };

/** What the narrator is asked to say (with ElevenLabs v4 tags), per scene. */
export const NARRATION: Record<SceneId, { en: string; es: string }> = {
  title: { en: "[warmly] The Ant... and the Grasshopper.", es: "[warmly] La Hormiga... y el Saltamontes." },
  summer: {
    en: '[warmly] Once upon a time, in a sunny summer field, lived a happy Grasshopper who loved to sing. Every day he played his little guitar and streamed his songs to all his friends. [cheerfully] "La la la! Summer is the best!"',
    es: "[warmly] Había una vez, en un soleado campo de verano, un saltamontes feliz al que le encantaba cantar. Cada día tocaba su guitarrita y transmitía sus canciones a todos sus amigos. [cheerfully] «¡La, la, la! ¡El verano es lo mejor!»",
  },
  ants: {
    en: 'Nearby, a busy line of Ants marched past, carrying seeds and berries. "Where are you going?" asked the Grasshopper. [proudly] "To our pantry," said the little Ant. "Our solar panels keep it cosy. We\'re saving food for winter."',
    es: "Cerca de allí, una fila de hormigas muy ocupadas pasaba cargando semillas y moras. «¿Adónde van?», preguntó el saltamontes. [proudly] «A nuestra despensa», dijo la hormiguita. «Nuestros paneles solares la mantienen calentita. Guardamos comida para el invierno.»",
  },
  invite: {
    en: '[laughs] "Winter? That\'s ages away!" laughed the Grasshopper. "Come and dance with me instead!" The little Ant smiled. "Maybe later. There\'s work to do." And off she marched, one, two, one, two.',
    es: "[laughs] «¿El invierno? ¡Falta muchísimo!», se rió el saltamontes. «¡Mejor ven a bailar conmigo!» La hormiguita sonrió. «Quizás después. Hay trabajo que hacer.» Y se fue marchando, un, dos, un, dos.",
  },
  autumn: {
    en: '[softly] The days grew shorter. The leaves turned orange and floated down. The Ants filled their pantry, all the way to the top. But the Grasshopper just kept singing... [cheerfully] "One more song!"',
    es: "[softly] Los días se hicieron más cortos. Las hojas se pusieron naranjas y cayeron flotando. Las hormigas llenaron su despensa hasta arriba. Pero el saltamontes seguía cantando... [cheerfully] «¡Una canción más!»",
  },
  winter: {
    en: '[softly] Then one morning, the field was covered in snow. [shivering] "Brrr!" The Grasshopper shivered. His phone battery was empty, and there was nothing to eat. [sadly] "Oh dear," he sighed. "I should have got ready."',
    es: "[softly] Entonces, una mañana, el campo amaneció cubierto de nieve. [shivering] «¡Brrr!» El saltamontes tiritaba. Su teléfono no tenía batería, y no había nada que comer. [sadly] «Ay, ay, ay», suspiró. «Debí prepararme.»",
  },
  knock: {
    en: 'He trudged through the snow to the Ants\' cosy home. Knock, knock. [sheepishly] "Hello... I\'m so cold and hungry. Could you help me, please?" The little Ant opened the door wide. [warmly] "Of course! Come inside!"',
    es: "Caminó por la nieve hasta la casita de las hormigas. Toc, toc. [sheepishly] «Hola... Tengo mucho frío y mucha hambre. ¿Me pueden ayudar, por favor?» La hormiguita abrió la puerta de par en par. [warmly] «¡Claro que sí! ¡Pasa!»",
  },
  party: {
    en: '[warmly] Inside, it was warm and bright. The Ants shared their soup and berries, and the Grasshopper played his guitar for a winter party! Everyone danced. [cheerfully] "Next summer," he said, "I\'ll help you fill the pantry!"',
    es: "[warmly] Adentro, todo era cálido y luminoso. Las hormigas compartieron su sopa y sus moras, ¡y el saltamontes tocó la guitarra en una fiesta de invierno! Todos bailaron. [cheerfully] «El próximo verano», dijo, «¡les ayudaré a llenar la despensa!»",
  },
  moral: {
    en: "[warmly] And the moral of the story is: work today, and you'll be ready for tomorrow. Play and share your songs, but get ready too. And when friends need help, it's kind to share. The end!",
    es: "[warmly] Y la moraleja del cuento es: trabaja hoy, y estarás listo para mañana. Juega y comparte tus canciones, pero prepárate también. Y cuando un amigo necesita ayuda, es bonito compartir. ¡Fin!",
  },
};

const V = (n: number) => `kids/ant-grasshopper/vo0${n}.mp3`;
const E = (n: number) => `kids/ant-grasshopper/es0${n}.mp3`;

export const SCENES: Scene[] = [
  {
    id: "title",
    label: "Title",
    vo: V(1),
    voSeconds: 2.69,
    lead: 1.6,
    tail: 1.6,
    captions: [],
    spoken: "The Ant... and the Grasshopper.",
    es: { vo: E(1), voSeconds: 2.69, captions: [], spoken: "La Hormiga... y el Saltamontes." },
  },
  {
    id: "summer",
    label: "Summer songs",
    vo: V(2),
    voSeconds: 14.92,
    lead: 0.6,
    tail: 1.2,
    captions: [
      "Once upon a time, in a sunny summer field, lived a happy Grasshopper who loved to sing.",
      "Every day he played his little guitar and streamed his songs to all his friends.",
      "“La la la! Summer is the best!”",
    ],
    es: {
      vo: E(2),
      voSeconds: 14.99,
      captions: [
        "Había una vez, en un soleado campo de verano, un saltamontes feliz al que le encantaba cantar.",
        "Cada día tocaba su guitarrita y transmitía sus canciones a todos sus amigos.",
        "«¡La, la, la! ¡El verano es lo mejor!»",
      ],
    },
  },
  {
    id: "ants",
    label: "The busy Ants",
    vo: V(3),
    voSeconds: 14.45,
    lead: 0.5,
    tail: 1.1,
    captions: [
      "Nearby, a busy line of Ants marched past, carrying seeds and berries.",
      "“Where are you going?” asked the Grasshopper.",
      "“To our pantry,” said the little Ant. “Our solar panels keep it cosy.",
      "We’re saving food for winter.”",
    ],
    es: {
      vo: E(3),
      voSeconds: 16.2,
      captions: [
        "Cerca de allí, una fila de hormigas muy ocupadas pasaba cargando semillas y moras.",
        "«¿Adónde van?», preguntó el saltamontes.",
        "«A nuestra despensa», dijo la hormiguita. «Nuestros paneles solares la mantienen calentita.",
        "Guardamos comida para el invierno.»",
      ],
    },
  },
  {
    id: "invite",
    label: "Come and dance",
    vo: V(4),
    voSeconds: 14.21,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "“Winter? That’s ages away!” laughed the Grasshopper.",
      "“Come and dance with me instead!”",
      "The little Ant smiled. “Maybe later. There’s work to do.”",
      "And off she marched, one, two, one, two.",
    ],
    es: {
      vo: E(4),
      voSeconds: 14.6,
      captions: [
        "«¿El invierno? ¡Falta muchísimo!», se rió el saltamontes.",
        "«¡Mejor ven a bailar conmigo!»",
        "La hormiguita sonrió. «Quizás después. Hay trabajo que hacer.»",
        "Y se fue marchando, un, dos, un, dos.",
      ],
    },
  },
  {
    id: "autumn",
    label: "Autumn leaves",
    vo: V(5),
    voSeconds: 12.36,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "The days grew shorter. The leaves turned orange and floated down.",
      "The Ants filled their pantry, all the way to the top.",
      "But the Grasshopper just kept singing… “One more song!”",
    ],
    es: {
      vo: E(5),
      voSeconds: 12.83,
      captions: [
        "Los días se hicieron más cortos. Las hojas se pusieron naranjas y cayeron flotando.",
        "Las hormigas llenaron su despensa hasta arriba.",
        "Pero el saltamontes seguía cantando… «¡Una canción más!»",
      ],
    },
  },
  {
    id: "winter",
    label: "Snow",
    vo: V(6),
    voSeconds: 13.64,
    lead: 0.6,
    tail: 1.2,
    captions: [
      "Then one morning, the field was covered in snow. “Brrr!” The Grasshopper shivered.",
      "His phone battery was empty, and there was nothing to eat.",
      "“Oh dear,” he sighed. “I should have got ready.”",
    ],
    es: {
      vo: E(6),
      voSeconds: 15.73,
      captions: [
        "Entonces, una mañana, el campo amaneció cubierto de nieve. «¡Brrr!» El saltamontes tiritaba.",
        "Su teléfono no tenía batería, y no había nada que comer.",
        "«Ay, ay, ay», suspiró. «Debí prepararme.»",
      ],
    },
  },
  {
    id: "knock",
    label: "Knock, knock",
    vo: V(7),
    voSeconds: 14.29,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "He trudged through the snow to the Ants’ cosy home. Knock, knock.",
      "“Hello… I’m so cold and hungry. Could you help me, please?”",
      "The little Ant opened the door wide. “Of course! Come inside!”",
    ],
    es: {
      vo: E(7),
      voSeconds: 14.76,
      captions: [
        "Caminó por la nieve hasta la casita de las hormigas. Toc, toc.",
        "«Hola… Tengo mucho frío y mucha hambre. ¿Me pueden ayudar, por favor?»",
        "La hormiguita abrió la puerta de par en par. «¡Claro que sí! ¡Pasa!»",
      ],
    },
  },
  {
    id: "party",
    label: "Winter party",
    vo: V(8),
    voSeconds: 13.4,
    lead: 0.5,
    tail: 1.4,
    captions: [
      "Inside, it was warm and bright. The Ants shared their soup and berries,",
      "and the Grasshopper played his guitar for a winter party! Everyone danced.",
      "“Next summer,” he said, “I’ll help you fill the pantry!”",
    ],
    es: {
      vo: E(8),
      voSeconds: 15.07,
      captions: [
        "Adentro, todo era cálido y luminoso. Las hormigas compartieron su sopa y sus moras,",
        "¡y el saltamontes tocó la guitarra en una fiesta de invierno! Todos bailaron.",
        "«El próximo verano», dijo, «¡les ayudaré a llenar la despensa!»",
      ],
    },
  },
  {
    id: "moral",
    label: "The moral",
    vo: V(9),
    voSeconds: 12.43,
    lead: 0.6,
    tail: 2.6,
    captions: [],
    spoken:
      "And the moral of the story is: work today, and you'll be ready for tomorrow. Play and share your songs, but get ready too. And when friends need help, it's kind to share. The end!",
    es: {
      vo: E(9),
      voSeconds: 13.64,
      captions: [],
      spoken:
        "Y la moraleja del cuento es: trabaja hoy, y estarás listo para mañana. Juega y comparte tus canciones, pero prepárate también. Y cuando un amigo necesita ayuda, es bonito compartir. ¡Fin!",
    },
  },
];
