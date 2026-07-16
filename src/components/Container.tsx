/**
 * Container — Generic layout wrapper (no visual identity of its own).
 *
 * Spacing (padding/margin), radius, and background come from theme tokens and scale
 * with `useScale()` so a container frames the same in any format. Supports flex,
 * center helpers, absolute positioning, and an optional `safeArea` preset that insets
 * children via the `<SafeArea>` frame.
 *
 * This is the neutral box everything sits in — Card/visual treatments come later.
 */

import { spacing, radii, type SpacingToken, type RadiusToken, type SafeAreaToken } from "../config/Layout";
import { theme } from "../config/Theme";
import { SafeArea, useScale } from "../format";

type ColorToken = keyof typeof theme.colors;
type Dimension = number | string;

export type ContainerProps = {
  /** Padding on all sides. */
  padding?: SpacingToken;
  /** Horizontal padding (left + right). Overrides `padding` on those sides. */
  paddingX?: SpacingToken;
  /** Vertical padding (top + bottom). Overrides `padding` on those sides. */
  paddingY?: SpacingToken;
  /** Margin on all sides. */
  margin?: SpacingToken;
  marginX?: SpacingToken;
  marginY?: SpacingToken;
  /** Corner radius token. */
  radius?: RadiusToken;
  /** Background from a semantic color token (use `style` for gradients). */
  background?: ColorToken;
  /** Number = base-px (scaled); string = raw CSS. */
  width?: Dimension;
  height?: Dimension;
  /** Enable flexbox (row by default; use Row/Column for directional layout). */
  flex?: boolean;
  /** Center children on both axes. */
  center?: boolean;
  /** Center children horizontally. */
  centerX?: boolean;
  /** Center children vertically. */
  centerY?: boolean;
  /** Position absolutely (pair with top/right/bottom/left). */
  absolute?: boolean;
  /** Absolutely fill the parent (position: absolute; inset: 0). */
  fill?: boolean;
  top?: Dimension;
  right?: Dimension;
  bottom?: Dimension;
  left?: Dimension;
  zIndex?: number;
  /** Inset children within a safe-area preset (default/social/minimal). */
  safeArea?: SafeAreaToken;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

export const Container: React.FC<ContainerProps> = ({
  padding,
  paddingX,
  paddingY,
  margin,
  marginX,
  marginY,
  radius,
  background,
  width,
  height,
  flex,
  center,
  centerX,
  centerY,
  absolute,
  fill,
  top,
  right,
  bottom,
  left,
  zIndex,
  safeArea,
  style,
  className,
  children,
}) => {
  const { scale } = useScale();
  const dim = (v: Dimension): number | string => (typeof v === "number" ? scale(v) : v);
  const useFlex = flex || center || centerX || centerY;

  const composed: React.CSSProperties = {
    ...(padding !== undefined ? { padding: scale(spacing[padding]) } : {}),
    ...(paddingX !== undefined
      ? { paddingLeft: scale(spacing[paddingX]), paddingRight: scale(spacing[paddingX]) }
      : {}),
    ...(paddingY !== undefined
      ? { paddingTop: scale(spacing[paddingY]), paddingBottom: scale(spacing[paddingY]) }
      : {}),
    ...(margin !== undefined ? { margin: scale(spacing[margin]) } : {}),
    ...(marginX !== undefined
      ? { marginLeft: scale(spacing[marginX]), marginRight: scale(spacing[marginX]) }
      : {}),
    ...(marginY !== undefined
      ? { marginTop: scale(spacing[marginY]), marginBottom: scale(spacing[marginY]) }
      : {}),
    ...(radius !== undefined ? { borderRadius: scale(radii[radius]) } : {}),
    ...(background !== undefined ? { backgroundColor: theme.colors[background] } : {}),
    ...(width !== undefined ? { width: dim(width) } : {}),
    ...(height !== undefined ? { height: dim(height) } : {}),
    ...(useFlex ? { display: "flex" } : {}),
    ...(center || centerX ? { justifyContent: "center" } : {}),
    ...(center || centerY ? { alignItems: "center" } : {}),
    ...(absolute || fill ? { position: "absolute" } : {}),
    ...(fill ? { top: 0, right: 0, bottom: 0, left: 0 } : {}),
    ...(top !== undefined ? { top: dim(top) } : {}),
    ...(right !== undefined ? { right: dim(right) } : {}),
    ...(bottom !== undefined ? { bottom: dim(bottom) } : {}),
    ...(left !== undefined ? { left: dim(left) } : {}),
    ...(zIndex !== undefined ? { zIndex } : {}),
    ...style,
  };

  return (
    <div className={className} style={composed}>
      {safeArea ? <SafeArea preset={safeArea}>{children}</SafeArea> : children}
    </div>
  );
};
