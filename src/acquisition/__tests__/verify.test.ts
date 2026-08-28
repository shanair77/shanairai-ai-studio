import { describe, expect, it } from "vitest";
import { probeWav, verifyAudio, loopSeamDiscontinuity, levelRangeDb } from "../verify";
import { wrapPcmAsWav, normalisePeak } from "../wav";

/** Build a WAV of `seconds` at `sampleRate`, amplitude shaped by `shape(t)` in 0–1. */
const wav = (seconds: number, shape: (t: number) => number, sampleRate = 8000, channels = 1) => {
  const frames = Math.round(seconds * sampleRate);
  const pcm = new Uint8Array(frames * channels * 2);
  const view = new DataView(pcm.buffer);
  for (let i = 0; i < frames; i++) {
    const t = i / frames;
    const v = Math.round(Math.sin(i * 0.05) * shape(t) * 32767);
    for (let c = 0; c < channels; c++) view.setInt16((i * channels + c) * 2, v, true);
  }
  return wrapPcmAsWav(pcm, sampleRate, channels);
};

describe("probeWav", () => {
  it("reads duration, channels and rate from a real header", () => {
    const p = probeWav(wav(2, () => 0.5, 8000, 2));
    expect(p?.durationSeconds).toBeCloseTo(2, 2);
    expect(p?.channels).toBe(2);
    expect(p?.sampleRate).toBe(8000);
    expect(p?.bitsPerSample).toBe(16);
  });

  it("measures peak and rms", () => {
    const p = probeWav(wav(1, () => 0.5));
    expect(p!.peak).toBeGreaterThan(0.45);
    expect(p!.peak).toBeLessThanOrEqual(0.5);
    expect(p!.rms).toBeGreaterThan(0);
  });

  it("returns null for anything that is not a parseable PCM WAV", () => {
    expect(probeWav(new Uint8Array([1, 2, 3]))).toBeNull();
    expect(probeWav(new TextEncoder().encode("ID3 this is an mp3"))).toBeNull();
  });
});

describe("loopSeamDiscontinuity", () => {
  it("scores a steady bed as seamless", () => {
    expect(loopSeamDiscontinuity(wav(4, () => 0.5))!).toBeLessThan(0.1);
  });

  it("scores a bed that fades out as a bad seam", () => {
    // Level at the tail is near zero while the head is loud — audible on every loop.
    expect(loopSeamDiscontinuity(wav(4, (t) => 1 - t))!).toBeGreaterThan(0.8);
  });

  it("scores a bed that fades IN as a bad seam too", () => {
    expect(loopSeamDiscontinuity(wav(4, (t) => t))!).toBeGreaterThan(0.8);
  });
});

describe("levelRangeDb", () => {
  it("is near zero for a steady bed", () => {
    expect(levelRangeDb(wav(6, () => 0.5))!).toBeLessThan(2);
  });

  it("is large for a bed that swings", () => {
    expect(levelRangeDb(wav(8, (t) => 0.02 + 0.95 * t))!).toBeGreaterThan(12);
  });

  it("declines to judge a file too short to measure", () => {
    expect(levelRangeDb(wav(1, () => 0.5))).toBeUndefined();
  });
});

describe("verifyAudio", () => {
  const req = (over = {}) => ({ durationSeconds: 4, loop: false, ...over });

  it("accepts a well-formed file that matches the request", () => {
    const r = verifyAudio(wav(4, () => 0.5), req());
    expect(r.ok).toBe(true);
    expect(r.issues).toEqual([]);
  });

  it("rejects empty bytes", () => {
    const r = verifyAudio(new Uint8Array(0), req());
    expect(r.ok).toBe(false);
    expect(r.issues[0].code).toBe("empty");
  });

  it("rejects a file it cannot parse rather than guessing", () => {
    const r = verifyAudio(new TextEncoder().encode("not audio"), req());
    expect(r.issues[0].code).toBe("unreadable");
  });

  it("flags a duration outside tolerance and accepts one inside it", () => {
    expect(verifyAudio(wav(9, () => 0.5), req()).issues.map((i) => i.code)).toContain("duration");
    expect(verifyAudio(wav(4.8, () => 0.5), req()).ok).toBe(true);
  });

  it("flags a channel-count mismatch", () => {
    const r = verifyAudio(wav(4, () => 0.5, 8000, 1), req({ channels: 2 }));
    expect(r.issues.map((i) => i.code)).toContain("channels");
  });

  it("flags clipping", () => {
    const r = verifyAudio(wav(4, () => 1.0), req());
    expect(r.issues.map((i) => i.code)).toContain("clipping");
  });

  it("flags a file too quiet to raise to mix level cleanly", () => {
    const r = verifyAudio(wav(4, () => 0.002), req());
    expect(r.issues.map((i) => i.code)).toContain("too-quiet");
  });

  it("does NOT reject quiet-but-stable room tone — quiet is what room tone is", () => {
    // ~-43 dBFS peak, rock steady: exactly the real ambRoomTone generation an RMS floor rejected.
    const r = verifyAudio(wav(6, () => 0.007), req({ loop: true, durationSeconds: 6 }));
    expect(r.issues.map((i) => i.code)).not.toContain("too-quiet");
    expect(r.ok).toBe(true);
  });

  it("flags a bed whose level swings across its length", () => {
    // Loud middle, quiet ends - a performance, not a bed.
    const r = verifyAudio(wav(8, (t) => 0.05 + 0.9 * Math.sin(Math.PI * t)), req({ loop: true, durationSeconds: 8 }));
    expect(r.issues.map((i) => i.code)).toContain("unsteady");
    expect(r.levelRangeDb).toBeGreaterThan(12);
  });

  it("only checks the loop seam when a loop was requested", () => {
    const fading = wav(4, (t) => 1 - t);
    expect(verifyAudio(fading, req({ loop: false })).seamDiscontinuity).toBeUndefined();
    const looped = verifyAudio(fading, req({ loop: true }));
    expect(looped.seamDiscontinuity).toBeGreaterThan(0.8);
    expect(looped.issues.map((i) => i.code)).toContain("loop-seam");
  });

  it("passes a steady bed asked to loop", () => {
    expect(verifyAudio(wav(4, () => 0.5), req({ loop: true })).ok).toBe(true);
  });
});

describe("normalisePeak", () => {
  it("attenuates a hot file to the declared target", () => {
    const hot = wav(2, () => 0.98);
    const { bytes, gainDb } = normalisePeak(hot, -6);
    expect(gainDb).toBeLessThan(0);
    expect(probeWav(bytes)!.peak).toBeCloseTo(0.501, 1);
  });

  it("leaves a file already below the target completely untouched", () => {
    const quiet = wav(2, () => 0.2);
    const { bytes, gainDb } = normalisePeak(quiet, -6);
    expect(gainDb).toBe(0);
    expect(bytes).toBe(quiet);
  });

  it("only ever attenuates — it never raises a quiet file", () => {
    const quiet = wav(2, () => 0.01);
    expect(normalisePeak(quiet, -1).gainDb).toBe(0);
  });

  it("preserves duration and channel count", () => {
    const before = probeWav(wav(3, () => 0.95, 8000, 2))!;
    const after = probeWav(normalisePeak(wav(3, () => 0.95, 8000, 2), -12).bytes)!;
    expect(after.durationSeconds).toBeCloseTo(before.durationSeconds, 3);
    expect(after.channels).toBe(before.channels);
  });

  it("leaves non-WAV bytes alone rather than corrupting them", () => {
    const mp3 = new TextEncoder().encode("ID3 not a wav");
    expect(normalisePeak(mp3, -6).bytes).toBe(mp3);
  });
});
