/**
 * acquisition/wav — minimal WAV container plumbing.
 *
 * Format handling, not vendor handling: providers return whatever they return, and everything
 * downstream expects a parseable 16-bit PCM WAV so verification can measure it. Kept out of the
 * provider adapters so no single vendor owns the shape.
 */

/** Wrap raw little-endian 16-bit PCM in a minimal WAV container. */
export const wrapPcmAsWav = (pcm: Uint8Array, sampleRate: number, channels: number): Uint8Array => {
  const header = new Uint8Array(44);
  const view = new DataView(header.buffer);
  const put = (o: number, s: string) => { for (let i = 0; i < s.length; i++) header[o + i] = s.charCodeAt(i); };
  put(0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true);
  put(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  put(36, "data");
  view.setUint32(40, pcm.length, true);

  const out = new Uint8Array(44 + pcm.length);
  out.set(header, 0);
  out.set(pcm, 44);
  return out;
};

/** True when the bytes already look like a RIFF/WAVE file. */
export const isWav = (bytes: Uint8Array): boolean =>
  bytes.length > 12 &&
  String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
  String.fromCharCode(...bytes.subarray(8, 12)) === "WAVE";

/**
 * Scale a 16-bit PCM WAV so its peak sits at `targetPeakDb` dBFS. Returns the file unchanged if
 * it is already at or below the target, so this only ever attenuates.
 *
 * Generative audio providers normalise their output close to full scale, which leaves a source
 * file with no headroom and reads as aggressive however far the mix pulls it down. Bringing a
 * delivery to a declared target at acquisition time makes the whole library consistent, and
 * records the gain applied so the change is never invisible.
 */
export const normalisePeak = (
  bytes: Uint8Array,
  targetPeakDb: number,
): { bytes: Uint8Array; gainDb: number } => {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (!isWav(bytes)) return { bytes, gainDb: 0 };

  let p = 12, dataOffset = -1, dataSize = 0;
  while (p + 8 <= bytes.length) {
    const id = ascii(p, p + 4);
    const size =
      bytes[p + 4] | (bytes[p + 5] << 8) | (bytes[p + 6] << 16) | (bytes[p + 7] << 24);
    if (id === "data") { dataOffset = p + 8; dataSize = Math.min(size, bytes.length - dataOffset); break; }
    p += 8 + size + (size % 2);
  }
  if (dataOffset < 0 || dataSize <= 0) return { bytes, gainDb: 0 };

  const out = new Uint8Array(bytes);
  const view = new DataView(out.buffer, out.byteOffset + dataOffset, dataSize - (dataSize % 2));
  const total = Math.floor(view.byteLength / 2);

  let peak = 0;
  for (let i = 0; i < total; i++) {
    const a = Math.abs(view.getInt16(i * 2, true));
    if (a > peak) peak = a;
  }
  if (peak === 0) return { bytes, gainDb: 0 };

  const target = Math.pow(10, targetPeakDb / 20) * 32767;
  if (peak <= target) return { bytes, gainDb: 0 };

  const gain = target / peak;
  for (let i = 0; i < total; i++) {
    const v = Math.round(view.getInt16(i * 2, true) * gain);
    view.setInt16(i * 2, Math.max(-32768, Math.min(32767, v)), true);
  }
  return { bytes: out, gainDb: 20 * Math.log10(gain) };
};
