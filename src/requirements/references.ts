import { type BrandRegistry } from "../brand";
import { type CompositionSchemaBase, type SceneResolver } from "../composition";
import { type AssetReference } from "./types";

/**
 * Which assets a resolved composition actually names.
 *
 * This is the question a requirement plan is built on, and it has exactly one
 * honest answer: the names that appear in the composition the template just
 * produced. Not the names in the pack — a pack holds everything every cut of
 * every template might use, and for the first production campaign that is 44
 * requirements against roughly 15 a fifteen-second edit references.
 *
 * ## Where a name can appear, and how each is known
 *
 * Three places, and they are not equally easy:
 *
 *   **Audio and music** are unambiguous. `AudioCue.asset` and
 *   `MusicConfig.asset` are declared fields, and `buildComposition` resolves
 *   them eagerly through `assets.require`. Reading them is not a guess.
 *
 *   **Scene props** are a convention. A scene's props are its component's own,
 *   so `media.asset` means something to `MediaScene` and nothing to the
 *   framework — and the reference is not resolved until the component renders.
 *   The scene DEFINITION now declares where its asset props are, which turns
 *   the convention into something readable without inspecting React.
 *
 *   **The brand** declares its own: a logo and a default music bed. A
 *   composition that names a brand can render those without any scene
 *   mentioning them, because brand components reach for them directly.
 *
 * ## What this deliberately does not do
 *
 * It does not walk props looking for keys called `asset`, which would count a
 * prop that merely shares the name. It does not match strings against the
 * registry, which would count a caption that happened to equal an asset key.
 * It does not look inside React elements — scene props legitimately contain
 * them, and a rendered tree is not available here and should not be.
 *
 * Every one of those would produce a plausible plan that is wrong, and wrong in
 * the direction that costs money: a generator acting on it makes assets nothing
 * renders, or misses assets a render needs.
 */


/** Read a dotted path out of plain data, stopping at anything that is not. */
function readPath(source: unknown, path: string): unknown {
  let current = source;

  for (const segment of path.split(".")) {
    if (current === null || typeof current !== "object") {
      return undefined;
    }

    // A React element is a legitimate prop value and never an asset reference.
    // Stopping here rather than descending is what keeps this away from the
    // component tree entirely.
    if ("$$typeof" in current) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

/**
 * Every asset the composition names, in the order it names them.
 *
 * Duplicates are kept: one shot used twice is two references, and collapsing
 * them here would lose the fact that the second exists. Deduplication happens
 * when requirements are assembled, where "how many times" stops mattering —
 * an asset needs producing once however often it appears.
 */
export function collectReferences(
  schema: CompositionSchemaBase,
  scenes: SceneResolver,
  brands: BrandRegistry,
): AssetReference[] {
  const references: AssetReference[] = [];

  for (const scene of schema.scenes ?? []) {
    const definition = scenes.has(scene.scene) ? scenes.require(scene.scene) : undefined;

    for (const path of definition?.assetPaths ?? []) {
      const value = readPath(scene.props, path);

      if (typeof value === "string" && value.length > 0) {
        references.push({
          name: value,
          via: "scene",
          ...(scene.label === undefined ? {} : { scene: scene.label }),
        });
      }
    }
  }

  for (const cue of schema.audio ?? []) {
    if (typeof cue.asset === "string" && cue.asset.length > 0) {
      references.push({
        name: cue.asset,
        via: "audio",
        ...(cue.label === undefined ? {} : { scene: cue.label }),
      });
    }
  }

  const music = schema.music;

  if (music?.asset !== undefined && music.asset.length > 0) {
    references.push({ name: music.asset, via: "music" });
  }

  // The brand's own. A composition naming a brand can render its logo and its
  // default bed without any scene mentioning either — the brand components
  // reach for them directly — so a plan that ignored these would under-report
  // the artefacts a render actually needs.
  if (typeof schema.brand === "string" && brands.has(schema.brand)) {
    const brand = brands.require(schema.brand);

    for (const logo of Object.values<unknown>(brand.logos ?? {})) {
      if (typeof logo === "string" && logo.length > 0) {
        references.push({ name: logo, via: "brand" });
      }
    }

    const brandMusic: unknown = brand.audio?.music;

    if (typeof brandMusic === "string" && brandMusic.length > 0) {
      references.push({ name: brandMusic, via: "brand" });
    }
  }

  return references;
}
