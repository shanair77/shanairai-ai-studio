/**
 * Goldilocks and the Three Bears (English folk tale), 2026 spin: the Bears leave their forest
 * cabin for a bike ride while the porridge cools. Goldilocks, a little lamb with golden curls,
 * knocks; the Bears' smart speaker says "Nobody's home!", but the door is open a crack. Porridge,
 * chairs, beds. The speaker tells the Bears there's a visitor upstairs. Kind ending: Goldilocks
 * says sorry, helps fix the little chair, and next time rings the doorbell and waits.
 */

import type { StoryScene } from "../../kit";

export type SceneId = "title" | "cabin" | "knock" | "porridge" | "chairs" | "beds" | "home" | "found" | "fix" | "moral";

export type Scene = StoryScene & { id: SceneId };

/** What the narrator is asked to say (with ElevenLabs v4 tags), per scene. */
export const NARRATION: Record<SceneId, { en: string; es: string }> = {
  title: { en: "[warmly] Goldilocks... and the Three Bears.", es: "[warmly] Ricitos de Oro... y los Tres Osos." },
  cabin: {
    en: '[warmly] Once upon a time, in a cozy cabin deep in the forest, there lived three bears: big Papa Bear, middle-sized Mama Bear, and little Baby Bear. One morning, their porridge was too hot to eat. [cheerfully] "Let\'s go for a bike ride while it cools!" said Mama Bear. So off they pedalled.',
    es: "[warmly] Había una vez, en una cabaña acogedora en lo profundo del bosque, tres osos: el grande Papá Oso, la mediana Mamá Osa, y el pequeño Osito. Una mañana, su avena estaba demasiado caliente para comer. [cheerfully] «¡Vamos a dar un paseo en bici mientras se enfría!», dijo Mamá Osa. Y allá se fueron, pedaleando.",
  },
  knock: {
    en: 'Soon, a little lamb with golden curls came skipping down the path. Her name was Goldilocks. She knocked on the cabin door. Knock, knock! The bears\' smart speaker beeped. [robotic voice] "Hello! Nobody\'s home!" [whispering] But the door was open just a crack... and Goldilocks tiptoed inside.',
    es: "Al poco rato, una ovejita de rizos dorados llegó saltando por el sendero. Se llamaba Ricitos de Oro. Tocó la puerta de la cabaña. ¡Toc, toc! El altavoz inteligente de los osos hizo bip. [robotic voice] «¡Hola! ¡No hay nadie en casa!» [whispering] Pero la puerta estaba un poquito abierta... y Ricitos de Oro entró de puntitas.",
  },
  porridge: {
    en: 'On the table were three bowls of porridge. She tasted the big bowl. [surprised] "Ooh, too hot!" She tasted the middle bowl. [shivering] "Brr, too cold!" Then she tasted the little bowl. [happily] "Mmm, just right!" And she ate it all up.',
    es: "En la mesa había tres platos de avena. Probó el plato grande. [surprised] «¡Uy, muy caliente!» Probó el plato mediano. [shivering] «¡Brr, muy fría!» Luego probó el platito pequeño. [happily] «¡Mmm, perfecta!» Y se la comió toda.",
  },
  chairs: {
    en: 'Next, she found three chairs. The big chair was too hard. The middle chair was too squishy. The little chair was just right! But she rocked and wiggled and... [gasps] crack! The little chair broke into pieces. [worried] "Oh no!" said Goldilocks.',
    es: "Después, encontró tres sillas. La silla grande era muy dura. La silla mediana era muy blandita. ¡La sillita pequeña era perfecta! Pero se meció y se meneó y... [gasps] ¡crac! La sillita se rompió en pedazos. [worried] «¡Ay, no!», dijo Ricitos de Oro.",
  },
  beds: {
    en: "[yawning] Now Goldilocks felt very sleepy. Upstairs were three beds. The big bed was too high. The middle bed was too soft. But the little bed, with its glowing star night-light, was just right. [whispering] And she fell fast asleep.",
    es: "[yawning] Ahora Ricitos de Oro tenía mucho sueño. Arriba había tres camas. La cama grande era muy alta. La cama mediana era muy blanda. Pero la camita pequeña, con su lucecita de estrella, era perfecta. [whispering] Y se quedó profundamente dormida.",
  },
  home: {
    en: '[cheerfully] Then the bears pedalled home. [deep voice] "Someone\'s been eating my porridge!" said Papa Bear. "Someone\'s been sitting in my chair!" said Mama Bear. [squeaky voice] "Someone ate all my porridge," cried Baby Bear, "and broke my chair!" The smart speaker beeped. [robotic voice] "Visitor upstairs!"',
    es: "[cheerfully] Entonces los osos volvieron pedaleando a casa. [deep voice] «¡Alguien ha comido de mi avena!», dijo Papá Oso. «¡Alguien se ha sentado en mi silla!», dijo Mamá Osa. [squeaky voice] «¡Alguien se comió toda mi avena», lloró Osito, «y rompió mi sillita!» El altavoz inteligente hizo bip. [robotic voice] «¡Visita en el piso de arriba!»",
  },
  found: {
    en: '[whispering] The bears tiptoed upstairs. [squeaky voice] "Someone\'s sleeping in my bed!" said Baby Bear. [gasps] Goldilocks woke up with a jump. Three bears! But they weren\'t cross, just surprised. [sincerely] "I\'m so sorry," said Goldilocks. "I came in without asking."',
    es: "[whispering] Los osos subieron de puntitas. [squeaky voice] «¡Alguien está durmiendo en mi camita!», dijo Osito. [gasps] Ricitos de Oro se despertó de un salto. ¡Tres osos! Pero no estaban enojados, solo sorprendidos. [sincerely] «Lo siento mucho», dijo Ricitos de Oro. «Entré sin preguntar.»",
  },
  fix: {
    en: "[warmly] So Goldilocks helped Papa Bear glue the little chair back together, and Mama Bear made a fresh pot of porridge for everyone. Baby Bear and Goldilocks became the best of friends. And the next time she came to visit, she rang the doorbell and waited.",
    es: "[warmly] Así que Ricitos de Oro ayudó a Papá Oso a pegar la sillita, y Mamá Osa preparó una olla nueva de avena para todos. Osito y Ricitos de Oro se hicieron mejores amigos. Y la siguiente vez que vino de visita, tocó el timbre y esperó.",
  },
  moral: {
    en: "[warmly] And the moral of the story is: always ask before you go in, or take what isn't yours. And if you make a mistake, say sorry and help put it right! The end!",
    es: "[warmly] Y la moraleja del cuento es: pide permiso siempre antes de entrar, o de tomar lo que no es tuyo. Y si te equivocas, pide perdón y ayuda a arreglarlo. ¡Fin!",
  },
};

