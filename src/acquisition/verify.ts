/**
 * acquisition/verify — technical QA on an acquired audio file.
 *
 * A provider returning a file is not the same as the file being usable. This measures what was
 * actually delivered — header validity, duration, sample rate, channels, peak level — and, for
 * ambience, how badly the end would clash with the beginning if it looped.
 *
 * Pure: it reads bytes it is handed and returns findings. Nothing here touches the filesystem
 * or a network.
 */

/** What a WAV header says about the file. */
export type AudioProbe = {
  format: "wav";
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  durationSeconds: number;
  /** Absolute peak, 0–1. */
  peak: number;
  /** Whole-file RMS, 0–1. */
  rms: number;
};

export type VerifyIssue = { code: string; detail: string };

export type VerifyResult = {
  ok: boolean;
  probe?: AudioProbe;
  issues: VerifyIssue[];
  /** 0–1, higher is a worse loop seam. Only computed when `loop` was requested. */
  seamDiscontinuity?: number;
  /** Spread between the loudest and quietest second, in dB. Only computed for loops. */
  levelRangeDb?: number;
};

const ascii = (b: Uint8Array, from: number, to: number): string =>
  String.fromCharCode(...b.subarray(from, to));

const u32 = (b: Uint8Array, o: number): number => b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24);
const u16 = (b: Uint8Array, o: number): number => b[o] | (b[o + 1] << 8);

/** Read a PCM WAV header and measure the samples. Returns null for anything it cannot parse. */
export const probeWav = (bytes: Uint8Array): AudioProbe | null => {
  if (bytes.length < 44 || ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 12) !== "WAVE") return null;

  let p = 12;
  let channels = 0, sampleRate = 0, bits = 0, dataOffset = -1, dataSize = 0;
  while (p + 8 <= bytes.length) {
    const id = ascii(bytes, p, p + 4);
    const size = u32(bytes, p + 4);
    if (id === "fmt ") {
      channels = u16(bytes, p + 10);
      sampleRate = u32(bytes, p + 12);
      bits = u16(bytes, p + 22);
    } else if (id === "data") {
      dataOffset = p + 8;
      dataSize = Math.min(size, bytes.length - dataOffset);
      break;
    }
    p += 8 + size + (size % 2);
  }
  if (dataOffset < 0 || !channels || !sampleRate || bits !== 16) return null;

  const frames = Math.floor(dataSize / (channels * 2));
  let peak = 0, sumSq = 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset + dataOffset, dataSize - (dataSize % 2));
  const total = Math.floor(view.byteLength / 2);
  for (let i = 0; i < total; i++) {
    const v = view.getInt16(i * 2, true) / 32768;
    const a = v < 0 ? -v : v;
    if (a > peak) peak = a;
    sumSq += v * v;
  }
  return {
    format: "wav",
    channels,
    sampleRate,
    bitsPerSample: bits,
    durationSeconds: frames / sampleRate,
    peak,
    rms: Math.sqrt(sumSq / Math.max(1, total)),
  };
};

/** Mean absolute amplitude over a window of frames, as a 0–1 figure. */
const windowLevel = (bytes: Uint8Array, dataOffset: number, dataSize: number, channels: number, fromFrame: number, frameCount: number): number => {
  const bytesPerFrame = channels * 2;
  const start = dataOffset + fromFrame * bytesPerFrame;
  const end = Math.min(start + frameCount * bytesPerFrame, dataOffset + dataSize);
  if (end <= start) return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset + start, end - start);
  let sum = 0, n = 0;
  for (let i = 0; i + 1 < view.byteLength; i += 2) {
    sum += Math.abs(view.getInt16(i, true) / 32768);
    n++;
  }
  return n ? sum / n : 0;
};

/**
 * How badly a file's tail would clash with its head if looped, 0 (seamless) → 1 (jarring).
 *
 * This is a level-continuity measure, not a phase one: it compares the mean amplitude of the
 * last 250ms against the first 250ms, normalised by the file's overall level. A bed that fades
 * out at the end or starts on a loud event scores high and should be rejected — those are the
 * failures that make a loop audible. It cannot detect a tonal mismatch at matched level, which
 * is why generated ambience still gets auditioned rather than trusted to this number alone.
 */
export const loopSeamDiscontinuity = (bytes: Uint8Array): number | undefined => {
  if (bytes.length < 44 || ascii(bytes, 0, 4) !== "RIFF") return undefined;
  let p = 12, channels = 0, sampleRate = 0, dataOffset = -1, dataSize = 0;
  while (p + 8 <= bytes.length) {
    const id = ascii(bytes, p, p + 4);
    const size = u32(bytes, p + 4);
    if (id === "fmt ") { channels = u16(bytes, p + 10); sampleRate = u32(bytes, p + 12); }
    else if (id === "data") { dataOffset = p + 8; dataSize = Math.min(size, bytes.length - dataOffset); break; }
    p += 8 + size + (size % 2);
  }
  if (dataOffset < 0 || !channels || !sampleRate) return undefined;

  const frames = Math.floor(dataSize / (channels * 2));
  const win = Math.min(Math.floor(sampleRate * 0.25), Math.floor(frames / 4));
  if (win < 32) return undefined;

  const head = windowLevel(bytes, dataOffset, dataSize, channels, 0, win);
  const tail = windowLevel(bytes, dataOffset, dataSize, channels, frames - win, win);
  const reference = Math.max(head, tail, 1e-6);
  return Math.min(1, Math.abs(head - tail) / reference);
};

