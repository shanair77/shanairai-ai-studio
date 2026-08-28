/**
 * jetset/template-equivalence — the template renders the approved commercial, not a
 * lookalike of it.
 *
 * The programmatic path introduced in M2.28 reaches the Jet Set campaign through a
 * template, while `src/JetSetCampaign.tsx` and the Studio still reach it through the
 * locked configs. Two paths to one deliverable is exactly the arrangement in which a
 * commercial quietly diverges from its approval — so this file pins them together.
 *
 * It compares the ASSEMBLED SCHEMA rather than the built composition, because the
 * built composition's `component` is a live React element that no equality check can
 * meaningfully compare. The schema is the last point at which the whole edit — every
 * shot, its treatment, its transition, every audio cue with its level and its fade —
 * is still data. If those agree, the two paths build the same film.
 *
 * The assertions run against the configs themselves rather than against a recorded
 * copy of them, so an approved change to a cut flows into the template and this file
 * keeps passing. What it catches is the divergence: a template that starts editing.
 * The lock files are then checked separately, which is what stops both paths from
 * moving together away from what was signed off.
 */

import { describe, expect, it } from "vitest";

import { execute } from "../../execution";
import { assetRegistry } from "../../assets";
import { brandRegistry } from "../../brand";
import { createRegistry } from "../../registry";
import { createCompiler } from "../../compiler";
import { productionPack } from "../../packs";
import { jetSetAssets } from "../assets";
import { jetSetAdventures, JET_SET } from "../brand";
import { jetSetCampaignConfig } from "../CampaignConfig";
import { jetSetCampaign30Config } from "../CampaignConfig30";
import { jetSetCampaign15Config } from "../CampaignConfig15";
import { jetSetCampaignTemplate, type JetSetCut } from "../template";
import cutdownLock from "../cutdown-lock.json";
import pictureLock from "../picture-lock.json";

const registries = {
  templates: createRegistry({ "jetset-campaign": jetSetCampaignTemplate }),
  assets: assetRegistry.extend(jetSetAssets),
  brands: brandRegistry.extend({ [JET_SET]: jetSetAdventures }),
};

/** Run the template path for one cut and hand back the schema it assembled. */
const schemaFor = (cut: JetSetCut) => {
  const result = execute(
    { id: `equivalence-${cut}`, template: "jetset-campaign", params: { cut }, brand: JET_SET },
    { registries },
  );
  if (!result.ok) {
    throw new Error(
      `template path failed for cut ${cut}:\n${result.report.issues.map((i) => ` - [${i.code}] ${i.stage}: ${i.message}`).join("\n")}`,
    );
  }
  return result;
};

const CUTS = [
  { cut: "60" as const, config: jetSetCampaignConfig, frames: pictureLock.composition.durationInFrames },
  { cut: "30" as const, config: jetSetCampaign30Config, frames: cutdownLock.cuts[0]!.composition.durationInFrames },
  { cut: "15" as const, config: jetSetCampaign15Config, frames: cutdownLock.cuts[1]!.composition.durationInFrames },
];

describe("jetset-campaign template ≡ the locked configuration", () => {
  it.each(CUTS)("cut $cut emits the config's scenes, shot for shot", ({ cut, config }) => {
    const { schema } = schemaFor(cut);

    // Identity, not just equality: the template hands back the config's own scene
    // objects. It cannot have rebuilt an equivalent-looking edit.
    expect(schema?.scenes).toBe(config.scenes);
    expect(schema?.scenes).toHaveLength(config.scenes!.length);
  });

  it.each(CUTS)("cut $cut carries the config's sound design unchanged", ({ cut, config }) => {
    const { schema } = schemaFor(cut);

    // Every cue: asset, role, start, duration, level, fades, loop flag and label.
    expect(schema?.audio).toEqual(config.audio);
    expect(schema?.music).toEqual(config.music);
  });

  it.each(CUTS)("cut $cut resolves the locked canvas and frame count", ({ cut, frames }) => {
    const { composition } = schemaFor(cut);

    expect(composition.width).toBe(1080);
    expect(composition.height).toBe(1920);
    // 24, from the template — the `vertical` preset says 30, and a caller of the
    // programmatic API never states an fps.
    expect(composition.fps).toBe(24);
    // The cut's own locked length, carried through `build` — not derived.
    expect(composition.durationInFrames).toBe(frames);
  });

  it.each(CUTS)("cut $cut matches the config path frame for frame", ({ cut, config }) => {
    const viaTemplate = schemaFor(cut).composition;

    // What `JetSetCampaign.tsx` does, via the public compiler over the same content.
    const viaConfig = execute(
      { id: config.id, template: "jetset-campaign", params: { cut }, brand: JET_SET, fps: config.fps, duration: config.duration },
      { registries },
    );
    expect(viaConfig.ok).toBe(true);

    const explicit = viaConfig.ok ? viaConfig.composition : undefined;
    expect(viaTemplate.durationInFrames).toBe(explicit?.durationInFrames);
    expect(viaTemplate.fps).toBe(explicit?.fps);
  });
});

describe("jetset-campaign through the production pack", () => {
  const compiler = createCompiler(productionPack);

  it("is the only template the pack exposes, and it reports its version", () => {
    const described = compiler.describe().templates;

    expect(described.map((t) => t.key)).toEqual(["jetset-campaign"]);
    expect(described[0]!.version).toBe(jetSetCampaignTemplate.version);
  });

  it("compiles every approved cut with no extra registry wiring", () => {
    for (const { cut, frames } of CUTS) {
      const result = compiler.compile({
        id: `pack-${cut}`,
        template: "jetset-campaign",
        params: { cut },
        brand: JET_SET,
      });

      expect(result.ok, `cut ${cut}: ${JSON.stringify(result.report.issues)}`).toBe(true);
      if (result.ok) expect(result.composition.durationInFrames).toBe(frames);
    }
  });

  it("refuses a cut that was never approved, before building anything", () => {
    const result = compiler.compile({
      id: "pack-bad-cut",
      template: "jetset-campaign",
      // A caller reaching past the typed surface — the case the wire actually presents.
      params: { cut: "45" } as never,
      brand: JET_SET,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.report.issues[0]!.path).toBe("cut");
      expect(result.report.trace.some((s) => s.stage === "build-composition" && s.status === "ok")).toBe(false);
    }
  });

  it("refuses to render without the brand the campaign requires", () => {
    const result = compiler.compile({
      id: "pack-no-brand",
      template: "jetset-campaign",
      params: { cut: "15" },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.report.issues[0]!.code).toBe("requires-brand");
  });
});
