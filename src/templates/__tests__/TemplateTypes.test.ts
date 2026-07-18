import { describe, expect, expectTypeOf, it } from "vitest";
import { createRegistry } from "../../registry";
import { buildFromTemplate, createTemplateDefinition, type ParamsOf } from "..";

type HeroParams = { title: string; subtitle?: string };
type ListParams = { items: string[] };

const heroT = createTemplateDefinition({
  name: "hero",
  build: (p: HeroParams) => ({ scenes: [{ scene: "hero", duration: 1, props: { title: p.title } }] }),
});
const listT = createTemplateDefinition({
  name: "list",
  build: (p: ListParams) => ({ scenes: p.items.map((t) => ({ scene: "centered", duration: 1, props: { title: t } })) }),
});

const templates = createRegistry({ hero: heroT, list: listT });

describe("createTemplateDefinition — type inference", () => {
  it("captures the param type from the build signature", () => {
    expectTypeOf(heroT.build).parameter(0).toEqualTypeOf<HeroParams>();
    expectTypeOf(listT.build).parameter(0).toEqualTypeOf<ListParams>();
    expectTypeOf<ParamsOf<(typeof templates.entries)["hero"]>>().toEqualTypeOf<HeroParams>();
    expectTypeOf<ParamsOf<(typeof templates.entries)["list"]>>().toEqualTypeOf<ListParams>();
  });

  it("registers and extends template packs immutably", () => {
    const base = createRegistry({ hero: heroT });
    const extended = base.extend({ list: listT });
    expect(extended.has("list")).toBe(true);
    expect(extended.has("hero")).toBe(true);
    expect(base.has("list")).toBe(false);
  });
});

describe("buildFromTemplate — typed template names + params", () => {
  it("compiles valid selections and rejects invalid ones", () => {
    // Compile-time only — declared, never executed (several intentionally throw at runtime).
    const _checks = (): void => {
      buildFromTemplate({ id: "x", template: "hero", params: { title: "Hi" } }, templates);
      buildFromTemplate({ id: "x", template: "list", params: { items: ["a", "b"] } }, templates);

      // @ts-expect-error unknown template name
      buildFromTemplate({ id: "x", template: "nope", params: { title: "Hi" } }, templates);
      // @ts-expect-error missing required param `title`
      buildFromTemplate({ id: "x", template: "hero", params: { subtitle: "s" } }, templates);
      // @ts-expect-error misspelled param `titel`
      buildFromTemplate({ id: "x", template: "hero", params: { titel: "Hi" } }, templates);
      // @ts-expect-error wrong param type (title must be string)
      buildFromTemplate({ id: "x", template: "hero", params: { title: 123 } }, templates);
      // @ts-expect-error params for the wrong template (hero params on `list`)
      buildFromTemplate({ id: "x", template: "list", params: { title: "Hi" } }, templates);
    };
    void _checks;
    expect(typeof _checks).toBe("function");
  });
});
