import { describe, expect, it } from "vitest";
import { DomainError, sanitize } from "..";

describe("DomainError", () => {
  it("is an Error and a DomainError carrying only the tiny surface", () => {
    const e = new DomainError({ code: "x", message: "boom", path: "a.b", expected: 1, actual: 2, cause: "why" });
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(DomainError);
    expect(e.name).toBe("DomainError");
    expect(e.message).toBe("boom");
    expect(e.code).toBe("x");
    expect(e.path).toBe("a.b");
    expect(e.expected).toBe(1);
    expect(e.actual).toBe(2);
    expect(e.cause).toBe("why");
  });
});

describe("sanitize", () => {
  it("passes JSON primitives through", () => {
    expect(sanitize("s")).toBe("s");
    expect(sanitize(3)).toBe(3);
    expect(sanitize(true)).toBe(true);
    expect(sanitize(null)).toBe(null);
  });

  it("maps non-JSON scalars to null or a stable tag", () => {
    expect(sanitize(undefined)).toBe(null);
    expect(sanitize(NaN)).toBe(null);
    expect(sanitize(Infinity)).toBe(null);
    expect(sanitize(() => 0)).toBe("[function]");
    expect(sanitize(Symbol("s"))).toBe("[symbol]");
    expect(sanitize(BigInt(5))).toBe("[bigint]");
  });

  it("tags React elements and class instances without leaking internals", () => {
    const el = { $$typeof: Symbol.for("react.element"), type: "div", props: {} };
    expect(sanitize(el)).toBe("[ReactElement]");
    class Widget { x = 1; }
    expect(sanitize(new Widget())).toBe("[object]");
    expect(sanitize(new Error("e"))).toBe("[object]"); // Error is a class instance
  });

  it("recurses plain objects and arrays", () => {
    expect(sanitize({ a: 1, b: [2, "x", () => 0] })).toEqual({ a: 1, b: [2, "x", "[function]"] });
  });

  it("guards cycles and caps depth", () => {
    const cyclic: Record<string, unknown> = { a: 1 };
    cyclic.self = cyclic;
    expect(sanitize(cyclic)).toEqual({ a: 1, self: "[circular]" });

    let deep: Record<string, unknown> = { v: 1 };
    for (let i = 0; i < 12; i += 1) deep = { child: deep };
    expect(JSON.stringify(sanitize(deep))).toContain("[max-depth]");
  });

  it("is deterministic and always JSON-serializable", () => {
    const value = { s: "a", n: 3, bad: NaN, fn: () => 0, arr: [Symbol("x")] };
    const a = sanitize(value);
    const b = sanitize(value);
    expect(a).toEqual(b);
    expect(() => JSON.stringify(a)).not.toThrow();
  });
});
