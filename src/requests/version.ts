/**
 * requests/version — the request-format version + the migration registry (ADR-008 §4.8).
 *
 * The framework ships NO migrations (v1 is current); the mechanism is exercised by packs/tests that
 * register their own single-step (`vN → vN+1`) migrations. Longer upgrades are composed by chaining.
 */

import { createRegistry, type Registry } from "../registry";
import { type MigrationMap } from "./types";

/**
 * The ORIGINAL request schema version — the fixed floor migrations start from. A request with no
 * `version` field predates versioning, so it is assumed to be this baseline and migrated upward from
 * here. This constant must NEVER move: it is the permanent starting point, not the newest format.
 */
export const BASELINE_REQUEST_VERSION = "1";

/**
 * The current (newest) request schema version — the default migration TARGET. Advance this when a new
 * format ships. Today it equals `BASELINE_REQUEST_VERSION` ("1"); the two are intentionally distinct
 * constants so that when this moves, un-versioned requests still migrate from the baseline, not from
 * the newest format.
 */
export const CURRENT_REQUEST_VERSION = "1";

/** The default (empty) migration registry. Populate with single-step migrations. */
export const migrationRegistry: Registry<MigrationMap> = createRegistry<MigrationMap>({});
