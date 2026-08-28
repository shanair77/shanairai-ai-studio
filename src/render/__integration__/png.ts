/**
 * render/__integration__/png — enough PNG to read one pixel.
 *
 * The Tailwind proof needs an exact channel value out of a rendered frame, and Node
 * ships no image decoder. Adding an image library as a dependency to assert one
 * pixel would be a poor trade, so this reads the format directly: PNG's compression
 * is DEFLATE, which `node:zlib` already provides, and the only other step is
 * reversing the per-scanline filters.
 *
 * DELIBERATELY PARTIAL. 8-bit RGB and RGBA, no interlacing, no palettes, no 16-bit.
 * That is what Remotion's still renderer emits, and anything else throws with a
 * clear message rather than returning a plausible wrong colour — a decoder that
 * guesses would turn a failed Tailwind build into a passing test.
 *
 * Filter reversal follows the PNG specification's own definitions (RFC 2083 §6):
 * each scanline carries a filter byte, and each filter is defined in terms of the
 * bytes to the left (a), above (b) and above-left (c).
 */

import { inflateSync } from "node:zlib";

export type Rgba = { r: number; g: number; b: number; a: number };

export type DecodedPng = {
  width: number;
  height: number;
  /** Row-major RGBA, 4 bytes per pixel. */
  pixels: Uint8Array;
};

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Reverse one scanline's filter, in place. `bpp` is bytes per pixel. */
const unfilter = (filter: number, line: Uint8Array, previous: Uint8Array | undefined, bpp: number): void => {
  const prev = (i: number): number => previous?.[i] ?? 0;

  for (let i = 0; i < line.length; i += 1) {
    const a = i >= bpp ? line[i - bpp]! : 0;
    const b = prev(i);
    const c = i >= bpp ? prev(i - bpp) : 0;

    switch (filter) {
      case 0:
        break; // None
      case 1:
        line[i] = (line[i]! + a) & 0xff;
        break;
      case 2:
        line[i] = (line[i]! + b) & 0xff;
        break;
      case 3:
        line[i] = (line[i]! + ((a + b) >> 1)) & 0xff;
        break;
      case 4: {
        // Paeth: pick whichever of a/b/c the linear estimate a+b−c is closest to.
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        line[i] = (line[i]! + pred) & 0xff;
        break;
      }
      default:
        throw new Error(`png: unsupported scanline filter ${filter}`);
    }
  }
};

/** Decode an 8-bit RGB/RGBA, non-interlaced PNG to RGBA bytes. */
export const decodePng = (buffer: Buffer): DecodedPng => {
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("png: not a PNG file (signature mismatch)");
  }

  let width = 0;
  let height = 0;
  let colorType = -1;
  const idat: Buffer[] = [];

  // Chunk layout: 4-byte length, 4-byte type, payload, 4-byte CRC.
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const body = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      const bitDepth = body.readUInt8(8);
      colorType = body.readUInt8(9);
      const interlace = body.readUInt8(12);

      if (bitDepth !== 8) throw new Error(`png: only 8-bit samples are supported, got ${bitDepth}`);
      if (interlace !== 0) throw new Error("png: interlaced images are not supported");
      if (colorType !== 2 && colorType !== 6) {
        throw new Error(`png: only RGB (2) and RGBA (6) are supported, got colour type ${colorType}`);
      }
    } else if (type === "IDAT") {
      idat.push(Buffer.from(body));
    } else if (type === "IEND") {
      break;
    }

    offset += 12 + length;
  }

  if (width === 0 || height === 0) throw new Error("png: no IHDR chunk found");

  const channels = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = new Uint8Array(width * height * 4);

  let previous: Uint8Array | undefined;
  for (let y = 0; y < height; y += 1) {
    const start = y * (stride + 1);
    const filter = raw[start]!;
    const line = new Uint8Array(raw.subarray(start + 1, start + 1 + stride));

    unfilter(filter, line, previous, channels);
    previous = line;

    for (let x = 0; x < width; x += 1) {
      const from = x * channels;
      const to = (y * width + x) * 4;
      pixels[to] = line[from]!;
      pixels[to + 1] = line[from + 1]!;
      pixels[to + 2] = line[from + 2]!;
      pixels[to + 3] = channels === 4 ? line[from + 3]! : 255;
    }
  }

  return { width, height, pixels };
};

/** Read one pixel. */
export const pixelAt = (png: DecodedPng, x: number, y: number): Rgba => {
  const i = (y * png.width + x) * 4;
  return { r: png.pixels[i]!, g: png.pixels[i + 1]!, b: png.pixels[i + 2]!, a: png.pixels[i + 3]! };
};
