/**
 * Acquire the eight non-music sound assets for the LOCKED Jet Set cut.
 *
 *   npm run acquire:jetset            # ambience only (audition the risky category first)
 *   npm run acquire:jetset -- --sfx   # the four one-shots, once ambience is approved
 *   npm run acquire:jetset -- --all
 *
 * Reads ELEVENLABS_API_KEY from the environment or from the gitignored `.env`. The key is never
 * printed, never written to provenance, and never leaves this process.
 *
 * This is a PRE-RENDER step. It writes files into public/ and a provenance ledger, then exits.
 * Remotion is not involved and never calls a provider.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { acquireAssets, type AcquisitionIO } from "../src/acquisition";
import { elevenLabsProvider } from "../src/acquisition/providers/elevenlabs";
import { ambienceRequests, sfxRequests, jetSetAudioRequests } from "../src/jetset/audio-requests";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");
const LEDGER = join(ROOT, "src/jetset/audio-provenance.json");

/**
 * Load `.env` without a dependency.
 *
 * Two rules, both learned the hard way: a real environment variable beats the file, and within
 * the file the LAST definition of a key wins. Appending a corrected value is the obvious way to
 * fix a wrong one, and a first-wins parser silently keeps the stale line instead.
 */
const loadEnv = (): void => {
  const file = join(ROOT, ".env");
  if (!existsSync(file)) return;
  const parsed = new Map<string, string>();
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) parsed.set(m[1], m[2].replace(/^["']|["']$/g, ""));
  }
  for (const [k, v] of parsed) if (process.env[k] === undefined) process.env[k] = v;
};

/**
 * Decode a non-WAV delivery to 16-bit PCM WAV using the ffmpeg binary Remotion already ships,
 * so acquisition needs no transcoder dependency of its own. The endpoint returns MP3; everything
 * downstream measures WAV.
 */
const toWav = (bytes: Uint8Array, mime: string): Uint8Array => {
  const stamp = `${process.pid}-${Math.floor(process.hrtime()[1])}`;
  const ext = mime.includes("mpeg") ? "mp3" : mime.includes("opus") ? "opus" : "bin";
  const src = join(tmpdir(), `acq-${stamp}.${ext}`);
  const dst = join(tmpdir(), `acq-${stamp}.wav`);
  try {
    writeFileSync(src, bytes);
    execFileSync("npx", ["remotion", "ffmpeg", "-y", "-i", src, "-acodec", "pcm_s16le", dst], {
      stdio: "ignore",
      cwd: ROOT,
    });
    return new Uint8Array(readFileSync(dst));
  } finally {
    rmSync(src, { force: true });
    rmSync(dst, { force: true });
  }
};

const io: AcquisitionIO = {
  write(path, bytes) {
    const full = join(PUBLIC, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, bytes);
  },
  read: (path) => new Uint8Array(readFileSync(join(PUBLIC, path))),
  now: () => new Date().toISOString(),
  toWav,
};

const main = async (): Promise<void> => {
  loadEnv();
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error(
      "\nELEVENLABS_API_KEY is not set.\n" +
        "  Add it to the gitignored .env at the repo root:  ELEVENLABS_API_KEY=your_key\n" +
        "  Create one at elevenlabs.io -> Settings -> API Keys.\n" +
        "  A PAID plan is required: generated effects on the free tier are non-commercial only\n" +
        "  and cannot ship in an advertisement.\n",
    );
    process.exit(1);
  }

  const argv = process.argv.slice(2);
  const args = new Set(argv);
  const onlyArg = argv.find((a) => a.startsWith("--only="));
  let requests = args.has("--all") ? jetSetAudioRequests : args.has("--sfx") ? sfxRequests : ambienceRequests;
  if (onlyArg) {
    // Re-run named cues without re-spending on the ones already approved.
    const keys = new Set(onlyArg.slice("--only=".length).split(","));
    requests = jetSetAudioRequests.filter((r) => keys.has(r.key));
  }

  console.log(`\nAcquiring ${requests.length} asset(s) via ElevenLabs...\n`);
  const report = await acquireAssets(requests, [elevenLabsProvider({ commercialPlan: true })], io, {
    pathPrefix: "jetset/audio",
    // 0.85 (-1.4 dBFS) rather than the default 0.99: a source file should arrive with real
    // headroom. A take that peaks near full scale reads as aggressive even after the mix pulls
    // it down, and that is a regeneration, not something to ride out with a fader.
    verify: { durationTolerance: 2.5, seamCeiling: 0.35, peakCeiling: 0.85 },
  });

  for (const r of report.records) {
    const mark = r.verdict === "accepted" ? "ACCEPT" : "REJECT";
    console.log(`  ${mark}  ${r.key.padEnd(16)} ${(r.finalDurationSeconds ?? 0).toFixed(2)}s  ${r.path}`);
    if (r.rejectionReason) console.log(`          ${r.rejectionReason}`);
  }
  if (report.unserved.length) {
    console.log(`\n  unserved (no provider claimed them): ${report.unserved.map((r) => r.key).join(", ")}`);
  }

  const existing = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, "utf8")) : { takes: [] };
  existing.takes.push(...report.records);
  writeFileSync(LEDGER, JSON.stringify(existing, null, 2));

  console.log(
    `\n${report.accepted.length} accepted, ${report.rejected.length} rejected. ` +
      `Provenance appended to src/jetset/audio-provenance.json\n` +
      `Rejected takes are kept under public/jetset/audio/rejected/ rather than discarded.\n`,
  );
};

main().catch((error) => {
  // Never echo a provider response body — it can contain the request, and the request is ours.
  console.error(`\nAcquisition failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
