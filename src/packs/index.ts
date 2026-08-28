/**
 * packs — the curated content sets a programmatic caller may address.
 *
 * A pack is a plain `CompilerConfig` value: templates plus the brands and assets
 * they depend on. It is the unit that answers "what can this deployment render?"
 */

export {
  productionPack,
  productionTemplates,
  PRODUCTION_TEMPLATE_NAMES,
} from "./production";
