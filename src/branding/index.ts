/**
 * branding/ — brand identity components.
 *
 * `BrandLogo` and `Watermark` render the active brand's marks (read from the brand context) as
 * nodes, so authors drop them into scene slots or overlays. They own placement, not content —
 * the brand supplies the assets.
 */

export { BrandLogo, type BrandLogoProps } from "./BrandLogo";
export { Watermark, type WatermarkProps } from "./Watermark";
