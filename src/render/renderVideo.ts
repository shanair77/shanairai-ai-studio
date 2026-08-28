/**
 * render/renderVideo — a named template and a JSON request in, an MP4 on disk out.
 *
 * This is the whole point of the boundary. Everything above it — templates, packs,
 * the compiler, the manifest — is reachable from a browser. This module is not: it
 * spawns webpack, drives a headless browser and writes files, and it is isolated in
 * its own export so that importing the compiler never drags any of that in.
 *
 * THE ORDER OF OPERATIONS IS THE DESIGN. Each stage is cheaper than the one after
 * it and rules out a whole class of failure before the expensive part begins:
 *
 *   validation → readiness → compile → bundle → render
 *
 * A pinned version that does not match costs a string comparison. A missing asset
 * costs a few dozen `stat` calls. A malformed param costs a compile. Only once all
 * of those have passed does anything start a webpack build or open a browser. The
 * failure mode this exists to prevent is the ninety-second render that dies on
 * something knowable in the first millisecond — and worse, the one that succeeds
 * and hands back a film with a silent gap where an unacquired track should be.
 *
 * WHY THE COMPOSITION IS BUILT TWICE. Once here, to validate and to learn the
 * canvas; once inside the bundle, because a live React component cannot cross into
 * a webpack build. See `entry.ts` — the duplication is what the JSON request buys.
 *
 * CLEANUP IS UNCONDITIONAL. The scratch directory holds a generated entry file and
 * a full webpack bundle, and it is removed in a `finally` whether the render
 * succeeded, failed, timed out or was cancelled. A render server that leaks one
 * bundle per job fills its disk overnight.
 */

import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { bundle, type BundleOptions } from "@remotion/bundler";
import { makeCancelSignal, renderMedia, selectComposition } from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";

import { createCompiler, type CompilerConfig } from "../compiler";
import { assertRenderReady, type AssetManifest } from "../manifest";
import { type TemplateMap } from "../templates";
import { hostCompileRequest, renderEntrySource } from "./entry";
import { createFileProbe } from "./probe";
import {
  type PackReference,
  type RenderExecutionOptions,
  type RenderFailure,
  type RenderRequest,
  type RenderResult,
} from "./types";

/** The export read from a pack module when the caller names no other. */
const DEFAULT_PACK_EXPORT = "productionPack";

/** A pack, plus the readiness manifest it may carry. */
type LoadedPack = CompilerConfig<TemplateMap> & { manifest?: AssetManifest };

const fail = (stage: RenderFailure["stage"], code: string, message: string, extra: Partial<RenderFailure> = {}): RenderFailure => ({
  ok: false,
  stage,
  code,
  message,
  ...extra,
});

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Locate this package's root entry, as a path the render bundle can import.
 *
 * The bundle needs `createCompiler`, and the specifier that reaches it has to
 * resolve from a generated file in a temp directory — where a bare package name
 * would resolve against the temp directory's (nonexistent) `node_modules`. So an
 * absolute path is computed from this module's own location instead.
 *
 * Two layouts are possible and both are real: running from source in this repo's
 * own tests, and running from the published bundle. Neither is guessed at — each
 * candidate is checked on disk.
 */
const locateOwnModule = (name: "lib" | "packs"): string => {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates =
    name === "lib"
      ? [join(here, "lib.js"), join(here, "..", "lib.ts"), join(here, "..", "lib.js")]
      : [join(here, "packs.js"), join(here, "..", "packs", "index.ts"), join(here, "..", "packs", "index.js")];

  const found = candidates.find((c) => existsSync(c));
  if (found === undefined) {
    throw new Error(
      `ai-studio: cannot locate this package's own \`${name}\` entry to build a render bundle against. Looked in:\n${candidates.map((c) => `  ${c}`).join("\n")}`,
    );
  }
  return found;
};

/**
 * A relative path is resolved against the working directory; anything else is left
 * alone. Getting this wrong is silent: a relative specifier would resolve against
 * this module's own directory in the host and against the temp directory in the
 * bundle, so the two sides would load different packs and only disagree at render
 * time, if at all.
 */
const resolvePackModule = (module: string, cwd: string): string =>
  module.startsWith(".") ? resolve(cwd, module) : module;

/** Import a pack by module specifier and read the named export. */
const loadPack = async (ref: Required<PackReference>): Promise<LoadedPack> => {
  const specifier = isAbsolute(ref.module) ? pathToFileURL(ref.module).href : ref.module;
  const mod: Record<string, unknown> = await import(/* @vite-ignore */ specifier);
  const pack = mod[ref.export];

  if (!isPlainObject(pack) || !isPlainObject(pack.templates)) {
    throw new Error(
      `ai-studio: ${ref.module} has no usable export "${ref.export}" — expected a pack with a \`templates\` map.`,
    );
  }
  return pack as unknown as LoadedPack;
};

/**
 * Tailwind, plus a resolution root the generated entry can actually use.
 *
 * Two things have to be true of the bundle's webpack config, and neither is a
 * default. Tailwind must be enabled or the output is unstyled — see the call site.
 * And module resolution must reach the PROJECT's `node_modules`: the entry file
 * lives in a temp directory, and webpack resolves bare specifiers by walking up
 * from the importing file, which from `/var/folders/…` finds nothing at all.
 *
 * The project root is appended rather than substituted, so Remotion's own
 * resolution still comes first.
 */
