#!/usr/bin/env node
/**
 * download-luxury-clips — make the LuxuryReel's generated footage permanent.
 *
 * `src/luxury/shots.ts` ships with each shot's `src` pointing at the CDN URL Higgsfield
 * returned when the clip was generated. Remotion plays those URLs directly, but CDN links
 * are not forever. This script downloads every remote `src` into `public/luxury/<id>.mp4`
 * and rewrites `shots.ts` to reference the local file, so the reel renders offline.
 *
 *   node scripts/download-luxury-clips.mjs          # download + rewrite
 *   node scripts/download-luxury-clips.mjs --dry    # only report what would change
 *
 * No dependencies — Node 18+ (global fetch).
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const shotsPath = join(root, "src", "luxury", "shots.ts");
const outDir = join(root, "public", "luxury");
const dry = process.argv.includes("--dry");

let source = await readFile(shotsPath, "utf8");
await mkdir(outDir, { recursive: true });

// Match `id: "...", ... src: "https://..."` inside a single shot literal.
const shotRe = /id:\s*"([^"]+)"([^}]*?)src:\s*"(https?:\/\/[^"]+)"/g;
const matches = [...source.matchAll(shotRe)];

if (matches.length === 0) {
  console.log("No remote clip URLs left in shots.ts — nothing to do.");
  process.exit(0);
}

for (const [, id, , url] of matches) {
  const ext = (url.split("?")[0].match(/\.(mp4|mov|webm)$/i)?.[1] ?? "mp4").toLowerCase();
  const localRel = `luxury/${id}.${ext}`;
  const localAbs = join(outDir, `${id}.${ext}`);

  if (dry) {
    console.log(`${id}: ${url} -> public/${localRel}`);
    continue;
  }

  process.stdout.write(`${id}: downloading… `);
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`FAILED (${res.status}) — left as remote URL`);
    continue;
  }
  await writeFile(localAbs, Buffer.from(await res.arrayBuffer()));
  source = source.replace(`src: "${url}"`, `src: "${localRel}"`);
  console.log(`saved public/${localRel}`);
}

if (!dry) {
  await writeFile(shotsPath, source);
  console.log("\nshots.ts now references the local files. Run `npm run lint` and `npm run dev`.");
}
