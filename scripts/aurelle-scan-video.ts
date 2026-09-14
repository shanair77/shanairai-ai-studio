/**
 * scripts/aurelle-scan-video — regenerate src/aurelle/videoManifest.ts.
 *
 * Scans public/aurelle/video for *.mp4 and writes the list into the manifest the composition
 * reads. Run after adding or removing generated clips:  npm run aurelle:scan-video
 */

import fs from "node:fs";
import path from "node:path";

const VIDEO_DIR = path.join(process.cwd(), "public", "aurelle", "video");
const MANIFEST = path.join(process.cwd(), "src", "aurelle", "videoManifest.ts");

const main = (): void => {
  const files = fs.existsSync(VIDEO_DIR)
    ? fs
        .readdirSync(VIDEO_DIR)
        .filter((f) => f.toLowerCase().endsWith(".mp4"))
        .sort()
    : [];

  const body = files.length ? files.map((f) => `  ${JSON.stringify(f)},`).join("\n") + "\n" : "";
  const out = `/**
 * aurelle/videoManifest — AUTO-GENERATED. Do not edit by hand.
 *
 * Lists the MP4 filenames currently present in \`public/aurelle/video/\`. Every media slot in
 * \`media.ts\` renders its still (with the editorial camera move) until its clip appears here,
 * then automatically switches to real footage — no edit changes required.
 *
 * Regenerate after adding or removing clips:  npm run aurelle:scan-video
 */

export const PRESENT_VIDEOS: string[] = [\n${body}];
`;

  fs.writeFileSync(MANIFEST, out);
  console.log(`aurelle-scan-video: ${files.length} clip(s) present in public/aurelle/video`);
  files.forEach((f) => console.log(`  • ${f}`));
  if (!files.length) console.log("  (none yet — every slot renders its still placeholder)");
};

main();
