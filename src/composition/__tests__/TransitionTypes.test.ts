import { describe, expectTypeOf, it } from "vitest";
import type { CompositionSchema, TransitionConfig } from "../CompositionSchema";
import type { OptionsOf, SlideOptions } from "../../transitions";
import { builtinTransitions, transitionRegistry } from "../../transitions";
import { buildComposition } from "../CompositionBuilder";
import { sceneRegistry } from "../SceneRegistry";

// Type-level suite (checked by test:typecheck). `@ts-expect-error` lines fail the typecheck
// if they stop erroring — a permanent guard on transition names + options.

describe("typed transition config", () => {
  it("infers each transition's options from the registry", () => {
    expectTypeOf<OptionsOf<(typeof builtinTransitions)["slide"]>>().toEqualTypeOf<SlideOptions>();
    // A slide transition config carries slide options.
    type SlideCfg = Extract<TransitionConfig, { type: "slide" }>;
    expectTypeOf<NonNullable<SlideCfg["options"]>>().toEqualTypeOf<SlideOptions>();
  });

  it("accepts valid transition names and options", () => {
    const ok: CompositionSchema = {
      id: "ok",
      transitions: { type: "fade", duration: 0.5 }, // backward-compatible
      scenes: [
        { scene: "hero", duration: 1, transition: { type: "slide", options: { direction: "from-left" } } },
        { scene: "outro", duration: 1, transition: { type: "dissolve" } },
      ],
    };
    expectTypeOf(ok).toBeObject();
    void ok;
  });

  it("rejects unknown transition names and bad options at compile time", () => {
    const badName: CompositionSchema = {
      id: "bad",
      // @ts-expect-error "sldie" is not a registered transition
      transitions: { type: "sldie" },
      scenes: [{ scene: "hero", duration: 1 }],
    };

    const badOption: CompositionSchema = {
      id: "bad",
      scenes: [
        // @ts-expect-error "sideways" is not a SlideDirection
        { scene: "hero", duration: 1, transition: { type: "slide", options: { direction: "sideways" } } },
      ],
    };

    void badName;
    void badOption;
  });

  it("keeps a custom transition registry typed via extend", () => {
    const custom = transitionRegistry.extend({
      plumVeil: builtinTransitions.dissolve, // reuse a definition as a stand-in
    });
    expectTypeOf(custom.has).toBeFunction();
    void buildComposition; // custom transitions flow through the erased builder param
    void sceneRegistry;
    void custom;
  });
});
