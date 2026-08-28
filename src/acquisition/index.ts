/**
 * acquisition/ — provider-agnostic audio acquisition, run BEFORE render.
 *
 *   AudioRequest -> provider adapter -> ProviderResult -> verify -> persist -> AcquisitionRecord
 *
 * Adding a provider means writing one `AudioProvider` and registering it. The composition engine,
 * the AssetKit and the Remotion render path know nothing about any of it — by the time a render
 * runs, an acquired asset is just a file in `public/`.
 *
 * This barrel is Node-side only and must never be imported by rendered code. See
 * `__tests__/render-isolation.test.ts`.
 */

export { acquireAssets, destinationFor, type AcquireOptions } from "./acquire";
export { wrapPcmAsWav, isWav, normalisePeak } from "./wav";
export { verifyAudio, probeWav, loopSeamDiscontinuity, levelRangeDb, type VerifyResult, type VerifyOptions, type AudioProbe } from "./verify";
export {
  type AudioKind,
  type AudioRequest,
  type AudioProvider,
  type ProviderResult,
  type LicenceInfo,
  type AcquisitionRecord,
  type AcquisitionReport,
  type AcquisitionIO,
} from "./types";
