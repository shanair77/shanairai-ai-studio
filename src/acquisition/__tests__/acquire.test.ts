import { describe, expect, it, vi } from "vitest";
import { acquireAssets, destinationFor } from "../acquire";
import { wrapPcmAsWav } from "../wav";
import { elevenLabsProvider, MAX_GENERATION_SECONDS } from "../providers/elevenlabs";
import type { AcquisitionIO, AudioProvider, AudioRequest } from "../types";

const steadyWav = (seconds: number) => {
  const sr = 8000, frames = Math.round(seconds * sr);
  const pcm = new Uint8Array(frames * 2);
  const view = new DataView(pcm.buffer);
  for (let i = 0; i < frames; i++) view.setInt16(i * 2, Math.round(Math.sin(i * 0.05) * 0.5 * 32767), true);
  return wrapPcmAsWav(pcm, sr, 1);
};

const io = (): AcquisitionIO & { files: Map<string, Uint8Array> } => {
  const files = new Map<string, Uint8Array>();
  return { files, write: (p, b) => void files.set(p, b), read: (p) => files.get(p)!, now: () => "2026-08-23T00:00:00.000Z" };
};

const req = (over: Partial<AudioRequest> = {}): AudioRequest => ({
  key: "ambOcean", kind: "ambience", description: "ocean waves", durationSeconds: 4, loop: true, ...over,
});

const fakeProvider = (bytes: Uint8Array, name = "fake"): AudioProvider => ({
  name,
  supports: () => true,
  acquire: async () => ({
    provider: name, providerAssetId: "abc123", bytes, mime: "audio/wav",
    licence: { basis: "test licence", attributionRequired: false, capturedAt: "2026-08-23T00:00:00.000Z" },
    generated: true, metadata: { model: "test" },
  }),
});

describe("destinationFor", () => {
  it("routes each kind to its own directory", () => {
    expect(destinationFor(req({ kind: "ambience", key: "a" }), "wav")).toBe("ambience/a.wav");
    expect(destinationFor(req({ kind: "sfx", key: "b" }), "wav")).toBe("sfx/b.wav");
    expect(destinationFor(req({ kind: "music", key: "c" }), "wav")).toBe("music/c.wav");
    expect(destinationFor(req({ kind: "voice", key: "d" }), "wav")).toBe("vo/d.wav");
  });
});

