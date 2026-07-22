/**
 * BrandConfig — the legacy inline-brand config shape.
 *
 * A brand's identity expressed as inline configuration: a name, a starting theme mode, semantic
 * color overrides, and a mark reference. This type is consumed by the composition schema / request
 * (`brand?: BrandConfig | string`). The ACTIVE brand engine — registry, resolution, provider — lives
 * in `src/brand`; nothing here resolves or renders.
 */

import { type ThemeMode, type ThemeOverrides } from "../config/Theme";
import type { AssetRef } from "./CompositionSchema";

export type BrandConfig = {
  /** Display name (used by any mark/endcard you build — optional). */
  name?: string;
  /** Base theme mode to start from. Default "light". */
  mode?: ThemeMode;
  /** Semantic color overrides merged onto the base theme. */
  theme?: ThemeOverrides;
  /** Reference to a brand mark asset (path or catalog key). None ships by default. */
  mark?: AssetRef;
};