const n2 = (n: number) => String(n).padStart(2, "0");
const V = (n: number) => `kids/goldilocks/vo${n2(n)}.mp3`;
const E = (n: number) => `kids/goldilocks/es${n2(n)}.mp3`;

export const SCENES: Scene[] = [
  {
    id: "title",
    label: "Title",
    vo: V(1),
    voSeconds: 3.08,
    lead: 1.6,
    tail: 1.4,
    captions: [],
    spoken: "Goldilocks... and the Three Bears.",
    es: { vo: E(1), voSeconds: 3.4, captions: [], spoken: "Ricitos de Oro... y los Tres Osos." },
  },
  {
    id: "cabin",
    label: "The three bears",
    vo: V(2),
    voSeconds: 19.15,
    lead: 0.6,
    tail: 1.2,
    captions: [
      "Once upon a time, in a cozy cabin deep in the forest, there lived three bears:",
      "big Papa Bear, middle-sized Mama Bear, and little Baby Bear.",
      "One morning, their porridge was too hot to eat.",
      "“Let’s go for a bike ride while it cools!” said Mama Bear. So off they pedalled.",
    ],
    es: {
      vo: E(2),
      voSeconds: 20.61,
      captions: [
        "Había una vez, en una cabaña acogedora en lo profundo del bosque, tres osos:",
        "el grande Papá Oso, la mediana Mamá Osa, y el pequeño Osito.",
        "Una mañana, su avena estaba demasiado caliente para comer.",
        "«¡Vamos a dar un paseo en bici mientras se enfría!», dijo Mamá Osa. Y allá se fueron, pedaleando.",
      ],
    },
  },
  {
    id: "knock",
    label: "Knock, knock",
    vo: V(3),
    voSeconds: 19.64,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "Soon, a little lamb with golden curls came skipping down the path. Her name was Goldilocks.",
      "She knocked on the cabin door. Knock, knock!",
      "The bears’ smart speaker beeped. “Hello! Nobody’s home!”",
      "But the door was open just a crack… and Goldilocks tiptoed inside.",
    ],
    es: {
      vo: E(3),
      voSeconds: 22.05,
      captions: [
        "Al poco rato, una ovejita de rizos dorados llegó saltando por el sendero. Se llamaba Ricitos de Oro.",
        "Tocó la puerta de la cabaña. ¡Toc, toc!",
        "El altavoz inteligente de los osos hizo bip. «¡Hola! ¡No hay nadie en casa!»",
        "Pero la puerta estaba un poquito abierta… y Ricitos de Oro entró de puntitas.",
      ],
    },
  },
  {
    id: "porridge",
    label: "Three bowls of porridge",
    vo: V(4),
    voSeconds: 15.96,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "On the table were three bowls of porridge.",
      "She tasted the big bowl. “Ooh, too hot!” She tasted the middle bowl. “Brr, too cold!”",
      "Then she tasted the little bowl. “Mmm, just right!”",
      "And she ate it all up.",
    ],
    es: {
      vo: E(4),
      voSeconds: 15.65,
      captions: [
        "En la mesa había tres platos de avena.",
        "Probó el plato grande. «¡Uy, muy caliente!» Probó el plato mediano. «¡Brr, muy fría!»",
        "Luego probó el platito pequeño. «¡Mmm, perfecta!»",
        "Y se la comió toda.",
      ],
    },
  },
  {
    id: "chairs",
    label: "Three chairs",
    vo: V(5),
    voSeconds: 18.91,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "Next, she found three chairs. The big chair was too hard. The middle chair was too squishy.",
      "The little chair was just right!",
      "But she rocked and wiggled and… crack! The little chair broke into pieces.",
      "“Oh no!” said Goldilocks.",
    ],
    es: {
      vo: E(5),
      voSeconds: 19.96,
      captions: [
        "Después, encontró tres sillas. La silla grande era muy dura. La silla mediana era muy blandita.",
        "¡La sillita pequeña era perfecta!",
        "Pero se meció y se meneó y… ¡crac! La sillita se rompió en pedazos.",
        "«¡Ay, no!», dijo Ricitos de Oro.",
      ],
    },
  },
  {
    id: "beds",
    label: "Three beds",
    vo: V(6),
    voSeconds: 18.76,
    lead: 0.5,
    tail: 1.4,
    captions: [
      "Now Goldilocks felt very sleepy. Upstairs were three beds.",
      "The big bed was too high. The middle bed was too soft.",
      "But the little bed, with its glowing star night-light, was just right.",
      "And she fell fast asleep.",
    ],
    es: {
      vo: E(6),
      voSeconds: 19.64,
      captions: [
        "Ahora Ricitos de Oro tenía mucho sueño. Arriba había tres camas.",
        "La cama grande era muy alta. La cama mediana era muy blanda.",
        "Pero la camita pequeña, con su lucecita de estrella, era perfecta.",
        "Y se quedó profundamente dormida.",
      ],
    },
  },
  {
    id: "home",
    label: "The bears come home",
    vo: V(7),
    voSeconds: 17.55,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "Then the bears pedalled home. “Someone’s been eating my porridge!” said Papa Bear.",
      "“Someone’s been sitting in my chair!” said Mama Bear.",
      "“Someone ate all my porridge,” cried Baby Bear, “and broke my chair!”",
      "The smart speaker beeped. “Visitor upstairs!”",
    ],
    es: {
      vo: E(7),
      voSeconds: 20.04,
      captions: [
        "Entonces los osos volvieron pedaleando a casa. «¡Alguien ha comido de mi avena!», dijo Papá Oso.",
        "«¡Alguien se ha sentado en mi silla!», dijo Mamá Osa.",
        "«¡Alguien se comió toda mi avena», lloró Osito, «y rompió mi sillita!»",
        "El altavoz inteligente hizo bip. «¡Visita en el piso de arriba!»",
      ],
    },
  },
  {
    id: "found",
    label: "Someone's in my bed",
    vo: V(8),
    voSeconds: 16.93,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "The bears tiptoed upstairs. “Someone’s sleeping in my bed!” said Baby Bear.",
      "Goldilocks woke up with a jump. Three bears!",
      "But they weren’t cross, just surprised.",
      "“I’m so sorry,” said Goldilocks. “I came in without asking.”",
    ],
    es: {
      vo: E(8),
      voSeconds: 18.29,
      captions: [
        "Los osos subieron de puntitas. «¡Alguien está durmiendo en mi camita!», dijo Osito.",
        "Ricitos de Oro se despertó de un salto. ¡Tres osos!",
        "Pero no estaban enojados, solo sorprendidos.",
        "«Lo siento mucho», dijo Ricitos de Oro. «Entré sin preguntar.»",
      ],
    },
  },
  {
    id: "fix",
    label: "Fixing the little chair",
    vo: V(9),
    voSeconds: 14.99,
    lead: 0.5,
    tail: 1.6,
    captions: [
      "So Goldilocks helped Papa Bear glue the little chair back together,",
      "and Mama Bear made a fresh pot of porridge for everyone.",
      "Baby Bear and Goldilocks became the best of friends.",
      "And the next time she came to visit, she rang the doorbell and waited.",
    ],
    es: {
      vo: E(9),
      voSeconds: 15.23,
      captions: [
        "Así que Ricitos de Oro ayudó a Papá Oso a pegar la sillita,",
        "y Mamá Osa preparó una olla nueva de avena para todos.",
        "Osito y Ricitos de Oro se hicieron mejores amigos.",
        "Y la siguiente vez que vino de visita, tocó el timbre y esperó.",
      ],
    },
  },
  {
    id: "moral",
    label: "The moral",
    vo: V(10),
    voSeconds: 10.27,
    lead: 0.6,
    tail: 2.6,
    captions: [],
    spoken: "And the moral of the story is: always ask before you go in, or take what isn't yours. And if you make a mistake, say sorry and help put it right! The end!",
    es: {
      vo: E(10),
      voSeconds: 10.68,
      captions: [],
      spoken: "Y la moraleja del cuento es: pide permiso siempre antes de entrar, o de tomar lo que no es tuyo. Y si te equivocas, pide perdón y ayuda a arreglarlo. ¡Fin!",
    },
  },
];
