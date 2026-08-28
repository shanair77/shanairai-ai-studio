/**
 * render/renderVideo — the refusals, and the order they happen in.
 *
 * Every case here stops BEFORE a bundle is built or a browser is opened, which is
 * exactly what makes them fast enough to be ordinary tests. That is not a
 * limitation of the suite; it is the property under test. A render that is going to
 * be refused should be refused in milliseconds, and each of these assertions pins
 * one refusal to the stage that should own it.
 *
 * The actual production of an MP4 is proved separately in `__integration__`, which
 * is excluded from this suite because it takes minutes and needs a browser.
 */

import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { renderVideo, type RenderRequest } from "..";
import { cardTemplate } from "./fixtures/pack";

const FIXTURE_PACK = fileURLToPath(new URL("./fixtures/pack.ts", import.meta.url));

let scratch: string;

beforeAll(() => {
  scratch = mkdtempSync(join(tmpdir(), "ai-studio-render-test-"));
});

afterAll(() => {
  rmSync(scratch, { recursive: true, force: true });
});

const out = (name: string): string => join(scratch, name);

/** An already-aborted signal. Written out because `AbortSignal.abort()` is newer than this project's `lib`. */
const aborted = (): AbortSignal => {
  const controller = new AbortController();
  controller.abort();
  return controller.signal;
};

/** A request that would render, if it ever got that far. */
const request = (overrides: Partial<RenderRequest> = {}): RenderRequest => ({
  id: "test-render",
  template: "card",
  params: { title: "Hello" },
  outputPath: out("test.mp4"),
  ...overrides,
});

const pack = { module: FIXTURE_PACK, export: "fixturePack" };

describe("request validation", () => {
  it("refuses a request with no template name", async () => {
    const result = await renderVideo({ ...request(), template: "" }, { pack });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe("validation");
      expect(result.code).toBe("invalid-request");
    }
  });

  it("refuses a request with no output path", async () => {
    const result = await renderVideo({ ...request(), outputPath: "" }, { pack });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid-request");
  });

  it("refuses params that are not an object", async () => {
    const result = await renderVideo({ ...request(), params: [] as never }, { pack });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid-request");
  });

  it("names the templates that do exist when the requested one does not", async () => {
    const result = await renderVideo(request({ template: "nope" }), { pack });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe("validation");
      expect(result.code).toBe("unknown-template");
      // The message has to be actionable: a caller who guessed a name needs the list.
      expect(result.message).toContain("card");
    }
  });

  it("refuses an unreadable pack rather than rendering the wrong thing", async () => {
    const result = await renderVideo(request(), { pack: { module: FIXTURE_PACK, export: "notAnExport" } });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("pack-unavailable");
  });
});

describe("output collision", () => {
  it("refuses to overwrite an existing file by default", async () => {
    const path = out("already-here.mp4");
    writeFileSync(path, "not really a video");

    const result = await renderVideo(request({ outputPath: path }), { pack });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe("validation");
      expect(result.code).toBe("output-exists");
    }
    // The point of refusing: what was already there is still there.
    expect(existsSync(path)).toBe(true);
  });

  it("refuses BEFORE doing any work, not after producing a file it cannot write", async () => {
    const path = out("guarded.mp4");
    writeFileSync(path, "existing");
    const before = readdirSync(scratch).length;

    const result = await renderVideo(request({ outputPath: path }), { pack });

    expect(result.ok).toBe(false);
    expect(readdirSync(scratch)).toHaveLength(before);
  });
});

