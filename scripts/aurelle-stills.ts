/**
 * scripts/aurelle-stills — QA still renderer for ShanairAICommercial45.
 *
 * Bundles the project ONCE, then renders a set of representative frames to out/aurelle-qa so
 * the film can be inspected frame-by-frame without re-bundling per still. Pass frames as args
 * (e.g. `tsx scripts/aurelle-stills.ts 30 120 465`) or omit to render the default QA set.
 */

import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const ID = "ShanairAICommercial45";
const DEFAULT_FRAMES = [30, 120, 180, 270, 330, 420, 465, 570, 690, 810, 900, 960, 1020, 1080, 1170, 1260, 1320, 1349];

const main = async () => {
  const frames = process.argv.slice(2).map(Number).filter((n) => Number.isFinite(n));
  const list = frames.length ? frames : DEFAULT_FRAMES;
  const outDir = path.join(process.cwd(), "out", "aurelle-qa");

  console.log("Bundling…");
  const serveUrl = await bundle({
    entryPoint: path.join(process.cwd(), "src", "index.ts"),
    webpackOverride: (c) => c,
  });
  const composition = await selectComposition({ serveUrl, id: ID });
  console.log(`Composition ${ID}: ${composition.width}x${composition.height} @ ${composition.fps}fps, ${composition.durationInFrames} frames`);

  for (const frame of list) {
    const output = path.join(outDir, `f${String(frame).padStart(4, "0")}.png`);
    await renderStill({ composition, serveUrl, output, frame, scale: 0.5, overwrite: true });
    console.log(`  ✓ frame ${frame} → ${path.relative(process.cwd(), output)}`);
  }
  console.log("Done.");
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