const projectWebpackOverride =
  (cwd: string): NonNullable<BundleOptions["webpackOverride"]> =>
  async (config) => {
    const withTailwind = await enableTailwind(config);
    return {
      ...withTailwind,
      resolve: {
        ...withTailwind.resolve,
        modules: [...(withTailwind.resolve?.modules ?? ["node_modules"]), join(cwd, "node_modules")],
      },
    };
  };

/**
 * Which stylesheet, if any, the bundle should import.
 *
 * `false` means the project genuinely has none. `undefined` means look for the
 * conventional one — and finding nothing is not an error, because a project
 * without Tailwind is a legitimate project.
 */
const resolveStylesheet = (option: string | false | undefined, cwd: string): string | undefined => {
  if (option === false) return undefined;
  if (option !== undefined) return isAbsolute(option) ? option : resolve(cwd, option);
  const conventional = join(cwd, "src", "index.css");
  return existsSync(conventional) ? conventional : undefined;
};

/** Structural checks on the request, before anything is loaded or resolved. */
const validateRequest = (request: RenderRequest): RenderFailure | undefined => {
  if (!isPlainObject(request)) return fail("validation", "invalid-request", "Render request must be an object.");
  if (typeof request.id !== "string" || request.id.length === 0)
    return fail("validation", "invalid-request", "Render request `id` must be a non-empty string.");
  if (typeof request.template !== "string" || request.template.length === 0)
    return fail("validation", "invalid-request", "Render request `template` must be a non-empty string.");
  if (typeof request.outputPath !== "string" || request.outputPath.length === 0)
    return fail("validation", "invalid-request", "Render request `outputPath` must be a non-empty string.");
  if (request.params !== undefined && !isPlainObject(request.params))
    return fail("validation", "invalid-request", "Render request `params` must be an object.");
  if (request.version !== undefined && typeof request.version !== "string")
    return fail("validation", "invalid-request", "Render request `version` must be a string when present.");
  return undefined;
};

/**
 * Render a template to a video file.
 *
 * Never throws for an expected failure — a bad request, missing media, a template
 * that will not compile and a render that was cancelled all come back as
 * `{ ok: false }` with the stage that stopped it. Programmer errors and genuine
 * infrastructure faults still throw, on the same principle `execute()` follows:
 * a caller can handle a refusal, and masking a bug helps nobody.
 */
