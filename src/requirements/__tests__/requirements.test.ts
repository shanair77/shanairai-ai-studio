import { describe, expect, it } from "vitest";

import { createCompiler } from "../../compiler";
import { assetRegistry } from "../../assets";
import { jetSetCampaignConfig } from "../../jetset/CampaignConfig";
import { jetSetCampaign15Config } from "../../jetset/CampaignConfig15";
import { jetSetCampaign30Config } from "../../jetset/CampaignConfig30";
import { jetSetAssets } from "../../jetset/assets";
import { productionPack } from "../../packs";
import { type CompositionSchema } from "../../composition";

/**
 * What a SPECIFIC render needs.
 *
 * The question this milestone exists to answer, and the reason it matters is
 * arithmetic: the pack declares 44 requirements, and a fifteen-second cut
 * references 15. A generator working from the pack would produce three times
 * the assets the film uses, and generation is the expensive step.
 */

const compiler = createCompiler(productionPack);

const plan = (cut: string, overrides: Record<string, unknown> = {}) =>
  compiler.requirementsFor({
    id: `plan-${cut}`,
    template: "jetset-campaign",
    params: { cut },
    brand: "jet-set-adventures",
    ...overrides,
  } as never);

/** Every asset name a locked configuration actually names, computed from the config. */
function namesIn(config: CompositionSchema): Set<string> {
  const names = new Set<string>();

  for (const scene of config.scenes ?? []) {
    const media = (scene.props as { media?: { asset?: string } } | undefined)?.media;

    if (typeof media?.asset === "string") names.add(media.asset);
  }
  for (const cue of config.audio ?? []) names.add(cue.asset);
  if (config.music?.asset !== undefined) names.add(config.music.asset);

  return names;
}

describe("requirements are specific to the render, not to the pack", () => {
  it.each([
    ["15", jetSetCampaign15Config],
    ["30", jetSetCampaign30Config],
    ["60", jetSetCampaignConfig],
  ])("cut %s reports fewer requirements than the pack declares", (cut, config) => {
    const result = plan(cut);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const packTotal = productionPack.manifest?.requirements.length ?? 0;
    expect(result.requirements.length).toBeLessThan(packTotal);
    // And it is not some fixed fraction — it tracks the edit.
    expect(result.requirements.length).toBeGreaterThanOrEqual(namesIn(config).size);
  });

  it("gives each cut a different requirement set", () => {
    const [fifteen, thirty, sixty] = ["15", "30", "60"].map((cut) => plan(cut));

    const count = (r: ReturnType<typeof plan>) => (r.ok ? r.requirements.length : -1);

    // The whole point. If these were equal the planner would be reporting the
    // pack, which is the thing it exists not to do.
    expect(count(fifteen)).toBeLessThan(count(thirty));
    expect(count(thirty)).toBeLessThan(count(sixty));
  });

  it("never reports the pack's own requirement count", () => {
    const packTotal = productionPack.manifest?.requirements.length ?? 0;

    for (const cut of ["15", "30", "60"]) {
      const result = plan(cut);
      expect(result.ok && result.requirements.length).not.toBe(packTotal);
    }
  });

  it("even the full master needs fewer than the pack holds", () => {
    // A pack carries everything every cut might use, including shots that were
    // cut from all of them. The master references 36 of 44.
    const result = plan("60");

    expect(result.ok && result.requirements.length).toBeLessThan(
      productionPack.manifest?.requirements.length ?? 0,
    );
  });
});

describe("structural equivalence with the composition", () => {
  it.each([
    ["15", jetSetCampaign15Config],
    ["30", jetSetCampaign30Config],
    ["60", jetSetCampaignConfig],
  ])("cut %s reports every asset the locked configuration names", (cut, config) => {
    // Computed from the configuration itself rather than from a hand-written
    // list, so an edit to the film changes both sides together. A hand-authored
    // expectation would keep passing after the planner stopped tracking reality.
    const result = plan(cut);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const planned = new Set(result.requirements.map((r) => r.name));
    for (const name of namesIn(config)) {
      expect(planned, `missing ${name}`).toContain(name);
    }
  });

  it("reports nothing the composition does not name", () => {
    const result = plan("15");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // The brand's own logo is legitimately included without any scene naming
    // it — brand components reach for it directly.
    const fromConfig = namesIn(jetSetCampaign15Config);
    const brandOwned = new Set(["badge"]);

    for (const requirement of result.requirements) {
      expect(
        fromConfig.has(requirement.name) || brandOwned.has(requirement.name),
        `${requirement.name} is in the plan but not in the composition`,
      ).toBe(true);
    }
  });

  it("names only assets the render's own registry can resolve", () => {
    // The registry is what `buildComposition` and `MediaBackdrop` resolve
    // through. A planned name it cannot resolve would be one the render would
    // fail on — so this is the same authority, asked earlier.
    const registry = assetRegistry.extend(jetSetAssets);
    const result = plan("60");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    for (const requirement of result.requirements) {
      expect(registry.has(requirement.name), `unresolvable ${requirement.name}`).toBe(true);
    }
  });
});

