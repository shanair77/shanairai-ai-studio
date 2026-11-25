/**
 * Little Red Riding Hood (Grimm / Perrault), 2026 spin: Red is a little bunny in a red hooded
 * cape whose step-counter watch beeps the way through the wood to Grandma's cottage. The
 * series' grumpy wolf zooms down a shortcut on an e-scooter. Gentle: Grandma sees his ears
 * through the window and hides in the wardrobe; the wolf only wants the muffins. Red presses
 * the help button on her watch and a kind beaver woodcutter shoos the wolf away. Nobody is
 * eaten or hurt.
 */

import type { StoryScene } from "../../kit";

export type SceneId = "title" | "home" | "path" | "chat" | "shortcut" | "bed" | "teeth" | "woodcutter" | "moral";

export type Scene = StoryScene & { id: SceneId };

/** What the narrator is asked to say (with ElevenLabs v4 tags), per scene. */
export const NARRATION: Record<SceneId, { en: string; es: string }> = {
  title: { en: "[warmly] Little Red Riding Hood.", es: "[warmly] Caperucita Roja." },
  home: {
    en: '[warmly] Once upon a time, at the edge of a leafy green wood, lived a little bunny with a bright red hooded cape. Everyone called her Little Red Riding Hood. One morning, her mum packed a basket of muffins for Grandma, who was feeling poorly. [kindly] "Stay on the path, follow your watch, and don\'t chat with strangers!"',
    es: "[warmly] Había una vez, a la orilla de un bosque verde y frondoso, una conejita con una capa roja con capucha. Todos la llamaban Caperucita Roja. Una mañana, su mamá preparó una canasta de panquecitos para la abuelita, que estaba enfermita. [kindly] «Quédate en el camino, sigue tu reloj, ¡y no hables con desconocidos!»",
  },
  path: {
    en: 'Red\'s little watch beeped the way. [cheerfully] "Two thousand steps to Grandma\'s!" She skipped along the path, past ferns and buttercups. Then, from behind a tree, out stepped a wolf with a big, sly grin.',
    es: "El relojito de Caperucita marcaba el camino con un bip. [cheerfully] «¡Dos mil pasos hasta la casa de la abuelita!» Iba saltando por el camino, entre helechos y florecitas amarillas. Entonces, de detrás de un árbol, salió un lobo con una gran sonrisa pícara.",
  },
  chat: {
    en: '[smoothly] "Good morning, little bunny. Where are you off to?" Red forgot all about what Mum had said. [cheerfully] "To Grandma\'s cottage, at the end of the path!" [slyly] "How lovely," said the wolf. "Why not pick her some flowers?"',
    es: "[smoothly] «Buenos días, conejita. ¿Adónde vas?» Caperucita se olvidó de lo que le había dicho su mamá. [cheerfully] «¡A la casita de mi abuelita, al final del camino!» [slyly] «Qué bonito», dijo el lobo. «¿Por qué no le llevas unas flores?»",
  },
  shortcut: {
    en: 'While Red picked flowers, the wolf hopped on an e-scooter and zoomed down a shortcut. Knock, knock! [in a squeaky voice] "Grandma, it\'s me, Red!" But Grandma peeked through the window and saw two furry grey ears. [whispering] Quick as a wink, she hid in the wardrobe.',
    es: "Mientras Caperucita juntaba flores, el lobo se subió a una patineta eléctrica y se fue zumbando por un atajo. ¡Toc, toc! [in a squeaky voice] «Abuelita, ¡soy yo, Caperucita!» Pero la abuelita se asomó por la ventana y vio dos orejas grises y peludas. [whispering] En un abrir y cerrar de ojos, se escondió en el ropero.",
  },
  bed: {
    en: 'The wolf put on Grandma\'s nightcap and glasses, and jumped into her bed. Soon, Red arrived. [curiously] "Grandma, what big ears you have!" "All the better to hear you with!" "Grandma, what big eyes you have!" "All the better to see you with!"',
    es: "El lobo se puso el gorro de dormir y los lentes de la abuelita, y se metió en su cama. Pronto llegó Caperucita. [curiously] «Abuelita, ¡qué orejas tan grandes tienes!» «¡Son para oírte mejor!» «Abuelita, ¡qué ojos tan grandes tienes!» «¡Son para verte mejor!»",
  },
  teeth: {
    en: '[nervously] "Grandma... what big teeth you have!" [playfully growling] "All the better to... gobble up your muffins!" The wolf leapt out of bed and grabbed the basket. [gasps] Red pressed the help button on her watch. Beep, beep, beep!',
    es: "[nervously] «Abuelita... ¡qué dientes tan grandes tienes!» [playfully growling] «¡Son para... comerme tus panquecitos!» El lobo saltó de la cama y agarró la canasta. [gasps] Caperucita apretó el botón de ayuda de su reloj. ¡Bip, bip, bip!",
  },
  woodcutter: {
    en: 'In a flash, a kind beaver woodcutter came stomping in. [firmly] "Shoo, wolf! Off you go!" The wolf dropped the basket and ran far, far away into the woods. Out of the wardrobe popped Grandma, and Red gave her a great big hug. Then they shared the muffins, together.',
    es: "En un instante, llegó un castor leñador muy amable, pisando fuerte. [firmly] «¡Fuera, lobo! ¡Vete de aquí!» El lobo soltó la canasta y corrió lejos, muy lejos, por el bosque. La abuelita salió del ropero, y Caperucita le dio un abrazo muy grande. Y luego compartieron los panquecitos, juntas.",
  },
  moral: {
    en: "[warmly] And the moral of the story is: stay on the path, and don't tell strangers your plans. And if you ever need help, ask a grown-up you trust. The end!",
    es: "[warmly] Y la moraleja del cuento es: quédate en el camino, y no les cuentes tus planes a los desconocidos. Y si alguna vez necesitas ayuda, pídesela a un adulto de confianza. ¡Fin!",
  },
};

