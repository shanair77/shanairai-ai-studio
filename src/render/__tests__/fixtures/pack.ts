/**
 * render/__tests__/fixtures/pack — content the render tests point `renderVideo` at.
 *
 * A real module on disk rather than an inline object, because that is what
 * `renderVideo` consumes: packs are named by module specifier so the render bundle
 * can import the same one the host did. A fixture built any other way would not
 * exercise the loading path at all.
 *
 * The templates are deliberately trivial and asset-free. What is under test here is
 * the boundary — versions, stages, refusals — and a fixture with real media would
 * make every one of those tests depend on the media instead.
 */

import { defineScene } from "../../../composition";
import { defineTemplate } from "../../../templates";
import { SwatchScene, type SwatchSceneProps } from "./Swatch";
import { type AssetManifest } from "../../../manifest";
import { type CompilerConfig } from "../../../compiler";

/** A minimal, always-compilable template. Tailwind classes so the render proof can see them. */
export const cardTemplate = defineTemplate<{ title: string }>({
  name: "card",
  version: "1.4.2",
  format: "horizontal",
  parameters: {
    parameters: [{ key: "title", type: "string", default: "Hello" }],
  },
  build: (params) => ({
    scenes: [
      { scene: "hero", duration: 1, props: { title: params.title } },
      { scene: "outro", duration: 1, props: { title: "Done" } },
    ],
  }),
});

/**
 * The template the MP4 proof renders: one flat, Tailwind-coloured frame.
 *
 * Tiny on purpose — a second of 320x180 at 10fps is ten frames, which is enough to
 * prove a real encode happened and short enough to run in a test. It names no media
 * asset of any kind, so proving the render path costs no generated content.
 */
export const swatchTemplate = defineTemplate<{ label: string }>({
  name: "swatch",
  version: "2.0.0",
  parameters: {
    parameters: [{ key: "label", type: "string", default: "OK" }],
  },
  build: (params) => ({
    scenes: [{ scene: "swatch", duration: 1, props: { label: params.label } }],
    duration: 1,
  }),
});

/** Throws during `build` — the compile-stage failure, distinct from a bad request. */
export const brokenTemplate = defineTemplate({
  name: "broken",
  version: "0.0.1",
  build: () => {
    throw new Error("this template is intentionally broken");
  },
});

export const fixturePack: CompilerConfig<{
  card: typeof cardTemplate;
  broken: typeof brokenTemplate;
  swatch: typeof swatchTemplate;
}> = {
  templates: { card: cardTemplate, broken: brokenTemplate, swatch: swatchTemplate },
  scenes: { swatch: defineScene<SwatchSceneProps>({ component: SwatchScene }) },
};

/** A manifest naming a file that does not exist, to drive the readiness refusal. */
export const missingAssetManifest: AssetManifest = {
  project: "fixture",
  requirements: [
    {
      name: "absent",
      kind: "video",
      path: "fixture/definitely-not-here.mp4",
      purpose: "Prove readiness is checked before anything expensive starts",
      source: "generated",
      status: "present",
    },
  ],
};

/** The same pack, plus a manifest it can never satisfy. */
export const unreadyPack: CompilerConfig<{ card: typeof cardTemplate }> & { manifest: AssetManifest } = {
  templates: { card: cardTemplate },
  manifest: missingAssetManifest,
};