describe("what each requirement carries", () => {
  it("preserves provenance, so a planner knows what producing it means", () => {
    const result = plan("15");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    for (const requirement of result.requirements) {
      expect(["generated", "licensed", "owned"]).toContain(requirement.source);
      expect(["video", "image", "music", "voice", "ambience", "sfx"]).toContain(requirement.kind);
      expect(typeof requirement.purpose).toBe("string");
      expect(typeof requirement.path).toBe("string");
    }
  });

  it("distinguishes what must be generated from what is already owned", () => {
    // The distinction a cost estimate rests on.
    const result = plan("15");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const generated = result.requirements.filter((r) => r.source === "generated");
    const owned = result.requirements.filter((r) => r.source === "owned");

    expect(generated.length).toBeGreaterThan(0);
    expect(owned.length).toBeGreaterThan(0);
    expect(generated.length + owned.length).toBe(result.requirements.length);
  });

  it("says how the render reaches each asset", () => {
    const result = plan("15");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const origins = new Set(result.requirements.flatMap((r) => r.via));
    // Every route is exercised by this one cut: shots, cues, a bed and a logo.
    expect(origins).toEqual(new Set(["scene", "audio", "music", "brand"]));
  });

  it("counts an asset once however often the film uses it", () => {
    const result = plan("60");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const names = result.requirements.map((r) => r.name);
    // Producing an asset twice is not twice the work, and reporting it twice
    // would double a cost estimate.
    expect(names.length).toBe(new Set(names).size);
  });

  it("leaves nothing unresolved for the production pack", () => {
    for (const cut of ["15", "30", "60"]) {
      const result = plan(cut);
      expect(result.ok && result.unresolved).toEqual([]);
    }
  });
});

describe("validation matches compile exactly", () => {
  const cases = [
    ["unknown template", { template: "nope", params: {} }],
    ["invalid parameter", { params: { cut: "45" } }],
    ["missing brand", { brand: undefined }],
    ["unknown brand", { brand: "no-such-brand" }],
  ] as const;

  it.each(cases)("refuses %s exactly as compile does", (_label, overrides) => {
    const request = {
      id: "x",
      template: "jetset-campaign",
      params: { cut: "15" },
      brand: "jet-set-adventures",
      ...overrides,
    } as never;

    const compiled = compiler.compile(request);
    const planned = compiler.requirementsFor(request);

    // Same orchestrator, same stages. A plan produced for a request the
    // renderer would refuse is worse than no plan: somebody would generate
    // assets against it.
    expect(planned.ok).toBe(compiled.ok);
    expect(planned.ok).toBe(false);
    expect(planned.report.issues.map((i) => i.code)).toEqual(
      compiled.report.issues.map((i) => i.code),
    );
  });

  it("refuses a malformed request without an exception", () => {
    expect(compiler.requirementsFor({ template: 42 } as never).ok).toBe(false);
  });

  it("agrees with compile on a valid request", () => {
    const request = {
      id: "x",
      template: "jetset-campaign",
      params: { cut: "15" },
      brand: "jet-set-adventures",
    } as never;

    expect(compiler.requirementsFor(request).ok).toBe(compiler.compile(request).ok);
  });

  it("reports the registered version, not one the caller supplied", () => {
    const result = plan("15");

    expect(result.ok && result.version).toBe("1.0.0");
  });
});

describe("the result crosses a process boundary", () => {
  it("is JSON, round-trips, and carries nothing exotic", () => {
    const result = plan("15");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const json = JSON.stringify(result);
    expect(JSON.stringify(JSON.parse(json))).toBe(json);

    const findings: string[] = [];
    const walk = (value: unknown, path: string): void => {
      if (typeof value === "function") findings.push(`function at ${path}`);
      if (value !== null && typeof value === "object") {
        if ("$$typeof" in value) findings.push(`react element at ${path}`);
        for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
      }
      if (typeof value === "string") {
        if (value.startsWith("/Users/") || value.startsWith("/home/")) {
          findings.push(`absolute path at ${path}`);
        }
        if (value.includes("node_modules")) findings.push(`module path at ${path}`);
      }
    };
    walk(result, "result");

    expect(findings).toEqual([]);
  });

  it("carries only public-relative asset paths", () => {
    const result = plan("15");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    for (const requirement of result.requirements) {
      expect(requirement.path.startsWith("/")).toBe(false);
      expect(requirement.path).not.toContain("..");
    }
  });
});
