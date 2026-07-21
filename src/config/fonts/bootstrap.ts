/**
 * config/fonts/bootstrap — the ONE sanctioned import-time side effect (invariant #9).
 *
 * Importing this module starts loading every base manifest face exactly once;
 * @remotion/google-fonts (via the provider) opens delayRender handles so the renderer blocks
 * until the faces are ready — making rendering deterministic and offline (the fonts are
 * vendored, not fetched at render).
 *
 * ONLY the application entry (`src/index.ts`) may import this module. Everything else —
 * including `config/fonts` itself — must stay pure on import, so that importing the compiler
 * never performs I/O. Enforced by `__tests__/import-safety.test.ts`.
 *
 * It loads through `loadFonts` rather than the provider directly, so the base faces are
 * registered in the same dedupe set a brand's lazy `loadFonts` call consults — a brand
 * sharing a base family therefore never re-loads it.
 */

import { loadFonts } from "./index";
import { fontManifest } from "./manifest";

/** Loading of every base manifest face, started once on import. */
export const fontsReady: Promise<void> = loadFonts(fontManifest);

/** Await all manifest fonts (for consumers/tests that must block on readiness). */
export const waitForFonts = (): Promise<void> => fontsReady;
