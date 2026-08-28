/**
 * acquisition/acquire — the pre-render production step.
 *
 * Walks a list of `AudioRequest`s, routes each to the first registered provider that claims it,
 * verifies what comes back, persists the accepted bytes and records provenance for everything —
 * including the rejections, so a later reader can see what was tried and why it failed.
 *
 * Nothing renders here. The output is local files plus a ledger; Remotion then treats those as
 * ordinary assets, which is what keeps a re-render byte-identical and offline.
 */

import { createHash } from "node:crypto";
import {
  type AcquisitionIO,
  type AcquisitionRecord,
  type AcquisitionReport,
  type AudioProvider,
  type AudioRequest,
  type ProviderResult,
} from "./types";
import { probeWav, verifyAudio, type VerifyOptions } from "./verify";
import { isWav, normalisePeak } from "./wav";

/** Where an acquired asset lands, by kind. `public/`-relative. */
export const destinationFor = (request: AudioRequest, ext: string): string => {
  const dir =
    request.kind === "music" ? "music" :
    request.kind === "ambience" ? "ambience" :
    request.kind === "voice" ? "vo" : "sfx";
  return `${dir}/${request.key}.${ext}`;
};

const sha256 = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

const extFor = (mime: string): string =>
  mime.includes("wav") ? "wav" : mime.includes("mpeg") || mime.includes("mp3") ? "mp3" : "bin";

export type AcquireOptions = {
  /** Prefix prepended to every destination path, e.g. "jetset/audio". */
  pathPrefix?: string;
  /** Per-kind verification tolerances. */
  verify?: VerifyOptions;
  /**
   * Persist rejected files too, under a `rejected/` sibling. Default true — a rejected take is
   * evidence, and silently discarding it is how a project loses the ability to explain itself.
   */
  keepRejected?: boolean;
};

/**
 * Acquire every request. Resolves even when individual assets fail: a failure is a recorded
 * rejection, not an exception, because a production needs the whole picture in one pass.
 */
export const acquireAssets = async (
  requests: AudioRequest[],
  providers: AudioProvider[],
  io: AcquisitionIO,
  options: AcquireOptions = {},
): Promise<AcquisitionReport> => {
  const prefix = options.pathPrefix ? `${options.pathPrefix}/` : "";
  const keepRejected = options.keepRejected ?? true;
  const records: AcquisitionRecord[] = [];
  const unserved: AudioRequest[] = [];

  for (const request of requests) {
    const provider = providers.find((p) => p.supports(request));
    if (!provider) {
      unserved.push(request);
      continue;
    }

    let result: ProviderResult;
    try {
      result = await provider.acquire(request);
    } catch (error) {
      records.push({
        key: request.key,
        provider: provider.name,
        providerAssetId: "(none)",
        prompt: request.description,
        acquiredAt: io.now(),
        originalFormat: "(none)",
        path: "(not written)",
        sha256: "(none)",
        licenceBasis: "(none)",
        attributionRequired: false,
        generated: false,
        verdict: "rejected",
        rejectionReason: `provider error: ${error instanceof Error ? error.message : String(error)}`,
      });
      continue;
    }

    // Normalise to WAV before measuring. A provider may deliver MP3; verification reads WAV.
    let bytes = result.bytes;
    let finalMime = result.mime;
    let converted = false;
    if (!isWav(bytes)) {
      if (io.toWav) {
        try {
          bytes = io.toWav(result.bytes, result.mime);
          finalMime = "audio/wav";
          converted = true;
        } catch {
          // Fall through — verification will reject it as unreadable, with the reason recorded.
        }
      }
    }

    // Bring the delivery to its declared peak before measuring, so verification judges the file
    // as it will actually be used rather than as the provider happened to normalise it.
    let gainAppliedDb: number | undefined;
    let sourcePeakDb: number | undefined;
    let deliveryPeakDb: number | undefined;
    if (isWav(bytes)) {
      const before = probeWav(bytes);
      if (before) sourcePeakDb = Number((20 * Math.log10(Math.max(before.peak, 1e-9))).toFixed(2));
      if (request.targetPeakDb !== undefined) {
        const n = normalisePeak(bytes, request.targetPeakDb);
        bytes = n.bytes;
        if (n.gainDb !== 0) gainAppliedDb = Number(n.gainDb.toFixed(2));
      }
      const after = probeWav(bytes);
      if (after) deliveryPeakDb = Number((20 * Math.log10(Math.max(after.peak, 1e-9))).toFixed(2));
    }

    const ext = extFor(finalMime);
    const check = verifyAudio(bytes, request, options.verify);
    const accepted = check.ok;
    const path = `${prefix}${accepted ? "" : "rejected/"}${destinationFor(request, ext)}`;

    if (accepted || keepRejected) io.write(path, bytes);

    records.push({
      key: request.key,
      provider: result.provider,
      providerAssetId: result.providerAssetId,
      prompt: request.description,
      acquiredAt: io.now(),
      originalFormat: result.mime,
      ...(converted ? { finalFormat: finalMime } : {}),
      ...(sourcePeakDb !== undefined ? { sourcePeakDb } : {}),
      ...(deliveryPeakDb !== undefined ? { deliveryPeakDb } : {}),
      ...(gainAppliedDb !== undefined ? { gainAppliedDb } : {}),
      ...(result.sourceDurationSeconds !== undefined ? { sourceDurationSeconds: result.sourceDurationSeconds } : {}),
      ...(check.probe ? { finalDurationSeconds: Number(check.probe.durationSeconds.toFixed(3)) } : {}),
      path: accepted || keepRejected ? path : "(not written)",
      sha256: sha256(bytes),
      licenceBasis: result.licence.basis,
      attributionRequired: result.licence.attributionRequired,
      generated: result.generated,
      verdict: accepted ? "accepted" : "rejected",
      ...(accepted ? {} : { rejectionReason: check.issues.map((i) => `${i.code}: ${i.detail}`).join(" | ") }),
    });
  }

  return {
    records,
    accepted: records.filter((r) => r.verdict === "accepted"),
    rejected: records.filter((r) => r.verdict === "rejected"),
    unserved,
  };
};
