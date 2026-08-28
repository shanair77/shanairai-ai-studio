/**
 * render — the Node-only render surface.
 *
 * Isolated from the rest of the package because it is the only part that spawns
 * webpack, drives a browser and writes files. Reaching it requires importing
 * `@shanairai/ai-studio/render` deliberately; nothing under the root export
 * imports this directory, which is what keeps the compiler usable in a browser.
 */

export { renderVideo } from "./renderVideo";
export { createFileProbe } from "./probe";
export {
  type PackReference,
  type RenderCodec,
  type RenderExecutionOptions,
  type RenderFailure,
  type RenderFailureStage,
  type RenderProgress,
  type RenderRequest,
  type RenderResult,
  type RenderSuccess,
} from "./types";
