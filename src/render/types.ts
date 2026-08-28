/**
 * render/types — the programmatic render contract.
 *
 * THE CENTRAL SPLIT. A render is described by two things that look similar and are
 * not interchangeable:
 *
 *   `RenderRequest`          — WHAT to render. Pure JSON. Survives a queue, a database
 *                              column, an HTTP body and a week of waiting.
 *   `RenderExecutionOptions` — HOW to run it here, now, in this process. Callbacks,
 *                              abort signals, injected probes. None of it serialises.
 *
 * Keeping them apart is not tidiness. A single options bag containing both would be
 * a type that claims to be storable and is not: the first caller to persist one and
 * replay it later gets an object whose `onProgress` is gone and whose `signal` is
 * dead, with nothing in the type system having objected. Splitting them means the
 * half that crosses a boundary is exactly the half that can.
 *
 * It also settles what a job record is. Everything needed to reproduce a render is
 * in the request; the options are the runtime's business and belong to whoever is
 * running it.
 */

import { type ParameterValue } from "../parameters";
import { type AssetManifest, type AssetProbe } from "../manifest";
import { type ExecutionReport } from "../execution";

/** Container codecs this boundary will produce. */
export type RenderCodec = "h264" | "h265" | "vp8" | "vp9" | "prores" | "gif";

/**
 * A render, described in JSON and nothing else.
 *
 * Every field is a string, number, boolean or a nested structure of those, so a
 * request can be written to a queue and rendered by a different process on a
 * different machine an hour later and mean exactly the same thing.
 */
export type RenderRequest = {
  /** Caller's identifier for this render. Also seeds the composition id. */
  id: string;
  /** The template to render, by its name in the pack. */
  template: string;
  /** The template's parameters. JSON only — this is the boundary React never crosses. */
  params?: Record<string, ParameterValue>;
  /**
   * Pin the template implementation.
   *
   * Supply it and a mismatch is refused before anything is compiled, bundled or
   * rendered. Omit it and whatever the pack currently holds is used, and the
   * result reports which version that turned out to be. There is deliberately no
   * middle behaviour: a request that asks for version X is never served version Y.
   */
  version?: string;
  /** Brand to render under, by registered name. */
  brand?: string;
  /** Where the file is written. Absolute, or relative to the working directory. */
  outputPath: string;
  /** Container codec. Defaults to `h264`. */
  codec?: RenderCodec;
  /**
   * Permit writing over an existing file at `outputPath`.
   *
   * Defaults to false, and the default is the point: two concurrent renders that
   * were handed the same path should not silently produce one file, and a retry
   * should not destroy the output of the attempt that actually succeeded.
   */
  overwrite?: boolean;
  /** Canvas overrides. Omit them — the template states its own, including its frame rate. */
  format?: "vertical" | "horizontal" | "square";
  width?: number;
  height?: number;
  fps?: number;
  duration?: number;
};

/** How far along a render is. Reported per phase, because the phases are not comparable. */
export type RenderProgress =
  | { phase: "bundling"; progress: number }
  | { phase: "rendering"; progress: number; renderedFrames: number; encodedFrames: number };

/**
 * Everything that cannot be written down.
 *
 * All optional: a caller who supplies none of it gets a render of the production
 * pack, with no progress reporting, no cancellation and no timeout, which is the
 * right default for a script and the wrong one for a server.
 */
export type RenderExecutionOptions = {
  /**
   * Where the content lives, as a module the render bundle can import.
   *
   * The bundle is built by webpack in a separate process and cannot be handed a
   * live JavaScript value, so the pack is named rather than passed. This is the
   * same reason `RenderRequest` is JSON: what crosses into the bundle is a module
   * specifier and a request object, and both survive the trip.
   *
   * Defaults to this package's own production pack.
   */
  pack?: PackReference;
  /** Progress, as it happens. Never called after the promise settles. */
  onProgress?: (progress: RenderProgress) => void;
  /**
   * Cancel an in-flight render.
   *
   * A standard `AbortSignal`, adapted internally to Remotion's own cancellation, so
   * callers wire it to the same signal that cancels the rest of their request.
   */
  signal?: AbortSignal;
  /** Give up after this many milliseconds. Counts bundling and rendering together. */
  timeoutMs?: number;
  /** Assets that must be on disk first. Defaults to the pack's own manifest, when it has one. */
  manifest?: AssetManifest;
  /** How to check for those assets. Defaults to a filesystem probe of `public/`. */
  probe?: AssetProbe;
  /** Root the bundler treats as the project. Defaults to the current working directory. */
  workingDirectory?: string;
  /**
   * A stylesheet the render bundle must import, and the reason renders are not
   * silently unstyled.
   *
   * Tailwind produces CSS only for a stylesheet that is actually part of the
   * bundle. In an application that happens because the root component imports
   * one; a programmatic render has no root component, so nothing imports it and
   * Tailwind emits nothing — while `enableTailwind` is still configured, the
   * build still succeeds, and the output is a valid video of unstyled markup.
   * That failure is invisible everywhere except the picture.
   *
   * Defaults to `<workingDirectory>/src/index.css` when it exists. Pass a path to
   * use another, or `false` for a project that uses no stylesheet at all.
   */
  stylesheet?: string | false;
  /** Parallel rendering threads. Remotion's default when omitted. */
  concurrency?: number;
  /**
   * Directory for the throwaway bundle and its scratch files.
   *
   * Defaults to a fresh directory under the system temp location, removed when the
   * render finishes however it finishes.
   */
  scratchDirectory?: string;
};

/** A pack, named by the module that exports it. */
export type PackReference = {
  /** Module specifier or absolute path. Must resolve from both this process and the bundle. */
  module: string;
  /** Named export to read. Defaults to `productionPack`. */
  export?: string;
};

/**
 * Where a render stopped.
 *
 * These are kept apart because they are four different people's problems. A
 * `validation` failure is the caller's request; `readiness` is the producer's
 * missing media; `compile` is the template author's bug; `render` is the machine.
 * Collapsing them into one "it failed" is what turns a five-minute fix into an
 * afternoon of bisecting.
 */
export type RenderFailureStage = "validation" | "readiness" | "compile" | "render";

/** What the render produced, and what it produced it from. */
export type RenderSuccess = {
  ok: true;
  /** Absolute path to the finished file. */
  outputPath: string;
  sizeInBytes: number;
  codec: RenderCodec;
  /** The template that ran, and the version that actually ran — never the version requested. */
  template: string;
  version: string;
  /** The resolved canvas, as rendered. */
  composition: {
    id: string;
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
    durationSeconds: number;
  };
};

export type RenderFailure = {
  ok: false;
  stage: RenderFailureStage;
  /** Stable machine code, e.g. `version-mismatch`, `output-exists`, `cancelled`, `timed-out`. */
  code: string;
  message: string;
  /** The compile diagnostics, when the failure happened at or after compilation. */
  report?: ExecutionReport;
  /** Readiness detail, when `stage` is `readiness`. */
  missingAssets?: string[];
};

export type RenderResult = RenderSuccess | RenderFailure;