/**
 * Spread between the loudest and quietest one-second window, in dB.
 *
 * This is the measure that actually predicts whether a bed works. An ambience track is supposed
 * to be a steady wash; one that swings 20dB across its length is a performance, not a bed, and it
 * will draw attention every time it cycles. Measured per second rather than instantaneously so
 * ordinary texture does not register as instability.
 */
export const levelRangeDb = (bytes: Uint8Array): number | undefined => {
  if (bytes.length < 44 || ascii(bytes, 0, 4) !== "RIFF") return undefined;
  let p = 12, channels = 0, sampleRate = 0, dataOffset = -1, dataSize = 0;
  while (p + 8 <= bytes.length) {
    const id = ascii(bytes, p, p + 4);
    const size = u32(bytes, p + 4);
    if (id === "fmt ") { channels = u16(bytes, p + 10); sampleRate = u32(bytes, p + 12); }
    else if (id === "data") { dataOffset = p + 8; dataSize = Math.min(size, bytes.length - dataOffset); break; }
    p += 8 + size + (size % 2);
  }
  if (dataOffset < 0 || !channels || !sampleRate) return undefined;

  const frames = Math.floor(dataSize / (channels * 2));
  const seconds = Math.floor(frames / sampleRate);
  if (seconds < 3) return undefined;

  let lo = Infinity, hi = 0;
  for (let s = 0; s < seconds; s++) {
    const level = windowLevel(bytes, dataOffset, dataSize, channels, s * sampleRate, sampleRate);
    if (level > hi) hi = level;
    if (level < lo) lo = level;
  }
  if (hi <= 0) return undefined;
  return 20 * Math.log10(hi / Math.max(lo, 1e-9));
};

/** Tolerances applied to a delivered file. */
export type VerifyOptions = {
  /** Acceptable deviation from the requested duration, in seconds. Default 1.5. */
  durationTolerance?: number;
  /** Reject above this peak. Default 0.99 — true digital clipping. */
  peakCeiling?: number;
  /** Reject a loop whose seam scores above this. Default 0.35. */
  seamCeiling?: number;
  /**
   * Reject a file whose PEAK falls below this, default 0.005 (−46 dBFS).
   *
   * Absolute RMS is the wrong test: room tone is *supposed* to be very quiet, and an earlier
   * RMS floor rejected a perfectly stable bed for being exactly what it should be. What actually
   * matters is whether enough bit depth remains to raise the file to mix level without dragging
   * quantisation noise up with it. Below roughly −46 dBFS peak, fewer than nine bits are in use
   * and gain-up audibly hisses.
   */
  peakFloor?: number;
  /** Reject a loop whose level swings more than this across its length, in dB. Default 12. */
  levelRangeCeiling?: number;
};

/** Measure a delivered file against what was asked for. */
export const verifyAudio = (
  bytes: Uint8Array,
  request: { durationSeconds: number; loop: boolean; channels?: 1 | 2 },
  options: VerifyOptions = {},
): VerifyResult => {
  const issues: VerifyIssue[] = [];
  const durTol = options.durationTolerance ?? 1.5;
  const peakCeiling = options.peakCeiling ?? 0.99;
  const seamCeiling = options.seamCeiling ?? 0.35;
  const peakFloor = options.peakFloor ?? 0.005;
  const rangeCeiling = options.levelRangeCeiling ?? 12;

  if (bytes.length === 0) {
    return { ok: false, issues: [{ code: "empty", detail: "provider returned zero bytes" }] };
  }

  const probe = probeWav(bytes);
  if (!probe) {
    return {
      ok: false,
      issues: [{ code: "unreadable", detail: "not a parseable 16-bit PCM WAV — convert before verifying" }],
    };
  }

  const drift = Math.abs(probe.durationSeconds - request.durationSeconds);
  if (drift > durTol) {
    issues.push({
      code: "duration",
      detail: `delivered ${probe.durationSeconds.toFixed(2)}s but ${request.durationSeconds.toFixed(2)}s (±${durTol}s) was requested`,
    });
  }
  if (request.channels !== undefined && probe.channels !== request.channels) {
    issues.push({ code: "channels", detail: `expected ${request.channels} channel(s), got ${probe.channels}` });
  }
  if (probe.peak >= peakCeiling) {
    issues.push({ code: "clipping", detail: `peak ${probe.peak.toFixed(3)} at or above ${peakCeiling}` });
  }
  if (probe.peak < peakFloor) {
    issues.push({
      code: "too-quiet",
      detail:
        `peak ${(20 * Math.log10(Math.max(probe.peak, 1e-9))).toFixed(1)} dBFS is below ` +
        `${(20 * Math.log10(peakFloor)).toFixed(1)} dBFS — too little bit depth to raise to mix level cleanly`,
    });
  }

  let range: number | undefined;
  if (request.loop) {
    range = levelRangeDb(bytes);
    if (range !== undefined && range > rangeCeiling) {
      issues.push({
        code: "unsteady",
        detail: `level swings ${range.toFixed(1)} dB across the file, above ${rangeCeiling} dB — a bed should be steady, not a performance`,
      });
    }
  }

  let seam: number | undefined;
  if (request.loop) {
    seam = loopSeamDiscontinuity(bytes);
    if (seam === undefined) {
      issues.push({ code: "seam-unmeasurable", detail: "could not measure the loop seam" });
    } else if (seam > seamCeiling) {
      issues.push({
        code: "loop-seam",
        detail: `seam discontinuity ${seam.toFixed(2)} above ${seamCeiling} — the loop point would be audible`,
      });
    }
  }

  return {
    ok: issues.length === 0,
    probe,
    issues,
    ...(seam !== undefined ? { seamDiscontinuity: seam } : {}),
    ...(range !== undefined ? { levelRangeDb: range } : {}),
  };
};