const n2 = (n: number) => String(n).padStart(2, "0");
const V = (n: number) => `kids/red-hood/vo${n2(n)}.mp3`;
const E = (n: number) => `kids/red-hood/es${n2(n)}.mp3`;

export const SCENES: Scene[] = [
  {
    id: "title",
    label: "Title",
    vo: V(1),
    voSeconds: 2.19,
    lead: 1.6,
    tail: 1.6,
    captions: [],
    spoken: "Little Red Riding Hood.",
    es: { vo: E(1), voSeconds: 1.72, captions: [], spoken: "Caperucita Roja." },
  },
  {
    id: "home",
    label: "Red and the basket",
    vo: V(2),
    voSeconds: 20.11,
    lead: 0.6,
    tail: 1.2,
    captions: [
      "Once upon a time, at the edge of a leafy green wood, lived a little bunny with a bright red hooded cape.",
      "Everyone called her Little Red Riding Hood.",
      "One morning, her mum packed a basket of muffins for Grandma, who was feeling poorly.",
      "“Stay on the path, follow your watch, and don’t chat with strangers!”",
    ],
    es: {
      vo: E(2),
      voSeconds: 20.61,
      captions: [
        "Había una vez, a la orilla de un bosque verde y frondoso, una conejita con una capa roja con capucha.",
        "Todos la llamaban Caperucita Roja.",
        "Una mañana, su mamá preparó una canasta de panquecitos para la abuelita, que estaba enfermita.",
        "«Quédate en el camino, sigue tu reloj, ¡y no hables con desconocidos!»",
      ],
    },
  },
  {
    id: "path",
    label: "Along the path",
    vo: V(3),
    voSeconds: 13.56,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "Red’s little watch beeped the way. “Two thousand steps to Grandma’s!”",
      "She skipped along the path, past ferns and buttercups.",
      "Then, from behind a tree, out stepped a wolf with a big, sly grin.",
    ],
    es: {
      vo: E(3),
      voSeconds: 16.77,
      captions: [
        "El relojito de Caperucita marcaba el camino con un bip. «¡Dos mil pasos hasta la casa de la abuelita!»",
        "Iba saltando por el camino, entre helechos y florecitas amarillas.",
        "Entonces, de detrás de un árbol, salió un lobo con una gran sonrisa pícara.",
      ],
    },
  },
  {
    id: "chat",
    label: "The wolf asks",
    vo: V(4),
    voSeconds: 13.01,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "“Good morning, little bunny. Where are you off to?”",
      "Red forgot all about what Mum had said. “To Grandma’s cottage, at the end of the path!”",
      "“How lovely,” said the wolf. “Why not pick her some flowers?”",
    ],
    es: {
      vo: E(4),
      voSeconds: 13.71,
      captions: [
        "«Buenos días, conejita. ¿Adónde vas?»",
        "Caperucita se olvidó de lo que le había dicho su mamá. «¡A la casita de mi abuelita, al final del camino!»",
        "«Qué bonito», dijo el lobo. «¿Por qué no le llevas unas flores?»",
      ],
    },
  },
  {
    id: "shortcut",
    label: "The shortcut",
    vo: V(5),
    voSeconds: 15.88,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "While Red picked flowers, the wolf hopped on an e-scooter and zoomed down a shortcut.",
      "Knock, knock! “Grandma, it’s me, Red!”",
      "But Grandma peeked through the window and saw two furry grey ears.",
      "Quick as a wink, she hid in the wardrobe.",
    ],
    es: {
      vo: E(5),
      voSeconds: 19.64,
      captions: [
        "Mientras Caperucita juntaba flores, el lobo se subió a una patineta eléctrica y se fue zumbando por un atajo.",
        "¡Toc, toc! «Abuelita, ¡soy yo, Caperucita!»",
        "Pero la abuelita se asomó por la ventana y vio dos orejas grises y peludas.",
        "En un abrir y cerrar de ojos, se escondió en el ropero.",
      ],
    },
  },
  {
    id: "bed",
    label: "What big ears",
    vo: V(6),
    voSeconds: 16.27,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "The wolf put on Grandma’s nightcap and glasses, and jumped into her bed. Soon, Red arrived.",
      "“Grandma, what big ears you have!” “All the better to hear you with!”",
      "“Grandma, what big eyes you have!” “All the better to see you with!”",
    ],
    es: {
      vo: E(6),
      voSeconds: 17.55,
      captions: [
        "El lobo se puso el gorro de dormir y los lentes de la abuelita, y se metió en su cama. Pronto llegó Caperucita.",
        "«Abuelita, ¡qué orejas tan grandes tienes!» «¡Son para oírte mejor!»",
        "«Abuelita, ¡qué ojos tan grandes tienes!» «¡Son para verte mejor!»",
      ],
    },
  },
  {
    id: "teeth",
    label: "What big teeth",
    vo: V(7),
    voSeconds: 14.37,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "“Grandma… what big teeth you have!”",
      "“All the better to… gobble up your muffins!”",
      "The wolf leapt out of bed and grabbed the basket.",
      "Red pressed the help button on her watch. Beep, beep, beep!",
    ],
    es: {
      vo: E(7),
      voSeconds: 14.76,
      captions: [
        "«Abuelita… ¡qué dientes tan grandes tienes!»",
        "«¡Son para… comerme tus panquecitos!»",
        "El lobo saltó de la cama y agarró la canasta.",
        "Caperucita apretó el botón de ayuda de su reloj. ¡Bip, bip, bip!",
      ],
    },
  },
  {
    id: "woodcutter",
    label: "The woodcutter",
    vo: V(8),
    voSeconds: 18.52,
    lead: 0.5,
    tail: 1.4,
    captions: [
      "In a flash, a kind beaver woodcutter came stomping in. “Shoo, wolf! Off you go!”",
      "The wolf dropped the basket and ran far, far away into the woods.",
      "Out of the wardrobe popped Grandma, and Red gave her a great big hug.",
      "Then they shared the muffins, together.",
    ],
    es: {
      vo: E(8),
      voSeconds: 20.61,
      captions: [
        "En un instante, llegó un castor leñador muy amable, pisando fuerte. «¡Fuera, lobo! ¡Vete de aquí!»",
        "El lobo soltó la canasta y corrió lejos, muy lejos, por el bosque.",
        "La abuelita salió del ropero, y Caperucita le dio un abrazo muy grande.",
        "Y luego compartieron los panquecitos, juntas.",
      ],
    },
  },
  {
    id: "moral",
    label: "The moral",
    vo: V(9),
    voSeconds: 9.87,
    lead: 0.6,
    tail: 2.6,
    captions: [],
    spoken: "And the moral of the story is: stay on the path, and don't tell strangers your plans. And if you ever need help, ask a grown-up you trust. The end!",
    es: {
      vo: E(9),
      voSeconds: 11.08,
      captions: [],
      spoken:
        "Y la moraleja del cuento es: quédate en el camino, y no les cuentes tus planes a los desconocidos. Y si alguna vez necesitas ayuda, pídesela a un adulto de confianza. ¡Fin!",
    },
  },
];
