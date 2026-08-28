/**
 * media/ — full-bleed media primitives for footage-led compositions.
 *
 * `MediaBackdrop` is the reusable plate behind a scene: named asset → filled frame, optional
 * KenBurns drift, optional directional legibility scrim. It resolves from the ACTIVE asset
 * registry (context), so it is brand-agnostic and works with any kit.
 *
 * This layer sits above `assets` / `animations` / `config` and below `scenes`.
 */

export {
  MediaBackdrop,
  scrimGradient,
  type MediaBackdropProps,
  type ScrimSpec,
  type ScrimDirection,
  type KenBurnsSpec,
} from "./MediaBackdrop";
