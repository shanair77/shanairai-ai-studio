/**
 * requests/version — the request-format version + the migration registry (ADR-008 §4.8).
 *
 * The framework ships NO migrations (v1 is current); the mechanism is exercised by packs/tests that
 * register their own single-step (`vN → vN+1`) migrations. Longer upgrades are composed by chaining.
 */

import { createRegistry, type Registry } from "../registry";
import { type MigrationMap } from "./types";

/** The current request schema version. A request with no `version` is assumed to be this baseline. */
export const CURRENT_REQUEST_VERSION = "1";

/** The default (empty) migration registry. Populate with single-step migrations. */
export const migrationRegistry: Registry<MigrationMap> = createRegistry<MigrationMap>({});