describe("version pinning", () => {
  it("refuses a pinned version that does not match, before rendering anything", async () => {
    const result = await renderVideo(request({ version: "9.9.9" }), { pack });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe("validation");
      expect(result.code).toBe("version-mismatch");
      // Both versions named, so the caller can tell which way to move.
      expect(result.message).toContain("9.9.9");
      expect(result.message).toContain(cardTemplate.version);
    }
    expect(existsSync(out("test.mp4"))).toBe(false);
  });

  it("never silently substitutes the registered version for the requested one", async () => {
    const result = await renderVideo(request({ version: "1.0.0" }), { pack });

    // The fixture is at 1.4.2. A pin of 1.0.0 is refused, NOT rounded to the nearest
    // available — no range matching, no "close enough", no fallback.
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("version-mismatch");
  });

  it("accepts a pin that matches exactly and gets past validation", async () => {
    // Cancelled immediately, so this proves the version gate opened without paying
    // for a bundle. Passing the gate is the assertion; the render is not.
    const controller = new AbortController();
    controller.abort();

    const result = await renderVideo(request({ version: cardTemplate.version }), {
      pack,
      signal: controller.signal,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).not.toBe("version-mismatch");
      expect(result.stage).toBe("render");
      expect(result.code).toBe("cancelled");
    }
  });
});

describe("readiness", () => {
  it("reports missing media as a readiness failure, not a render failure", async () => {
    const result = await renderVideo(request(), {
      pack: { module: FIXTURE_PACK, export: "unreadyPack" },
      workingDirectory: scratch,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      // The distinction that matters: nobody's code is broken, an asset is absent.
      expect(result.stage).toBe("readiness");
      expect(result.code).toBe("assets-missing");
      expect(result.missingAssets).toContain("fixture/definitely-not-here.mp4");
    }
  });

  it("accepts a caller's own probe in place of the filesystem", async () => {
    const result = await renderVideo(request(), {
      pack: { module: FIXTURE_PACK, export: "unreadyPack" },
      // Everything is present as far as this render is concerned.
      probe: () => ({ exists: true, bytes: 1024 }),
      signal: aborted(),
    });

    expect(result.ok).toBe(false);
    // Past readiness — it failed later, on the cancellation.
    if (!result.ok) expect(result.stage).toBe("render");
  });
});

describe("compilation", () => {
  it("attributes a throwing template to the compile stage", async () => {
    const result = await renderVideo(request({ template: "broken" }), { pack });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe("compile");
      expect(result.code).toBe("compile-failed");
      // The full execution report travels with it, so the failure is diagnosable
      // without re-running anything.
      expect(result.report?.issues[0]!.stage).toBe("run-template");
    }
  });

  it("attributes a bad parameter value to compilation, not to the request", async () => {
    const result = await renderVideo(request({ params: { title: 42 } }), { pack });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      // Structurally the request is fine — it is the template's schema that objects,
      // and only the template can say so.
      expect(result.stage).toBe("compile");
      expect(result.report?.issues[0]!.path).toBe("title");
    }
  });
});

describe("cancellation", () => {
  it("reports a pre-aborted signal as cancelled rather than starting", async () => {
    const result = await renderVideo(request(), { pack, signal: aborted() });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe("render");
      expect(result.code).toBe("cancelled");
    }
  });
});

describe("the request is JSON, and stays JSON", () => {
  it("survives a round trip through a queue unchanged", () => {
    const original = request({ version: "1.4.2", brand: "acme", codec: "h264", overwrite: true });
    const revived: RenderRequest = JSON.parse(JSON.stringify(original));

    // Nothing is lost, because nothing in the type can be lost. This is the property
    // the `RenderRequest` / `RenderExecutionOptions` split exists to guarantee.
    expect(revived).toEqual(original);
  });

  it("leaves no scratch directory behind, whatever happened", async () => {
    const tempBefore = readdirSync(tmpdir()).filter((n) => n.startsWith("ai-studio-render-"));

    await renderVideo(request({ template: "broken" }), { pack });
    await renderVideo(request({ version: "0.0.0" }), { pack });

    const tempAfter = readdirSync(tmpdir()).filter((n) => n.startsWith("ai-studio-render-"));
    expect(tempAfter).toEqual(tempBefore);
  });
});
