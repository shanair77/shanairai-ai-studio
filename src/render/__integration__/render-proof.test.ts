/**
 * render-proof — one real MP4, produced in-process, verified as a picture.
 *
 * This is the milestone's actual claim, and the only test that can settle it: a
 * JSON request goes in, `@remotion/renderer` runs inside this process, and a video
 * file comes out with the right dimensions, the right length and the right colours
 * in it. No `remotion render` subprocess, no CLI, no `remotion.config.ts` — which
 * matters because that config file is exactly what a programmatic render does NOT
 * read, and its Tailwind override is exactly what a programmatic render silently
 * loses.
 *
 * WHY A PIXEL, NOT A FILE SIZE. A render with no CSS still encodes, still reports
 * success, still writes a well-formed MP4 of the correct duration. Every check that
 * stops at "did it produce a file?" passes on a completely unstyled video. So the
 * frame is decoded and a channel value is compared: `bg-[rgb(0,128,255)]` either
 * compiled or it did not, and the difference is visible in one byte.
 *
 * It costs nothing to run. The composition is one second of a flat colour at
 * 320x180 and names no media asset, so nothing is generated, downloaded or paid
 * for — the expense is CPU and about a minute of webpack.
 *
 * Excluded from the default suite (`vitest.render.config.ts`) because it needs a
 * headless browser and takes minutes. Run it with `npm run test:render`.
 */

import { existsSync, mkdtempSync, readdirSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { renderStill, selectComposition } from "@remotion/renderer";

import { renderVideo, type RenderProgress, type RenderResult } from "..";
import { swatchTemplate } from "../__tests__/fixtures/pack";
import { decodePng, pixelAt } from "./png";

const FIXTURE_PACK = fileURLToPath(new URL("../__tests__/fixtures/pack.ts", import.meta.url));
const PROJECT_ROOT = process.cwd();

/** Exactly what `bg-[rgb(0,128,255)]` must produce. See `fixtures/Swatch.tsx`. */
const TAILWIND_BACKGROUND = { r: 0, g: 128, b: 255 };

let workspace: string;
let scratch: string;
let result: RenderResult;
const progress: RenderProgress[] = [];

beforeAll(async () => {
  workspace = mkdtempSync(join(tmpdir(), "ai-studio-proof-"));
  // Retained rather than auto-cleaned, so the pixel assertion can re-use the very
  // bundle this render was produced from. A second bundle would prove a second
  // bundle had Tailwind, which is not the claim.
  scratch = mkdtempSync(join(tmpdir(), "ai-studio-proof-bundle-"));

  result = await renderVideo(
    {
      id: "proof",
      template: "swatch",
      params: { label: "AI" },
      version: swatchTemplate.version,
      outputPath: join(workspace, "proof.mp4"),
      width: 320,
      height: 180,
      fps: 10,
    },
    {
      pack: { module: FIXTURE_PACK, export: "fixturePack" },
      workingDirectory: PROJECT_ROOT,
      scratchDirectory: scratch,
      onProgress: (p) => progress.push(p),
    },
  );
}, 600_000);

afterAll(() => {
  rmSync(workspace, { recursive: true, force: true });
  rmSync(scratch, { recursive: true, force: true });
});

describe("a JSON request produces a real video file", () => {
  it("succeeded", () => {
    // Printed in full on failure: a bundling error here is long and the message is
    // the only thing that makes it diagnosable.
    expect(result.ok ? "ok" : `${result.stage}/${result.code}: ${result.message}`).toBe("ok");
  });

  it("wrote a non-empty file where it was asked to", () => {
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(existsSync(result.outputPath)).toBe(true);
    expect(result.outputPath).toBe(join(workspace, "proof.mp4"));
    expect(result.sizeInBytes).toBeGreaterThan(1000);
  });

  it("is an MP4 — the container is checked, not assumed from the extension", () => {
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // ISO base media files carry an `ftyp` box at offset 4.
    const header = readFileSync(result.outputPath).subarray(4, 8).toString("ascii");
    expect(header).toBe("ftyp");
  });

  it("reports the canvas it actually rendered", () => {
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.composition).toMatchObject({
      id: "proof",
      width: 320,
      height: 180,
      fps: 10,
      durationInFrames: 10,
      durationSeconds: 1,
    });
  });

  it("echoes the exact template version that ran", () => {
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.version).toBe(swatchTemplate.version);
    expect(result.template).toBe("swatch");
  });

  it("reported progress through both phases", () => {
    expect(progress.some((p) => p.phase === "bundling")).toBe(true);
    expect(progress.some((p) => p.phase === "rendering")).toBe(true);

    const rendering = progress.filter((p) => p.phase === "rendering");
    expect(rendering[rendering.length - 1]!.progress).toBeGreaterThan(0);
    // Every reported value is a real fraction, not a percentage or a frame count.
    expect(progress.every((p) => p.progress >= 0 && p.progress <= 1)).toBe(true);
  });
});

describe("Tailwind reached the render", () => {
  it("paints the exact colour the utility class declares", async () => {
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // The bundle THIS render used — not a new one built with different options.
    const serveUrl = join(scratch, "bundle");
    // Selected rather than hand-written: the composition metadata then comes from
    // the same bundle, so this cannot drift from what was actually rendered.
    const composition = await selectComposition({ serveUrl, id: "proof", inputProps: {} });

    const still = join(workspace, "frame.png");
    await renderStill({
      serveUrl,
      composition,
      output: still,
      frame: 5,
      imageFormat: "png",
      overwrite: true,
    });

    const png = decodePng(readFileSync(still));
    expect(png.width).toBe(320);

    // Top-left corner: background only, well away from the centred text.
    const corner = pixelAt(png, 4, 4);

    // If `enableTailwind` were missing from the bundler override, or the stylesheet
    // never made it into the bundle, this class would emit no declaration at all and
    // the frame would be empty here. The whole render would still have "succeeded".
    expect({ r: corner.r, g: corner.g, b: corner.b }).toEqual(TAILWIND_BACKGROUND);
    expect(corner.a).toBe(255);
  }, 300_000);
});

describe("the render cleans up after itself", () => {
  it("left no bundle in the system temp directory", () => {
    // The auto-created ones. This render was given an explicit scratch directory,
    // which it correctly leaves alone — the test owns that one.
    const leaked = readdirSync(tmpdir()).filter((n) => n.startsWith("ai-studio-render-"));
    expect(leaked).toEqual([]);
  });

  it("refuses a second render to the same path without `overwrite`", async () => {
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const second = await renderVideo(
      {
        id: "proof",
        template: "swatch",
        params: { label: "AI" },
        outputPath: result.outputPath,
      },
      { pack: { module: FIXTURE_PACK, export: "fixturePack" }, workingDirectory: PROJECT_ROOT },
    );

    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.code).toBe("output-exists");
    // And the first render's output is untouched.
    expect(readFileSync(result.outputPath).length).toBe(result.sizeInBytes);
  });
});
