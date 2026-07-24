import { describe, expectTypeOf, it } from "vitest";
import type { HeroSceneProps, QuoteSceneProps } from "../../scenes";
import type { CompositionSchema, SceneConfig } from "../CompositionSchema";
import { buildComposition } from "../CompositionBuilder";
import { defineScene, sceneRegistry, type PropsOf } from "../SceneRegistry";

// Type-level suite: checked by `test:typecheck` (tsc -p tsconfig.test.json). The
// `@ts-expect-error` directives FAIL the typecheck if the marked line stops being an error,
// so these are a permanent E1 regression guard. Runtime bodies are inert (no calls).

describe("typed scene registration", () => {
  it("infers each scene's props from the registry", () => {
    // A scene config for "hero" carries HeroSceneProps as its props.
    type HeroCfg = Extract<SceneConfig, { scene: "hero" }>;
    expectTypeOf<NonNullable<HeroCfg["props"]>>().toEqualTypeOf<HeroSceneProps>();

    // PropsOf recovers the prop type from a definition.
    const heroDef = defineScene<HeroSceneProps>({ component: () => null });
    expectTypeOf<PropsOf<typeof heroDef>>().toEqualTypeOf<HeroSceneProps>();
    void heroDef;

    type QuoteCfg = Extract<SceneConfig, { scene: "quote" }>;
    expectTypeOf<NonNullable<QuoteCfg["props"]>>().toEqualTypeOf<QuoteSceneProps>();
  });

  it("accepts valid names and props", () => {
    const ok: CompositionSchema = {
      id: "ok",
      scenes: [
        { scene: "hero", props: { title: "AI Studio", maxWidth: 1200 } },
        { scene: "quote", props: { quote: "…", attribution: "…" } },
      ],
    };
    expectTypeOf(ok).toBeObject();
    void ok;
  });

  it("rejects unknown scene names and wrong props at compile time", () => {
    const badName: CompositionSchema = {
      id: "bad",
      // @ts-expect-error "herro" is not a registered scene name
      scenes: [{ scene: "herro", props: {} }],
    };

    const badProp: CompositionSchema = {
      id: "bad",
      // @ts-expect-error 'titel' is not a HeroSceneProps key
      scenes: [{ scene: "hero", props: { titel: "typo" } }],
    };

    const badPropType: CompositionSchema = {
      id: "bad",
      // @ts-expect-error maxWidth must be a number
      scenes: [{ scene: "hero", props: { maxWidth: "big" } }],
    };

    void badName;
    void badProp;
    void badPropType;
  });

  it("accepts per-scene `duration` (seconds) but rejects authored `durationInFrames`", () => {
    const ok: CompositionSchema = {
      id: "ok",
      scenes: [{ scene: "hero", duration: 3.5, props: { title: "Hi" } }],
    };

    const badFrames: CompositionSchema = {
      id: "bad",
      // @ts-expect-error `durationInFrames` is not an authored scene field — author in seconds via `duration`
      scenes: [{ scene: "hero", durationInFrames: 90, props: { title: "Hi" } }],
    };

    void ok;
    void badFrames;
  });

  it("rejects authored per-instance `opaque` (opacity is owned by the scene definition)", () => {
    const badOpaque: CompositionSchema = {
      id: "bad",
      // @ts-expect-error `opaque` is not an authored scene field — declare it on the scene definition
      scenes: [{ scene: "hero", opaque: false, props: { title: "Hi" } }],
    };

    void badOpaque;
  });

  it("keeps a custom registry's config typed via extend", () => {
    const studio = sceneRegistry.extend({
      probe: defineScene<{ headline?: string }>({ component: () => null }),
    });

    // valid custom scene + prop
    buildComposition({ id: "custom", scenes: [{ scene: "probe", props: { headline: "hi" } }] }, studio);

    buildComposition(
      {
        id: "custom",
        // @ts-expect-error 'headlien' is not a key of the probe scene's props
        scenes: [{ scene: "probe", props: { headlien: "typo" } }],
      },
      studio,
    );
  });
});