export async function renderVideo(
  request: RenderRequest,
  options: RenderExecutionOptions = {},
): Promise<RenderResult> {
  // ── Stage 1: validation ────────────────────────────────────────────────────
  const malformed = validateRequest(request);
  if (malformed) return malformed;

  const cwd = resolve(options.workingDirectory ?? process.cwd());
  const outputPath = isAbsolute(request.outputPath) ? request.outputPath : resolve(cwd, request.outputPath);

  // Checked before the expensive work rather than after it, so a render that was
  // never going to be allowed to write does not spend two minutes finding out.
  if (existsSync(outputPath) && request.overwrite !== true) {
    return fail(
      "validation",
      "output-exists",
      `Refusing to overwrite ${outputPath}. Pass \`overwrite: true\` to replace it, or choose another path.`,
    );
  }

  // Resolved to an absolute path when it is this package's own or a file path.
  // A bare specifier is passed through and resolved by the bundler against the
  // project's `node_modules` — see `projectWebpackOverride`.
  const packRef: Required<PackReference> = {
    module: options.pack?.module === undefined ? locateOwnModule("packs") : resolvePackModule(options.pack.module, cwd),
    export: options.pack?.export ?? DEFAULT_PACK_EXPORT,
  };

  let pack: LoadedPack;
  try {
    pack = await loadPack(packRef);
  } catch (error) {
    return fail("validation", "pack-unavailable", error instanceof Error ? error.message : String(error));
  }

  const template = pack.templates[request.template];

  if (template === undefined) {
    return fail(
      "validation",
      "unknown-template",
      `No template "${request.template}" in ${packRef.module}. Available: ${Object.keys(pack.templates).sort().join(", ") || "(none)"}.`,
    );
  }

  // The version gate. Refusal, never substitution — a caller who pinned a version
  // asked for a specific film, and quietly rendering a different one is the exact
  // outcome pinning exists to prevent.
  if (request.version !== undefined && request.version !== template.version) {
    return fail(
      "validation",
      "version-mismatch",
      `Template "${request.template}" is at version ${template.version}; the request pinned ${request.version}. ` +
        `Nothing was rendered — re-pin deliberately, or drop \`version\` to accept the registered one.`,
    );
  }

  // ── Stage 2: readiness ─────────────────────────────────────────────────────
  const manifest = options.manifest ?? pack.manifest;
  if (manifest !== undefined) {
    const probe = options.probe ?? createFileProbe(join(cwd, "public"));
    try {
      assertRenderReady(manifest, probe);
    } catch (error) {
      return fail("readiness", "assets-missing", error instanceof Error ? error.message : String(error), {
        missingAssets: manifest.requirements.filter((r) => !probe(r.path).exists).map((r) => r.path),
      });
    }
  }

  // ── Stage 3: compile ───────────────────────────────────────────────────────
  // In-process, for diagnostics and for the resolved canvas. The bundle compiles
  // the same request again from the same JSON; see `entry.ts`.
  const compositionId = request.id;
  const compiled = createCompiler(pack).compile(
    hostCompileRequest(request, compositionId) as never,
  );

  if (!compiled.ok) {
    return fail(
      "compile",
      "compile-failed",
      `Template "${request.template}" did not compile:\n` +
        compiled.report.issues.map((i) => `  [${i.code}] ${i.stage}${i.path ? ` (${i.path})` : ""}: ${i.message}`).join("\n"),
      { report: compiled.report },
    );
  }

  const built = compiled.composition;

  // ── Stage 4/5: bundle and render ───────────────────────────────────────────
  const scratch = options.scratchDirectory
    ? (mkdirSync(options.scratchDirectory, { recursive: true }), resolve(options.scratchDirectory))
    : mkdtempSync(join(tmpdir(), "ai-studio-render-"));

  // One signal for both phases, fed by the caller's abort and by the timeout.
  const { cancelSignal, cancel } = makeCancelSignal();
  let cancelledBy: "caller" | "timeout" | undefined;

  const abort = (): void => {
    if (cancelledBy === undefined) cancelledBy = "caller";
    cancel();
  };
  options.signal?.addEventListener("abort", abort, { once: true });

  const timer =
    options.timeoutMs === undefined
      ? undefined
      : setTimeout(() => {
          cancelledBy ??= "timeout";
          cancel();
        }, options.timeoutMs);

  try {
    if (options.signal?.aborted === true) {
      return fail("render", "cancelled", "The render was cancelled before it started.");
    }

    // Resolved here rather than in the entry generator so the "does it exist?"
    // question is answered once, against the real project root.
    const stylesheet = resolveStylesheet(options.stylesheet, cwd);

    const entryPoint = join(scratch, "entry.tsx");
    writeFileSync(
      entryPoint,
      renderEntrySource({
        libModule: locateOwnModule("lib"),
        packModule: packRef.module,
        packExport: packRef.export,
        request,
        compositionId,
        ...(stylesheet !== undefined ? { stylesheet } : {}),
      }),
      "utf8",
    );

    const serveUrl = await bundle({
      entryPoint,
      outDir: join(scratch, "bundle"),
      // WITHOUT THIS THE RENDER IS A FAILURE, not a degradation. `remotion.config.ts`
      // applies the same override, and its own header says the config file is not
      // read by the Node APIs — so a programmatic render that omits it produces a
      // technically valid MP4 of completely unstyled markup. Tested by a pixel
      // assertion rather than trusted, because the failure looks like success
      // everywhere except the picture.
      webpackOverride: projectWebpackOverride(cwd),
      // The project root, so `public/` and Tailwind's content globs resolve against
      // the real project rather than the temp directory the entry file lives in.
      rootDir: cwd,
      publicDir: join(cwd, "public"),
      onProgress: (percent) => options.onProgress?.({ phase: "bundling", progress: percent / 100 }),
    });

    const composition = await selectComposition({
      serveUrl,
      id: compositionId,
      inputProps: {},
    });

    await renderMedia({
      serveUrl,
      composition,
      codec: request.codec ?? "h264",
      outputLocation: outputPath,
      overwrite: request.overwrite === true,
      cancelSignal,
      ...(options.concurrency !== undefined ? { concurrency: options.concurrency } : {}),
      onProgress: ({ progress, renderedFrames, encodedFrames }) =>
        options.onProgress?.({ phase: "rendering", progress, renderedFrames, encodedFrames }),
    });

    const sizeInBytes = statSync(outputPath).size;

    return {
      ok: true,
      outputPath,
      sizeInBytes,
      codec: request.codec ?? "h264",
      template: request.template,
      // The version that RAN. A caller who pinned one gets the same string back;
      // a caller who pinned nothing learns what they got, which is the fact they
      // need to pin it next time.
      version: template.version,
      composition: {
        id: built.id,
        width: built.width,
        height: built.height,
        fps: built.fps,
        durationInFrames: built.durationInFrames,
        durationSeconds: built.durationInFrames / built.fps,
      },
    };
  } catch (error) {
    // Cancellation arrives as a thrown error from deep inside Remotion. Which of
    // the two causes it was is known here and nowhere else, so it is recorded
    // rather than inferred from the message.
    if (cancelledBy === "timeout") {
      return fail("render", "timed-out", `The render exceeded its ${options.timeoutMs}ms budget and was cancelled.`);
    }
    if (cancelledBy === "caller") {
      return fail("render", "cancelled", "The render was cancelled.");
    }
    return fail("render", "render-failed", error instanceof Error ? error.message : String(error));
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
    // Unconditional: a bundle is tens of megabytes and there is one per render.
    if (options.scratchDirectory === undefined) rmSync(scratch, { recursive: true, force: true });
  }
}
