/**
 * Watermark — render the active brand's watermark, corner-positioned and safe-area aware.
 *
 * Reads the resolved brand from context and renders its watermark asset in a corner at a scaled
 * size. Returns null if no brand or no watermark is set. Sizes scale with the format via
 * `useScale`; sits at the `foreground` z-layer so it overlays scene content.
 */

import { AbsoluteFill } from "remotion";
import { zIndex } from "../config/Layout";
import { useScale } from "../format";
import { useBrand } from "../brand";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type WatermarkProps = {
  /** Corner to place the watermark. Default "bottom-right". */
  corner?: Corner;
  /** Watermark width in base-px (scaled per format). Default 140. */
  size?: number;
  /** 0–1 opacity. Default 0.85. */
  opacity?: number;
  /** Inset from the frame edge, in base-px (scaled). Default 48. */
  margin?: number;
};

const ALIGN: Record<Corner, React.CSSProperties> = {
  "top-left": { justifyContent: "flex-start", alignItems: "flex-start" },
  "top-right": { justifyContent: "flex-end", alignItems: "flex-start" },
  "bottom-left": { justifyContent: "flex-start", alignItems: "flex-end" },
  "bottom-right": { justifyContent: "flex-end", alignItems: "flex-end" },
};

export const Watermark: React.FC<WatermarkProps> = ({
  corner = "bottom-right",
  size = 140,
  opacity = 0.85,
  margin = 48,
}) => {
  const brand = useBrand();
  const { scale } = useScale();
  const node = brand?.renderWatermark?.();
  if (!node) return null;

  return (
    <AbsoluteFill style={{ display: "flex", padding: scale(margin), zIndex: zIndex.foreground, ...ALIGN[corner] }}>
      <div style={{ width: scale(size), height: scale(size), opacity }}>{node}</div>
    </AbsoluteFill>
  );
};
