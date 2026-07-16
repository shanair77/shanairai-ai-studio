/**
 * format/ — Runtime foundation for responsive, multi-format video.
 *
 * useFormat  — detect portrait/landscape/square + dimensions from the composition.
 * useScale   — proportional scaling of base-authored tokens by the short side.
 * SafeArea   — apply social/default/minimal safe-area presets as padding.
 *
 * These read from `config/Layout.ts` and `config/Theme.ts`; higher layers
 * (components, layouts, scenes) build on top of them.
 */

export { useFormat, getOrientation, type FormatInfo, type Orientation } from "./useFormat";
export { useScale, type ScaleInfo } from "./useScale";
export { SafeArea } from "./SafeArea";
