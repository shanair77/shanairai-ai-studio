/**
 * compiler — type-level coverage (checked by `test:typecheck`, not executed).
 *
 * Proves the typed `compile<M>` inference (correct selections type-check, wrong ones are compile
 * errors) and that `CompileResult` NEVER exposes `schema` at the type level.
 */

import { describe, expect, it } from "vitest";
import { defineTemplate } from "../../templates";
import { createCompiler } from "..";

type HeroParams = { title: string; subtitle?: string };
type ListParams = { items: string[] };

const heroT = defineTemplate({
  name: "hero", version: "test",
  build: (p: HeroParams) => ({ scenes: [{ scene: "hero", duration: 1, props: { title: p.title } }] }),
});
const listT = defineTemplate({
  name: "list", version: "test",
  build: (p: ListParams) => ({ scenes: p.items.map((t) => ({ scene: "centered", duration: 1, props: { title: t } })) }),
});

const compiler = createCompiler({ templates: { hero: heroT, list: listT } });

describe("createCompiler — typed compile inference", () => {
  it("accepts valid selections and rejects invalid ones at compile time", () => {
    // Compile-time only — declared, never executed.
    const _checks = (): void => {
      compiler.compile({ id: "x", template: "hero", params: { title: "Hi" } });
      compiler.compile({ id: "x", template: "list", params: { items: ["a", "b"] } });

      // @ts-expect-error unknown template name
      compiler.compile({ id: "x", template: "nope", params: { title: "Hi" } });
      // @ts-expect-error missing required param `title`
      compiler.compile({ id: "x", template: "hero", params: { subtitle: "s" } });
      // @ts-expect-error misspelled param `titel`
      compiler.compile({ id: "x", template: "hero", params: { titel: "Hi" } });
      // @ts-expect-error wrong param type (title must be string)
      compiler.compile({ id: "x", template: "hero", params: { title: 123 } });
      // @ts-expect-error params for the wrong template (hero params on `list`)
      compiler.compile({ id: "x", template: "list", params: { title: "Hi" } });
    };
    void _checks;
    expect(typeof _checks).toBe("function");
  });

  it("never exposes `schema` on a CompileResult (type level)", () => {
    const _check = (): void => {
      const result = compiler.compile({ id: "x", template: "hero", params: { title: "Hi" } });
      if (result.ok) {
        // @ts-expect-error CompileResult carries no `schema` — CompositionSchemaBase never leaks publicly
        void result.schema;
      }
    };
    void _check;
    expect(typeof _check).toBe("function");
  });
});
