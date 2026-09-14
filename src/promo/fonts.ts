/**
 * promo/fonts — the one typeface the base design system doesn't ship: a monospace face for
 * the code/terminal motion graphics. Loaded through @remotion/google-fonts exactly like the
 * base provider does, so it is vendored and delayRender-gated (deterministic, offline renders).
 *
 * Importing this module starts the load — the promo component tree imports it, and the root
 * imports that tree at registration, so the face is requested before the first frame renders.
 */

import { loadFont } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

/** Monospace stack for code/terminal UI. */
export const MONO = `"${fontFamily}", ui-monospace, "SF Mono", Menlo, monospace`;
