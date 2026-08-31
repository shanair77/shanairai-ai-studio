import { describe, expect, it } from "vitest";

import { createCompiler } from "../../compiler";
import { defineAsset } from "../../assets";
import { defineBrand } from "../../brand";
import { defineScene } from "../../composition";
import { defineTemplate } from "../../templates";
import { type AssetManifest, type AssetRequirement } from "../../manifest";
import { jetSetCampaign15Config } from "../../jetset/CampaignConfig15";
import { productionPack } from "../../packs";

/**
 * What happens when the manifest does not describe something the film uses.
 *
 * This is the failure that matters most, and it is the one a naive
 * implementation gets silently wrong: look each reference up, keep the hits,
 * move on. The misses vanish, the plan looks complete, and the asset nobody
 * described is the asset nobody produces — found at render time, or worse not
 * found at all because a placeholder rendered black.
 *
 * So a reference the manifest cannot describe is REPORTED, not dropped. It
 * cannot become a `PlannedRequirement` — there is no provenance, duration or
 * path to put in one — so it becomes an `UnresolvedReference`, which says the
 * render needs this and the pack cannot say what it is.
 *
 * ## The invariant
 *
 * Counting requirements proves nothing on its own: a planner that dropped a
 * reference and a planner that never saw it produce the same number. What
 * distinguishes them is comparing against the references the COMPOSITION
 * names, computed independently of the planner:
 *
 *     resolved requirements + unresolved references = referenced identities
 *
 * Both sides of that are derived from different places — the right from the
 * composition's own configuration, the left from the planner — so it fails if
 * the planner drops a reference, invents one, or double-counts one. Every case
 * below asserts it.
 *
 * A false negative here eventually means unbilled generation work and a render
 * that is not ready, so there is no acceptable rate for it.
 */

/* ------------------------------------------------------------------ *
 * A generic fixture.
 *
 * Deliberately not Jet Set. The production brand declares a logo and no
 * `audio`, so the brand-music channel is unexercised by real content — and a
 * channel that only ever runs in production is a channel whose failure mode is
 * discovered in production. This fixture names one asset through each of the
 * four channels and nothing else, so the expected identities are exact rather
 * than derived.
 * ------------------------------------------------------------------ */

const backdrop = defineScene<{ media: { asset: string } }>({
  component: () => null,
  defaultDuration: 1,
  assetPaths: ["media.asset"],
});

/** One asset per channel. The whole expected set, written once. */
const SHOT = "genericShot";
const CUE = "genericCue";
const BED = "genericBed";
const MARK = "genericMark";

const fixtureBrand = defineBrand({
  name: "Fixture",
  logos: { primary: MARK },
  audio: { music: BED },
} as Parameters<typeof defineBrand>[0]);

const fixtureTemplate = defineTemplate({
  name: "fixture",
  version: "test",
  parameters: { parameters: [] },
  build: () => ({
    scenes: [
      { scene: "backdrop", duration: 1, props: { media: { asset: SHOT } } },
      // The same shot twice: one asset to produce, however often it is used.
      { scene: "backdrop", duration: 1, props: { media: { asset: SHOT } } },
    ],
    audio: [{ asset: CUE }],
    music: { asset: BED },
  }),
});

const describeAs = (name: string, kind: AssetRequirement["kind"]): AssetRequirement => ({
  name,
  kind,
  path: `fixture/${name}`,
  purpose: "fixture",
  source: "generated",
  status: "outstanding",
});

const fixtureManifest: AssetManifest = {
  requirements: [
    describeAs(SHOT, "video"),
    describeAs(CUE, "voice"),
    describeAs(BED, "music"),
    describeAs(MARK, "image"),
  ],
} as AssetManifest;

/** The identities the fixture composition names. Four, one per channel. */
const FIXTURE_IDENTITIES = new Set([SHOT, CUE, BED, MARK]);

/**
 * The assets themselves.
 *
 * Required because audio and music are resolved EAGERLY when the composition is
 * built — a cue naming an unregistered asset is a build failure, long before
 * anything asks what the render needs. Scene visuals are not resolved until
 * React renders them, so the pack would build without `genericShot`; it is
 * registered anyway, because a fixture that only half-exists tests the planner
 * against a composition no renderer would accept.
 */
const fixtureAssets = {
  [SHOT]: defineAsset({ category: "video", source: "fixture/shot.mp4" }),
  [CUE]: defineAsset({ category: "audio", source: "fixture/cue.wav" }),
  [BED]: defineAsset({ category: "audio", source: "fixture/bed.wav" }),
  [MARK]: defineAsset({ category: "image", source: "fixture/mark.png" }),
};

