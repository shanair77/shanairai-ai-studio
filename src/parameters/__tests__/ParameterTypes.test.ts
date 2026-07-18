import { describe, expect, expectTypeOf, it } from "vitest";
import { createRegistry } from "../../registry";
import { createParameterTypeDefinition, parameterTypeRegistry, type ParameterTypeDefinition } from "..";

describe("createParameterTypeDefinition — type inference", () => {
  it("captures the value type V", () => {
    const t = createParameterTypeDefinition<number>({
      name: "even",
      parse: (raw) => raw as number,
    });
    expectTypeOf(t).toEqualTypeOf<ParameterTypeDefinition<number>>();
    expectTypeOf(t.parse).returns.toEqualTypeOf<number>();
  });

  it("registers + extends the type vocabulary immutably", () => {
    const custom = createParameterTypeDefinition<string>({ name: "slug", parse: (r) => r as string });
    const extended = parameterTypeRegistry.extend({ slug: custom });
    expect(extended.has("slug")).toBe(true);
    expect(extended.has("string")).toBe(true); // built-ins preserved
    expect(parameterTypeRegistry.has("slug")).toBe(false); // immutable — original untouched
  });

  it("ships every built-in type", () => {
    const names = parameterTypeRegistry.keys().sort();
    expect(names).toEqual(
      ["audio", "boolean", "brand", "color", "date", "enum", "group", "image", "list", "number", "string", "text", "url", "video"].sort(),
    );
  });

  it("rejects a malformed type definition at compile time", () => {
    // Compile-time only — never executed.
    const _checks = (): void => {
      // @ts-expect-error `parse` is required
      createParameterTypeDefinition<string>({ name: "bad" });
      // @ts-expect-error `name` is required
      createParameterTypeDefinition<string>({ parse: (r) => r as string });
    };
    void _checks;
    expect(typeof _checks).toBe("function");
  });
});

describe("erased resolver assignability", () => {
  it("a concrete parameter-type registry is assignable to the erased resolver shape", () => {
    const reg = createRegistry({ n: createParameterTypeDefinition<number>({ name: "n", parse: (r) => r as number }) });
    // Structural check: has the erased resolver surface.
    expect(reg.has("n")).toBe(true);
    expect(reg.require("n").name).toBe("n");
  });
});
