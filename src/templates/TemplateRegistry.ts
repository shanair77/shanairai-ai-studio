/**
 * templates/TemplateRegistry — the default (empty) template registry.
 *
 * The framework ships NO templates (no business content), so `templateRegistry` is empty by
 * default. Template packs populate their own via `createRegistry(...)` / `.extend(...)` — the
 * same registry-kernel recipe as scenes/transitions/assets/brands (ADR-001, ADR-005 §4.3).
 */

import { createRegistry, type Registry } from "../registry";
import { type TemplateMap } from "./types";

/** The default template registry — empty. Populate with template packs. */
export const templateRegistry: Registry<TemplateMap> = createRegistry<TemplateMap>({});
