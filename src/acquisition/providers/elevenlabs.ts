/**
 * acquisition/providers/elevenlabs — the first `AudioProvider` adapter.
 *
 * Wraps ElevenLabs Text-to-Sound-Effects. It answers `sfx` and `ambience` requests and
 * deliberately DECLINES music and voice: the music bed for a premium commercial is a licensing
 * and taste decision, not an automation one, and narration already has its own pipeline.
 *
 * Two adapter responsibilities worth naming, because they are what keeps the seam narrow:
 *
 *   1. REQUEST SHAPE. Endpoint, parameter names, the 30s ceiling and the pinned model id are the
 *      adapter's business alone; the acquisition layer never learns any of them.
 *   2. SECRET HANDLING. The key is read from `ELEVENLABS_API_KEY` at call time and never returned,
 *      logged or written to provenance. The ledger records the licence BASIS, never the credential.
 *
 * Commercial position, captured 2026-08-23 from elevenlabs.io/sound-effects: paid accounts may use
 * generated effects "royalty-free in commercial projects, including YouTube videos, social media
 * content, and even advertising". A free account is non-commercial only, so the adapter refuses to
 * run without an explicit acknowledgement that a paid plan is in use — silently generating audio
 * that cannot legally ship would be worse than failing.
 */

import { type AudioProvider, type AudioRequest, type ProviderResult } from "../types";

const ENDPOINT = "https://api.elevenlabs.io/v1/sound-generation";
const TERMS_URL = "https://elevenlabs.io/sound-effects";
/** The endpoint's own ceiling for a single generation (verified against the API reference). */
export const MAX_GENERATION_SECONDS = 30;
/** Documented default model for text-to-sound-effects. Pinned so generations stay reproducible. */
const MODEL_ID = "eleven_text_to_sound_v2";

export type ElevenLabsOptions = {
  /**
   * Confirms a PAID plan is in use. Required — generated effects on a free account are
   * non-commercial only and cannot ship in an advertisement.
   */
  commercialPlan: true;
  /** Injected for testing. Defaults to `globalThis.fetch`. */
  fetchImpl?: typeof fetch;
  /** Injected for testing. Defaults to `process.env.ELEVENLABS_API_KEY`. */
  apiKey?: string;
  /** 0–1. Higher follows the prompt more literally; lower is more natural. Default 0.3. */
  promptInfluence?: number;
  /** One of the endpoint's output formats. Default mp3_44100_128 — available on every paid tier
   *  (higher-bitrate MP3 and PCM require Creator/Pro). */
  outputFormat?: string;
};

/** Build the ElevenLabs adapter. */
export const elevenLabsProvider = (options: ElevenLabsOptions): AudioProvider => {
  const promptInfluence = options.promptInfluence ?? 0.3;
  const outputFormat = options.outputFormat ?? "mp3_44100_128";

  return {
    name: "elevenlabs",

    // Music and voice are deliberately out of scope — see the module note.
    supports: (request) => request.kind === "sfx" || request.kind === "ambience",

    async acquire(request: AudioRequest): Promise<ProviderResult> {
      const key = options.apiKey ?? process.env.ELEVENLABS_API_KEY;
      if (!key) {
        throw new Error(
          "ELEVENLABS_API_KEY is not set. Export it in the shell that runs acquisition; it is never read from, or written to, project files.",
        );
      }
      if (request.durationSeconds > MAX_GENERATION_SECONDS) {
        throw new Error(
          `requested ${request.durationSeconds}s but the sound-generation endpoint caps a single generation at ${MAX_GENERATION_SECONDS}s. ` +
            `Generate a shorter bed and loop it, or source this asset from a library.`,
        );
      }

      const doFetch = options.fetchImpl ?? fetch;
      const response = await doFetch(`${ENDPOINT}?output_format=${encodeURIComponent(outputFormat)}`, {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: request.description,
          model_id: MODEL_ID,
          duration_seconds: request.durationSeconds,
          prompt_influence: promptInfluence,
          // The endpoint can render a natively seamless loop — far better than hoping a
          // generated bed happens to start and end at the same level.
          loop: request.loop,
        }),
      });

      if (!response.ok) {
        // Surface status only. A provider error body can echo the request and is not worth risking.
        throw new Error(`ElevenLabs returned ${response.status} ${response.statusText}`);
      }

      // The endpoint returns MP3. Conversion to WAV is the acquisition layer's job (io.toWav),
      // not the adapter's — that keeps ffmpeg out of every provider we ever add.
      const bytes = new Uint8Array(await response.arrayBuffer());

      return {
        provider: "elevenlabs",
        providerAssetId: response.headers.get("request-id") ?? `sfx-${request.key}`,
        bytes,
        mime: outputFormat.startsWith("pcm") ? "audio/L16" : "audio/mpeg",
        licence: {
          basis: "ElevenLabs paid-plan commercial licence — royalty-free commercial use including advertising",
          attributionRequired: false,
          termsUrl: TERMS_URL,
          capturedAt: new Date().toISOString(),
        },
        generated: true,
        metadata: {
          model: MODEL_ID,
          promptInfluence,
          outputFormat,
          requestedSeconds: request.durationSeconds,
          loopRequested: request.loop,
        },
      };
    },
  };
};
