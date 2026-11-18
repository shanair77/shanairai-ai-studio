/**
 * The Lion and the Mouse (Aesop), with the 2026 spin: the Mouse zips about on a little
 * scooter, the Lion gets tangled in an old net someone left behind, and the two friends
 * finish by starting a savanna clean-up crew with recycling bins.
 */

import type { StoryScene } from "../../kit";

export type SceneId =
  | "title"
  | "nap"
  | "scooter"
  | "caught"
  | "laugh"
  | "net"
  | "rescue"
  | "crew"
  | "moral";

export type Scene = StoryScene & { id: SceneId };

export const SCENES: Scene[] = [
  {
    id: "title",
    label: "Title",
    vo: "kids/lion-mouse/vo01.mp3",
    voSeconds: 2.51,
    lead: 1.6,
    tail: 1.6,
    captions: [],
    spoken: "The Lion... and the Mouse.",
    es: {
      vo: "kids/lion-mouse/es01.mp3",
      voSeconds: 2.43,
      captions: [],
      spoken: "El León... y el Ratón.",
    },
  },
  {
    id: "nap",
    label: "The nap",
    vo: "kids/lion-mouse/vo02.mp3",
    voSeconds: 15.73,
    lead: 0.6,
    tail: 1.0,
    captions: [
      "Once upon a time, on a wide golden savanna,",
      "a great big Lion was taking his afternoon nap.",
      "He snored under a shady tree, his fluffy mane rising and falling.",
      "Rumble… rumble… went his snores.",
    ],
    es: {
      vo: "kids/lion-mouse/es02.mp3",
      voSeconds: 17.32,
      captions: [
        "Había una vez, en una sabana ancha y dorada,",
        "un león grandote que dormía su siesta de la tarde.",
        "Roncaba bajo un árbol con sombra, y su melena esponjosa subía y bajaba.",
        "Rrrrum… rrrrum… hacían sus ronquidos.",
      ],
    },
  },
  {
    id: "scooter",
    label: "The scooter",
    vo: "kids/lion-mouse/vo03.mp3",
    voSeconds: 13.01,
    lead: 0.5,
    tail: 1.0,
    captions: [
      "Along came a tiny Mouse on her little red scooter, zooming home for dinner.",
      "Zip! Zoom! Oops!",
      "She rolled right up the Lion’s tail, over his back, and onto the tip of his nose!",
    ],
    es: {
      vo: "kids/lion-mouse/es03.mp3",
      voSeconds: 13.56,
      captions: [
        "De pronto llegó una ratoncita en su pequeño scooter rojo, de regreso a casa para cenar.",
        "¡Zip! ¡Zum! ¡Uy!",
        "¡Subió rodando por la cola del león, por su espalda, y hasta la puntita de su nariz!",
      ],
    },
  },
  {
    id: "caught",
    label: "Caught",
    vo: "kids/lion-mouse/vo04.mp3",
    voSeconds: 14.6,
    lead: 0.5,
    tail: 1.0,
    captions: [
      "The Lion opened one big eye, and gently scooped her up in his paw.",
      "“Who is tickling my nose?” he rumbled.",
      "“Oh, please let me go!” squeaked the Mouse.",
      "“One day, I will help you too!”",
    ],
    es: {
      vo: "kids/lion-mouse/es04.mp3",
      voSeconds: 15.57,
      captions: [
        "El león abrió un ojo enorme y, con cuidado, la levantó en su pata.",
        "«¿Quién me hace cosquillas en la nariz?», rugió suavecito.",
        "«¡Ay, por favor, suéltame!», chilló la ratoncita.",
        "«¡Un día, yo también te ayudaré!»",
      ],
    },
  },
  {
    id: "laugh",
    label: "The laugh",
    vo: "kids/lion-mouse/vo05.mp3",
    voSeconds: 13.95,
    lead: 0.5,
    tail: 1.2,
    captions: [
      "The Lion laughed so hard, his mane wobbled.",
      "“Ho ho ho! A tiny mouse, helping a big lion like me?”",
      "But he was kind, so he opened his paw, and off she scooted.",
    ],
    es: {
      vo: "kids/lion-mouse/es05.mp3",
      voSeconds: 13.71,
      captions: [
        "El león se rió tanto que su melena se sacudió.",
        "«¡Jo, jo, jo! ¿Una ratoncita ayudando a un león tan grande como yo?»",
        "Pero era bondadoso, así que abrió su pata, y ella se fue en su scooter.",
      ],
    },
  },
  {
    id: "net",
    label: "The net",
    vo: "kids/lion-mouse/vo06.mp3",
    voSeconds: 16.27,
    lead: 0.5,
    tail: 1.0,
    captions: [
      "A few days later, the Lion went for a stroll through the long grass,",
      "and his paw got stuck in an old, tangled net that someone had left behind.",
      "The more he wriggled, the more tangled he got.",
      "“Help!” he roared. “Can anybody help me?”",
    ],
    es: {
      vo: "kids/lion-mouse/es06.mp3",
      voSeconds: 16.43,
      captions: [
        "Unos días después, el león salió a pasear por la hierba alta,",
        "y su pata quedó atrapada en una red vieja y enredada que alguien había dejado tirada.",
        "Mientras más se movía, más se enredaba.",
        "«¡Ayuda!», rugió. «¿Alguien me puede ayudar?»",
      ],
    },
  },
  {
    id: "rescue",
    label: "The rescue",
    vo: "kids/lion-mouse/vo07.mp3",
    voSeconds: 15.73,
    lead: 0.4,
    tail: 1.2,
    captions: [
      "Far away, the Mouse heard the roar, and she scooted over as fast as she could.",
      "“Hold still, my friend,” she said.",
      "Nibble, nibble, snip! Nibble, nibble, snip!",
      "One by one, she chewed through the ropes, until the Lion was free.",
    ],
    es: {
      vo: "kids/lion-mouse/es07.mp3",
      voSeconds: 15.73,
      captions: [
        "A lo lejos, la ratoncita oyó el rugido y fue en su scooter tan rápido como pudo.",
        "«Quédate quieto, amigo», le dijo.",
        "¡Ñam, ñam, clic! ¡Ñam, ñam, clic!",
        "Una por una, mordió las cuerdas, hasta que el león quedó libre.",
      ],
    },
  },
  {
    id: "crew",
    label: "The clean-up crew",
    vo: "kids/lion-mouse/vo08.mp3",
    voSeconds: 16.67,
    lead: 0.5,
    tail: 1.4,
    captions: [
      "The Lion gave her a gentle, grateful hug. “You were right, little friend,” he said.",
      "Then together, they picked up the old net, and all the litter in the grass,",
      "and sorted it into the recycling bins.",
      "And that was the start of the best clean-up crew on the savanna!",
    ],
    es: {
      vo: "kids/lion-mouse/es08.mp3",
      voSeconds: 17.4,
      captions: [
        "El león le dio un abrazo suave y agradecido. «Tenías razón, amiguita», le dijo.",
        "Luego, juntos, recogieron la red vieja y toda la basura de la hierba,",
        "y la separaron en los botes de reciclaje.",
        "¡Y así comenzó el mejor equipo de limpieza de toda la sabana!",
      ],
    },
  },
  {
    id: "moral",
    label: "The moral",
    vo: "kids/lion-mouse/vo09.mp3",
    voSeconds: 10.76,
    lead: 0.6,
    tail: 2.6,
    captions: [],
    spoken:
      "And the moral of the story is: no act of kindness is ever too small. Even little friends can do big things, for each other, and for our planet. The end!",
    es: {
      vo: "kids/lion-mouse/es09.mp3",
      voSeconds: 12.67,
      captions: [],
      spoken:
        "Y la moraleja del cuento es: ningún acto de bondad es demasiado pequeño. Hasta los amigos más pequeños pueden hacer cosas grandes, por los demás y por nuestro planeta. ¡Fin!",
    },
  },
];