/** The content, with no claim about what any of it is. */
const fixtureContent = {
  templates: { fixture: fixtureTemplate },
  scenes: { backdrop },
  assets: fixtureAssets,
  brands: { fixture: fixtureBrand },
};

const fixturePack = { ...fixtureContent, manifest: fixtureManifest };

/** The fixture pack with named entries struck from its manifest. */
function fixtureMissing(...names: string[]) {
  return {
    ...fixturePack,
    manifest: {
      ...fixtureManifest,
      requirements: fixtureManifest.requirements.filter((r) => !names.includes(r.name)),
    },
  };
}

const planFixture = (pack: typeof fixturePack) =>
  createCompiler(pack as never).requirementsFor({
    id: "fixture",
    template: "fixture",
    params: {},
    brand: "fixture",
  } as never);

/**
 * The invariant, as an assertion.
 *
 * `expected` is computed from the composition, never from the planner, which is
 * what makes this an oracle rather than a restatement.
 */
function expectConserved(
  result: ReturnType<typeof planFixture>,
  expected: ReadonlySet<string>,
): void {
  expect(result.ok).toBe(true);
  if (!result.ok) return;

  const accounted = [
    ...result.requirements.map((r) => r.name),
    ...result.unresolved.map((u) => u.name),
  ];

  // Nothing counted twice — the union is a partition, not an overlap.
  expect(new Set(accounted).size).toBe(accounted.length);
  expect(new Set(accounted)).toEqual(new Set(expected));
}

/* ------------------------------------------------------------------ *
 * The production composition, for the same invariant against real content.
 * ------------------------------------------------------------------ */

/** Identities the locked 15-second configuration names, computed from it. */
function productionIdentities(): Set<string> {
  const names = new Set<string>();
  const config = jetSetCampaign15Config;

  for (const scene of config.scenes ?? []) {
    const media = (scene.props as { media?: { asset?: string } } | undefined)?.media;

    if (typeof media?.asset === "string") names.add(media.asset);
  }
  for (const cue of config.audio ?? []) names.add(cue.asset);
  if (config.music?.asset !== undefined) names.add(config.music.asset);

  // The brand's own, which no scene names.
  const brand = productionPack.brands?.["jet-set-adventures"];

  for (const logo of Object.values<unknown>(brand?.logos ?? {})) {
    if (typeof logo === "string") names.add(logo);
  }

  return names;
}

function productionPackMissing(...names: string[]) {
  const manifest = productionPack.manifest;

  if (manifest === undefined) throw new Error("the production pack carries a manifest");

  return {
    ...productionPack,
    manifest: { ...manifest, requirements: manifest.requirements.filter((r) => !names.includes(r.name)) },
  };
}

const planProduction = (pack: typeof productionPack) =>
  createCompiler(pack).requirementsFor({
    id: "gate",
    template: "jetset-campaign",
    params: { cut: "15" },
    brand: "jet-set-adventures",
  } as never);

/* ------------------------------------------------------------------ */

