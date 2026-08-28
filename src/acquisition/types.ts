/**
 * acquisition/types — the provider-agnostic audio acquisition contract.
 *
 * One narrow seam sits between "what the film needs" and "where it comes from". A production
 * declares `AudioRequest`s; a provider adapter answers with a `ProviderResult`; the acquisition
 * step verifies, persists and records it. Nothing vendor-specific crosses that seam — an adapter's
 * own response shape is its private business, so adding a provider later never touches the
 * composition engine, the AssetKit or the render path.
 *
 * DETERMINISTIC RENDER RULE. Nothing in this layer may be imported by anything Remotion renders.
 * Acquisition happens BEFORE render and leaves ordinary local files behind; a re-render of an
 * approved campaign therefore reproduces the same frames and never calls a provider. This mirrors
 * how fonts are vendored rather than fetched (see `config/fonts/bootstrap`), and is enforced by
 * `__tests__/render-isolation.test.ts`.
 */

/** What a cue is for. Drives which providers can answer and how it is verified. */
export type AudioKind = "sfx" | "ambience" | "music" | "voice";

/** A request for one audio asset, expressed in production terms rather than vendor terms. */
export type AudioRequest = {
  /** Asset name in the project's kit and manifest. The join key for everything downstream. */
  key: string;
  kind: AudioKind;
  /** Creative description: a generation prompt, or a library search phrase. */
  description: string;
  /** Target length in seconds. Verification checks the delivered file against this. */
  durationSeconds: number;
  /** Ambience beds loop; one-shots and narration must not. Drives the seam check. */
  loop: boolean;
  channels?: 1 | 2;
  format?: "wav" | "mp3";
  /** Mix role, carried through so the manifest entry can be built without a second lookup. */
  role?: string;
  /**
   * Attenuate the delivery so its peak sits here, in dBFS. Only ever reduces.
   *
   * Generative providers normalise close to full scale; a source file with no headroom reads as
   * aggressive however far the mix pulls it down. Declaring the target here makes the library
   * consistent instead of leaving it to a fader later.
   */
  targetPeakDb?: number;
  /** Optional project context an adapter may pass to a provider that accepts it. */
  context?: { project?: string; client?: string };
};

/** The commercial basis on which an asset may be used. Captured at acquisition time. */
export type LicenceInfo = {
  /** Human-readable basis, e.g. "ElevenLabs paid-plan commercial licence". */
  basis: string;
  attributionRequired: boolean;
  /** Terms URL as it stood when the asset was acquired. */
  termsUrl?: string;
  /** ISO timestamp the licence position was captured. */
  capturedAt: string;
};

/**
 * What an adapter returns. Deliberately normalised: bytes plus facts, no vendor payloads.
 * An adapter that receives JSON from its provider keeps that JSON to itself.
 */
export type ProviderResult = {
  provider: string;
  /** The provider's own id for the asset or generation job. */
  providerAssetId: string;
  bytes: Uint8Array;
  mime: string;
  /** Length the provider claims, if it says. Verification measures the file regardless. */
  sourceDurationSeconds?: number;
  licence: LicenceInfo;
  /** True when the asset was generated, false when sourced from a library. */
  generated: boolean;
  /** Small, non-secret provider facts worth keeping (model id, seed, licence id…). */
  metadata?: Record<string, string | number | boolean>;
};

/**
 * A provider adapter. `supports` lets the acquisition step route a request without knowing
 * anything about the provider, so a music-only or SFX-only provider composes cleanly.
 */
export type AudioProvider = {
  name: string;
  supports(request: AudioRequest): boolean;
  acquire(request: AudioRequest): Promise<ProviderResult>;
};

/** Everything needed to answer "where did this file come from?" long after the fact. */
export type AcquisitionRecord = {
  key: string;
  provider: string;
  providerAssetId: string;
  /** The generation prompt or library search that produced it. */
  prompt: string;
  acquiredAt: string;
  originalFormat: string;
  /** Set only when a conversion actually happened. */
  finalFormat?: string;
  /**
   * Attenuation applied to reach `targetPeakDb`, in dB. Absent when none was needed.
   *
   * Three peak-related figures are deliberately kept distinct and must never be conflated:
   *   - `sourcePeakDb`   what the provider delivered, before anything was done to it
   *   - `deliveryPeakDb` the local file as it will actually be used
   *   - the composition's per-cue `volume`, which is a CREATIVE mix decision and lives in the
   *     composition config, not here
   * Peak normalisation is a technical preparation step. It standardises headroom; it does not
   * balance the film. Two beds normalised to the same peak will still sit at different levels in
   * the mix, and should.
   */
  gainAppliedDb?: number;
  /** Peak of the provider's delivery, in dBFS, before normalisation. */
  sourcePeakDb?: number;
  /** Peak of the local file as it will be used, in dBFS. */
  deliveryPeakDb?: number;
  sourceDurationSeconds?: number;
  finalDurationSeconds?: number;
  /** `public/`-relative path of the persisted file. */
  path: string;
  sha256: string;
  licenceBasis: string;
  attributionRequired: boolean;
  /** Generated vs library-sourced — a materially different rights position. */
  generated: boolean;
  verdict: "accepted" | "rejected";
  /** Why it failed verification or audition. Present only when rejected. */
  rejectionReason?: string;
};

/** Injected side effects, so this layer stays testable and free of ambient I/O. */
export type AcquisitionIO = {
  /** Persist bytes at a `public/`-relative path. */
  write(path: string, bytes: Uint8Array): void;
  /** Read back a persisted file for verification. */
  read(path: string): Uint8Array;
  now(): string;
  /**
   * Convert a non-WAV delivery into 16-bit PCM WAV so verification can measure it.
   *
   * Injected rather than built in, for two reasons: it keeps a transcoder dependency out of the
   * pure layer, and it means a provider returning MP3, Opus or FLAC needs no adapter changes —
   * only the runner that supplies this function has to know how to decode. Omit it and a
   * non-WAV delivery is rejected as unverifiable rather than silently trusted.
   */
  toWav?(bytes: Uint8Array, mime: string): Uint8Array;
};

export type AcquisitionReport = {
  records: AcquisitionRecord[];
  accepted: AcquisitionRecord[];
  rejected: AcquisitionRecord[];
  /** Requests no registered provider was willing to answer. */
  unserved: AudioRequest[];
};
