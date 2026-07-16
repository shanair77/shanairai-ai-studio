/**
 * DemoConfig — a minimal, configuration-driven demo of the whole framework.
 *
 * Not a framework feature — this is integration/usage: a single `CompositionSchema` that
 * exercises the Composition Engine end to end using only existing scene primitives. Four
 * scenes (resolved by name from the Scene Registry) are sequenced with fade transitions by
 * the Timeline; each scene composes Typography + Motion + Theme inside the SafeArea.
 *
 * ~11s at 30fps (12.5s of scenes − three 0.5s fade overlaps), within the 10–15s target.
 */

import { type CompositionSchema } from "../composition";

export const demoConfig: CompositionSchema = {
  id: "Demo",
  format: "horizontal",
  fps: 30,
  theme: "light",
  transitions: { type: "fade", duration: 0.5 },
  timing: { defaultSceneDuration: 3 },
  scenes: [
    {
      scene: "hero",
      label: "Hero",
      duration: 3.5,
      props: {
        eyebrow: "Composition Engine",
        title: "AI Studio",
        subtitle: "A configuration-driven video framework",
        maxWidth: 1200,
      },
    },
    {
      scene: "centered",
      label: "Message",
      duration: 3,
      props: {
        eyebrow: "Phase 9 · Integration",
        title: "Everything composes",
        body: "Typography, motion, theme, and safe area — assembled from one config object.",
        maxWidth: 1000,
      },
    },
    {
      scene: "quote",
      label: "Quote",
      duration: 3,
      props: {
        quote: "Describe the video as data; let the engine build the frames.",
        attribution: "The Composition Builder",
        maxWidth: 1100,
      },
    },
    {
      scene: "outro",
      label: "Outro",
      duration: 3,
      props: {
        title: "Rendered end to end",
        subtitle: "Scene Registry → Timeline → Scenes → Motion",
        maxWidth: 1100,
      },
    },
  ],
};