describe("a reference the manifest cannot describe", () => {
  it("is reported rather than dropped", () => {
    const complete = planFixture(fixturePack);
    const missing = planFixture(fixtureMissing(SHOT));

    expect(complete.ok && missing.ok).toBe(true);
    if (!complete.ok || !missing.ok) return;

    expect(complete.requirements.map((r) => r.name)).toContain(SHOT);
    expect(complete.unresolved).toHaveLength(0);

    // It left the requirements and arrived in the unresolved list. It did not
    // simply cease to exist.
    expect(missing.requirements.map((r) => r.name)).not.toContain(SHOT);
    expect(missing.unresolved.map((u) => u.name)).toContain(SHOT);
  });

  it("is never silently omitted, whichever entries are missing", () => {
    // The invariant against every subset of the manifest: the planner accounts
    // for all four identities no matter how little the manifest describes.
    const channels = [SHOT, CUE, BED, MARK];

    for (let i = 0; i < 1 << channels.length; i += 1) {
      const omitted = channels.filter((_, bit) => (i & (1 << bit)) !== 0);

      expectConserved(planFixture(fixtureMissing(...omitted)), FIXTURE_IDENTITIES);
    }
  });

  it("reports one from every channel a reference can arrive by", () => {
    // A scene visual, an audio cue, the music bed and a brand asset — including
    // brand-audio, which no production brand exercises.
    const missing = planFixture(fixtureMissing(SHOT, CUE, BED, MARK));

    expect(missing.ok).toBe(true);
    if (!missing.ok) return;

    expect(missing.requirements).toHaveLength(0);
    expect(missing.unresolved).toHaveLength(4);

    const via = new Map(missing.unresolved.map((u) => [u.name, u.via]));

    expect(via.get(SHOT)).toContain("scene");
    expect(via.get(CUE)).toContain("audio");
    expect(via.get(BED)).toContain("music");
    expect(via.get(MARK)).toContain("brand");
  });

  it("keeps an asset reached two ways as one entry, with both origins", () => {
    // The bed is named by the composition AND declared by the brand. It is one
    // thing to produce, and `via` is what stops that fact from erasing either
    // route to it.
    const complete = planFixture(fixturePack);

    expect(complete.ok).toBe(true);
    if (!complete.ok) return;

    const bed = complete.requirements.filter((r) => r.name === BED);

    expect(bed).toHaveLength(1);
    expect(bed[0]?.via).toEqual(expect.arrayContaining(["music", "brand"]));

    // And the same when it is unresolved: still one entry, still both origins.
    const missing = planFixture(fixtureMissing(BED));

    expect(missing.ok).toBe(true);
    if (!missing.ok) return;

    const unresolvedBed = missing.unresolved.filter((u) => u.name === BED);

    expect(unresolvedBed).toHaveLength(1);
    expect(unresolvedBed[0]?.via).toEqual(expect.arrayContaining(["music", "brand"]));
  });

  it("counts a shot used twice once, resolved or not", () => {
    for (const pack of [fixturePack, fixtureMissing(SHOT)]) {
      const result = planFixture(pack);

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const accounted = [
        ...result.requirements.map((r) => r.name),
        ...result.unresolved.map((u) => u.name),
      ];

      expect(accounted.filter((n) => n === SHOT)).toHaveLength(1);
    }
  });

  it("reports every reference when the manifest describes nothing", () => {
    const empty = planFixture({ ...fixturePack, manifest: { requirements: [] } as AssetManifest });

    expect(empty.ok).toBe(true);
    if (!empty.ok) return;

    expect(empty.requirements).toHaveLength(0);
    expect(new Set(empty.unresolved.map((u) => u.name))).toEqual(FIXTURE_IDENTITIES);
    expectConserved(empty, FIXTURE_IDENTITIES);
  });

  it("is explicit when the pack carries no manifest at all", () => {
    const result = planFixture(fixtureContent as typeof fixturePack);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Not an empty plan presented as a complete one. A pack that describes
    // nothing knows nothing, and says so.
    expect(result.requirements).toHaveLength(0);
    expect(new Set(result.unresolved.map((u) => u.name))).toEqual(FIXTURE_IDENTITIES);
  });

  it("stays JSON-safe while reporting a problem", () => {
    const json = JSON.stringify(planFixture(fixtureMissing(SHOT, MARK)));

    expect(JSON.stringify(JSON.parse(json))).toBe(json);
  });
});

describe("refusal still comes before planning", () => {
  const compiler = createCompiler(fixturePack as never);

  it("refuses an unknown template rather than planning nothing", () => {
    // The distinction that matters: a refused request has no plan, which is not
    // the same as a plan with no requirements.
    const result = compiler.requirementsFor({ id: "x", template: "nope", params: {} } as never);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.report.issues.length).toBeGreaterThan(0);
  });

  it("refuses an invalid parameter", () => {
    const result = createCompiler(productionPack).requirementsFor({
      id: "x",
      template: "jetset-campaign",
      params: { cut: "45" },
      brand: "jet-set-adventures",
    } as never);

    expect(result.ok).toBe(false);
  });

  it("refuses an unknown brand, so brand assets are never guessed at", () => {
    const result = compiler.requirementsFor({
      id: "x",
      template: "fixture",
      params: {},
      brand: "no-such-brand",
    } as never);

    expect(result.ok).toBe(false);
  });
});

describe("the invariant holds for real production content", () => {
  it("accounts for every asset the locked 15-second cut names", () => {
    const expected = productionIdentities();
    const result = planProduction(productionPack);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const accounted = new Set([
      ...result.requirements.map((r) => r.name),
      ...result.unresolved.map((u) => u.name),
    ]);

    expect(accounted).toEqual(expected);
    expect(result.unresolved).toHaveLength(0);
  });

  it("still accounts for every one when the manifest is incomplete", () => {
    const expected = productionIdentities();
    const struck = ["a1DeskExhale", "vo01Hook", "musicBed", "badge"];
    const result = planProduction(productionPackMissing(...struck));

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const accounted = new Set([
      ...result.requirements.map((r) => r.name),
      ...result.unresolved.map((u) => u.name),
    ]);

    // Same total, redistributed. Nothing left the plan.
    expect(accounted).toEqual(expected);
    expect(result.unresolved.map((u) => u.name).sort()).toEqual([...struck].sort());
  });
});
