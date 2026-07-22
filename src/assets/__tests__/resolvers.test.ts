import { describe, expect, it, vi } from "vitest";
import { DomainError } from "../../errors";

/** Run `fn`, return whatever it throws (fails loudly if it doesn't throw). */
const caught = (fn: () => unknown): unknown => {
  try {
    fn();
  } catch (e) {
    return e;
  }
  throw new Error("expected the function to throw, but it did not");
};

// resolvers.ts imports only `staticFile` from remotion — mock it deterministically.
vi.mock("remotion", () => ({ staticFile: (path: string) => `/static/${path}` }));

import { LocalAssetResolver, RemoteAssetResolver, normaliseSource } from "../resolvers";

describe("normaliseSource", () => {
  it("treats a bare http(s) string as remote", () => {
    expect(normaliseSource("https://cdn/x.jpg")).toEqual({ kind: "remote", url: "https://cdn/x.jpg" });
  });
  it("treats a bare non-url string as local", () => {
    expect(normaliseSource("images/x.jpg")).toEqual({ kind: "local", path: "images/x.jpg" });
  });
  it("passes a discriminated source through", () => {
    expect(normaliseSource({ kind: "local", path: "a" })).toEqual({ kind: "local", path: "a" });
  });
});

describe("LocalAssetResolver", () => {
  it("supports local sources only", () => {
    expect(LocalAssetResolver.supports("images/x.png")).toBe(true);
    expect(LocalAssetResolver.supports("https://cdn/x.png")).toBe(false);
  });
  it("resolves a local path via staticFile (deterministic)", () => {
    expect(LocalAssetResolver.resolve("images/x.png", "image")).toEqual({
      kind: "file",
      category: "image",
      src: "/static/images/x.png",
      metadata: undefined,
    });
  });
  it("rejects an unsupported (remote) source", () => {
    expect(() => LocalAssetResolver.resolve({ kind: "remote", url: "https://x" }, "image")).toThrow(/unsupported source/);
  });
  it("keeps the kind-mismatch guard a raw Error (internal invariant — NOT a DomainError)", () => {
    const err = caught(() => LocalAssetResolver.resolve({ kind: "remote", url: "https://x" }, "image"));
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(DomainError);
  });
});

describe("RemoteAssetResolver", () => {
  it("supports remote sources only", () => {
    expect(RemoteAssetResolver.supports("https://cdn/x.mp4")).toBe(true);
    expect(RemoteAssetResolver.supports("video/x.mp4")).toBe(false);
  });
  it("passes a valid http(s) URL through", () => {
    expect(RemoteAssetResolver.resolve("https://cdn/x.mp4", "video")).toEqual({
      kind: "file",
      category: "video",
      src: "https://cdn/x.mp4",
      metadata: undefined,
    });
  });
  it("rejects an unsupported (local) source", () => {
    expect(() => RemoteAssetResolver.resolve({ kind: "local", path: "a" }, "video")).toThrow(/unsupported source/);
  });
  it("classifies a malformed URL as a DomainError `invalid-asset-source` (actual)", () => {
    const err = caught(() => RemoteAssetResolver.resolve({ kind: "remote", url: "not-a-url" }, "image"));
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toMatchObject({ code: "invalid-asset-source", actual: "not-a-url" });
    expect((err as Error).message).toMatch(/is not a valid http\(s\) URL/);
  });
});
