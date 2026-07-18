/**
 * BrandLogo — render the active brand's logo as a node.
 *
 * Reads the resolved brand from context and renders its primary/alternate logo via the brand's
 * asset kit (aspect-preserving). Returns null if no brand or no logo is set — so it's safe to
 * drop into a scene slot (`mark: <BrandLogo />`) whether or not a brand is active.
 */

import { useBrand } from "../brand";

export type BrandLogoProps = {
  /** Which brand logo to render. Default "primary". */
  variant?: "primary" | "alternate";
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = "primary" }) => {
  const brand = useBrand();
  return <>{brand?.renderLogo?.(variant) ?? null}</>;
};