describe("acquireAssets", () => {
  it("accepts a good asset, persists it and records full provenance", async () => {
    const store = io();
    const r = await acquireAssets([req()], [fakeProvider(steadyWav(4))], store, { pathPrefix: "jetset/audio" });
    expect(r.accepted).toHaveLength(1);
    const rec = r.accepted[0];
    expect(rec.path).toBe("jetset/audio/ambience/ambOcean.wav");
    expect(store.files.has(rec.path)).toBe(true);
    expect(rec.provider).toBe("fake");
    expect(rec.providerAssetId).toBe("abc123");
    expect(rec.prompt).toBe("ocean waves");
    expect(rec.generated).toBe(true);
    expect(rec.licenceBasis).toBe("test licence");
    expect(rec.attributionRequired).toBe(false);
    expect(rec.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(rec.finalDurationSeconds).toBeCloseTo(4, 1);
  });

  it("rejects a bad asset, records why, and quarantines the file instead of discarding it", async () => {
    const store = io();
    const r = await acquireAssets([req({ durationSeconds: 20 })], [fakeProvider(steadyWav(4))], store, { pathPrefix: "p" });
    expect(r.rejected).toHaveLength(1);
    expect(r.rejected[0].rejectionReason).toMatch(/duration/);
    expect(r.rejected[0].path).toContain("rejected/");
    expect(store.files.has(r.rejected[0].path)).toBe(true);
  });

  it("reports requests no provider will serve rather than failing the run", async () => {
    const musicOnly: AudioProvider = { name: "m", supports: (q) => q.kind === "music", acquire: async () => { throw new Error("nope"); } };
    const r = await acquireAssets([req()], [musicOnly], io());
    expect(r.unserved).toHaveLength(1);
    expect(r.records).toHaveLength(0);
  });

  it("records a provider error as a rejection and keeps going", async () => {
    const boom: AudioProvider = { name: "boom", supports: () => true, acquire: async () => { throw new Error("429 rate limited"); } };
    const r = await acquireAssets([req({ key: "a" }), req({ key: "b" })], [boom], io());
    expect(r.rejected).toHaveLength(2);
    expect(r.rejected[0].rejectionReason).toMatch(/429 rate limited/);
  });

  it("routes to the first provider that claims the request", async () => {
    const sfxOnly: AudioProvider = { ...fakeProvider(steadyWav(4), "sfxOnly"), supports: (q) => q.kind === "sfx" };
    const anything = fakeProvider(steadyWav(4), "anything");
    const r = await acquireAssets([req({ kind: "ambience" })], [sfxOnly, anything], io());
    expect(r.accepted[0].provider).toBe("anything");
  });
});

describe("format normalisation", () => {
  const mp3Provider = (): AudioProvider => ({
    name: "mp3prov",
    supports: () => true,
    acquire: async () => ({
      provider: "mp3prov", providerAssetId: "x", bytes: new Uint8Array([0x49, 0x44, 0x33, 0]), mime: "audio/mpeg",
      licence: { basis: "t", attributionRequired: false, capturedAt: "2026-08-23T00:00:00.000Z" }, generated: true,
    }),
  });

  it("converts a non-WAV delivery through io.toWav before verifying, and records the conversion", async () => {
    const store = { ...io(), toWav: () => steadyWav(4) };
    const r = await acquireAssets([req()], [mp3Provider()], store);
    expect(r.accepted).toHaveLength(1);
    expect(r.accepted[0].originalFormat).toBe("audio/mpeg");
    expect(r.accepted[0].finalFormat).toBe("audio/wav");
    expect(r.accepted[0].path.endsWith(".wav")).toBe(true);
  });

  it("rejects a non-WAV delivery as unverifiable when no converter is supplied", async () => {
    const r = await acquireAssets([req()], [mp3Provider()], io());
    expect(r.rejected).toHaveLength(1);
    expect(r.rejected[0].rejectionReason).toMatch(/unreadable/);
  });

  it("checksums the converted bytes, not the original", async () => {
    const store = { ...io(), toWav: () => steadyWav(4) };
    const r = await acquireAssets([req()], [mp3Provider()], store);
    const stored = store.files.get(r.accepted[0].path)!;
    expect(String.fromCharCode(...stored.subarray(0, 4))).toBe("RIFF");
  });

  it("leaves a WAV delivery untouched", async () => {
    const store = { ...io(), toWav: () => { throw new Error("must not be called"); } };
    const r = await acquireAssets([req()], [fakeProvider(steadyWav(4))], store);
    expect(r.accepted).toHaveLength(1);
    expect(r.accepted[0].finalFormat).toBeUndefined();
  });
});

describe("elevenLabsProvider", () => {
  const opts = { commercialPlan: true as const, apiKey: "test-key" };

  it("claims sfx and ambience but declines music and voice", () => {
    const p = elevenLabsProvider(opts);
    expect(p.supports(req({ kind: "sfx" }))).toBe(true);
    expect(p.supports(req({ kind: "ambience" }))).toBe(true);
    expect(p.supports(req({ kind: "music" }))).toBe(false);
    expect(p.supports(req({ kind: "voice" }))).toBe(false);
  });

  it("refuses to run without a key, and names the env var without leaking it", async () => {
    const p = elevenLabsProvider({ commercialPlan: true, apiKey: undefined });
    const prev = process.env.ELEVENLABS_API_KEY;
    delete process.env.ELEVENLABS_API_KEY;
    await expect(p.acquire(req())).rejects.toThrow(/ELEVENLABS_API_KEY is not set/);
    if (prev !== undefined) process.env.ELEVENLABS_API_KEY = prev;
  });

  it("refuses a duration beyond the endpoint's ceiling instead of silently truncating", async () => {
    const p = elevenLabsProvider(opts);
    await expect(p.acquire(req({ durationSeconds: MAX_GENERATION_SECONDS + 1 }))).rejects.toThrow(/caps a single generation/);
  });

  it("sends the key as a header and returns the endpoint's MP3 unaltered", async () => {
    const mp3 = new Uint8Array([0x49, 0x44, 0x33, 0x04, 0, 0, 0, 0]);
    const fetchImpl = vi.fn(async () => new Response(mp3, { status: 200, headers: { "request-id": "req-9" } })) as unknown as typeof fetch;
    const result = await elevenLabsProvider({ ...opts, fetchImpl }).acquire(req({ durationSeconds: 1 }));
    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((init.headers as Record<string, string>)["xi-api-key"]).toBe("test-key");
    expect(String(url)).toContain("output_format=mp3_44100_128");
    expect(result.mime).toBe("audio/mpeg");
    expect(result.providerAssetId).toBe("req-9");
    expect(result.generated).toBe(true);
  });

  it("asks the endpoint for a natively seamless loop when the cue loops", async () => {
    const fetchImpl = vi.fn(async () => new Response(new Uint8Array(8), { status: 200 })) as unknown as typeof fetch;
    await elevenLabsProvider({ ...opts, fetchImpl }).acquire(req({ loop: true, durationSeconds: 1 }));
    const body = JSON.parse((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string);
    expect(body.loop).toBe(true);
    expect(body.model_id).toBe("eleven_text_to_sound_v2");
  });

  it("accepts the endpoint's real 30s ceiling", async () => {
    const fetchImpl = vi.fn(async () => new Response(new Uint8Array(8), { status: 200 })) as unknown as typeof fetch;
    await expect(elevenLabsProvider({ ...opts, fetchImpl }).acquire(req({ durationSeconds: 30 }))).resolves.toBeDefined();
    await expect(elevenLabsProvider(opts).acquire(req({ durationSeconds: 31 }))).rejects.toThrow(/caps a single generation/);
  });

  it("never returns the api key in its result or metadata", async () => {
    const fetchImpl = vi.fn(async () => new Response(new Uint8Array(2000), { status: 200 })) as unknown as typeof fetch;
    const result = await elevenLabsProvider({ ...opts, fetchImpl }).acquire(req({ durationSeconds: 1 }));
    expect(JSON.stringify({ ...result, bytes: undefined })).not.toContain("test-key");
  });

  it("surfaces only the status on a provider failure, not the response body", async () => {
    const fetchImpl = vi.fn(async () => new Response("echoed prompt and key", { status: 401, statusText: "Unauthorized" })) as unknown as typeof fetch;
    await expect(elevenLabsProvider({ ...opts, fetchImpl }).acquire(req())).rejects.toThrow(/401 Unauthorized/);
    await expect(elevenLabsProvider({ ...opts, fetchImpl }).acquire(req())).rejects.not.toThrow(/echoed prompt/);
  });
});
