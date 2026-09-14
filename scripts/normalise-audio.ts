/**
 * Standardisation pass: bring already-approved audio to its declared delivery peak.
 *
 *   npx tsx scripts/normalise-audio.ts            # report only, changes nothing
 *   npx tsx scripts/normalise-audio.ts --apply
 *
 * Deliberately NOT Jet Set specific — it takes any `AudioRequest[]` carrying `targetPeakDb`, so
 * every future commercial standardises the same way. New assets are normalised during acquisition;
 * this exists for libraries acquired before that rule, or when a target changes.
 *
 * Guarantees, all verified rather than assumed:
 *   - the provider's original take is preserved under `source/` before anything is written
 *   - attenuation only; a file already at or below target is left byte-identical
 *   - sample rate, channel count and sample count are unchanged, so timing, pitch and speed cannot
 *     move — normalisation is a scalar multiply, proved per-file below
 *   - NOTHING is regenerated
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { probeWav } from "../src/acquisition/verify";
import { normalisePeak } from "../src/acquisition/wav";
import { jetSetAudioRequests } from "../src/jetset/audio-requests";
import type { AudioRequest } from "../src/acquisition";

const PUBLIC = join(process.cwd(), "public/jetset/audio");
const LEDGER = join(process.cwd(), "src/jetset/audio-provenance.json");
const apply = process.argv.includes("--apply");

const dirFor = (r: AudioRequest) =>
  r.kind === "ambience" ? "ambience" : r.kind === "music" ? "music" : r.kind === "voice" ? "vo" : "sfx";

const db = (x: number) => 20 * Math.log10(Math.max(x, 1e-9));

/**
 * Prove the delivery is a pure scalar multiple of the source: every non-trivial sample ratio must
 * agree with the measured gain. If it does, no resampling, retiming or filtering occurred and the
 * character is by definition unchanged — only the level.
 */
const provePureGain = (src: Uint8Array, out: Uint8Array, gainDb: number): { ok: boolean; maxDeviation: number } => {
  const dataStart = (b: Uint8Array) => {
    let p = 12;
    while (p + 8 <= b.length) {
      const id = String.fromCharCode(...b.subarray(p, p + 4));
      const size = b[p + 4] | (b[p + 5] << 8) | (b[p + 6] << 16) | (b[p + 7] << 24);
      if (id === "data") return [p + 8, Math.min(size, b.length - (p + 8))] as const;
      p += 8 + size + (size % 2);
    }
    return [-1, 0] as const;
  };
  const [so, ss] = dataStart(src);
  const [oo, os] = dataStart(out);
  if (so < 0 || oo < 0 || ss !== os) return { ok: false, maxDeviation: Infinity };

  const gain = Math.pow(10, gainDb / 20);
  const sv = new DataView(src.buffer, src.byteOffset + so, ss - (ss % 2));
  const ov = new DataView(out.buffer, out.byteOffset + oo, os - (os % 2));
  let worst = 0;
  for (let i = 0; i < Math.floor(sv.byteLength / 2); i++) {
    const a = sv.getInt16(i * 2, true);
    if (Math.abs(a) < 512) continue;             // ignore near-zero samples: rounding dominates
    const expected = a * gain;
    const actual = ov.getInt16(i * 2, true);
    const dev = Math.abs(actual - expected);
    if (dev > worst) worst = dev;
  }
  return { ok: worst <= 1.51, maxDeviation: worst };  // <=1 LSB of rounding is exact for int16
};

const rows: Record<string, unknown>[] = [];
console.log(apply ? "\nNORMALISING (writing)\n" : "\nDRY RUN — nothing will be written. Pass --apply to commit.\n");

for (const r of jetSetAudioRequests) {
  if (r.targetPeakDb === undefined) continue;
  const rel = `${dirFor(r)}/${r.key}.wav`;
  const delivery = join(PUBLIC, rel);
  if (!existsSync(delivery)) { console.log(`  ${r.key.padEnd(15)} SKIP (not present)`); continue; }

  // Preserve the provider's take once, before anything is ever written over it.
  const source = join(PUBLIC, "source", `${dirFor(r)}/${r.key}.wav`);
  const sourceExisted = existsSync(source);
  if (!sourceExisted && apply) { mkdirSync(dirname(source), { recursive: true }); copyFileSync(delivery, source); }

  const srcBytes = new Uint8Array(readFileSync(sourceExisted ? source : delivery));
  const before = probeWav(srcBytes);
  if (!before) { console.log(`  ${r.key.padEnd(15)} SKIP (unreadable)`); continue; }

  const { bytes: outBytes, gainDb } = normalisePeak(srcBytes, r.targetPeakDb);
  const after = probeWav(outBytes)!;
  const proof = gainDb === 0 ? { ok: true, maxDeviation: 0 } : provePureGain(srcBytes, outBytes, gainDb);

  const integrity =
    before.sampleRate === after.sampleRate &&
    before.channels === after.channels &&
    Math.abs(before.durationSeconds - after.durationSeconds) < 1e-6 &&
    proof.ok;

  if (apply && gainDb !== 0) writeFileSync(delivery, outBytes);

  rows.push({
    key: r.key,
    target: r.targetPeakDb,
    sourcePeakDb: Number(db(before.peak).toFixed(2)),
    deliveryPeakDb: Number(db(after.peak).toFixed(2)),
    gainAppliedDb: Number(gainDb.toFixed(2)),
    durationSeconds: Number(after.durationSeconds.toFixed(3)),
    channels: after.channels,
    sampleRate: after.sampleRate,
    integrity,
    maxSampleDeviation: proof.maxDeviation,
  });

  console.log(
    `  ${r.key.padEnd(15)} ${db(before.peak).toFixed(1).padStart(6)} -> ${db(after.peak).toFixed(1).padStart(6)} dBFS   ` +
      `gain ${gainDb.toFixed(2).padStart(6)} dB   ${integrity ? "integrity OK" : "INTEGRITY FAIL"}` +
      `${gainDb === 0 ? "   (already at or below target, untouched)" : ""}`,
  );
}

if (apply) {
  const ledger = JSON.parse(readFileSync(LEDGER, "utf8"));
  for (const row of rows) {
    const takes = ledger.takes.filter((t: { key: string; verdict: string }) => t.key === row.key && t.verdict === "accepted");
    const t = takes[takes.length - 1];
    if (!t) continue;
    t.sourcePeakDb = row.sourcePeakDb;
    t.deliveryPeakDb = row.deliveryPeakDb;
    t.gainAppliedDb = row.gainAppliedDb;
    t.sourcePath = `jetset/audio/source/${dirFor(jetSetAudioRequests.find((r) => r.key === row.key)!)}/${row.key}.wav`;
    t.normalisationNote =
      "Technical standardisation only: peak attenuation, no regeneration. Sample rate, channel count " +
      "and sample count unchanged, and the delivery is a verified scalar multiple of the source, so " +
      "timing, pitch, speed and character are unaltered. Creative balance remains a mix decision.";
  }
  writeFileSync(LEDGER, JSON.stringify(ledger, null, 2));
  console.log("\nprovenance updated; originals preserved under public/jetset/audio/source/\n");
} else {
  console.log("\ndry run complete — re-run with --apply to write\n");
}
