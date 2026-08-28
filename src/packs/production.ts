/**
 * packs/production — the content a programmatic caller is allowed to render.
 *
 * THE ENUMERATION IS THE FEATURE. `src/Root.tsx` registers everything the Studio
 * should be able to open: auditions, twin experiments, abandoned cuts, promos
 * mid-revision. That is correct for a workstation and wrong for an API. A caller
 * over a wire has no way to know which of those names is an approved deliverable
 * and which is a director comparing two takes, so the programmatic surface does
 * not offer them the choice — it offers this list, and this list contains only
 * finished, approved work.
 *
 * A pack is therefore an allow-list rather than a catalogue. Adding to it is a
 * deliberate act with an obvious question attached: is this thing done?
 *
 * ONE PACK, THREE CONSUMERS. `describe()`, `compile()` and `renderVideo()` all
 * read this same object, so what an agent discovers is exactly what it can
 * compile and exactly what it can render. Three separately-maintained lists
 * would drift, and the failure that produces — a template you can see but not
 * render, or worse, render but not see — surfaces at the far end of a job.
 *
 * PACKS ARE VALUES. Nothing here is global or mutable, so a test, an experiment
 * or a second deployment builds its own without touching this one. Registering a
 * template is an import, not a side effect.
 */

import { type CompilerConfig } from "../compiler";
import { type AssetManifest } from "../manifest";
import { jetSetAdventures, JET_SET } from "../jetset/brand";
import { jetSetAssets } from "../jetset/assets";
import { jetSetManifest } from "../jetset/manifest";
import { jetSetCampaignTemplate } from "../jetset/template";

/**
 * The approved templates, by the name a caller addresses them with.
 *
 * The key is the wire name and `definition.name` is the template's own; they
 * match here on purpose, and the framework does not require it to stay that way.
 */
export const productionTemplates = {
  "jetset-campaign": jetSetCampaignTemplate,
} as const;

/**
 * The production content pack.
 *
 * Brands and assets accompany the templates because a template that names an
 * asset its pack does not carry is a template that fails at build time, with a
 * message about a missing asset rather than about an incomplete pack. Shipping
 * them together makes the pack self-sufficient: everything `jetset-campaign`
 * refers to is reachable from this object.
 *
 * Scenes and transitions are absent because these templates use only builtins,
 * and `CompilerConfig` extends the framework defaults rather than replacing them.
 *
 * The manifest travels with the content rather than being passed at the render
 * call, because it is a property of the film and not of the machine rendering it.
 * A caller who names this pack should not also have to know which manifest goes
 * with it — that pairing is exactly what gets forgotten, and forgetting it means
 * the readiness check silently does not run.
 */
export const productionPack: CompilerConfig<typeof productionTemplates> & { manifest: AssetManifest } = {
  templates: productionTemplates,
  brands: { [JET_SET]: jetSetAdventures },
  assets: jetSetAssets,
  /**
   * Checked before a bundle is built, so a cut whose media is missing is refused
   * in milliseconds rather than delivered as a film with a hole in it. This is the
   * existing `defineAssetManifest` artefact — the same one the acquisition tooling
   * and the readiness test read, not a second list that could disagree with it.
   */
  manifest: jetSetManifest,
};

/** The names a caller may render. Derived, so it cannot fall out of step with the pack. */
export const PRODUCTION_TEMPLATE_NAMES = Object.keys(productionTemplates) as (keyof typeof productionTemplates)[];
