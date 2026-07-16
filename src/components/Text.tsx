/**
 * Text — Typographic primitive.
 *
 * Renders text using a Typography variant (display/h1/…/overline). Font size is the
 * only value scaled by `useScale()`; family, weight, line-height, and letter-spacing
 * come straight from the token so nothing is hardcoded.
 *
 * Animation-ready: pass transforms/opacity via `style` (merged last), so an animation
 * helper can drive motion without this component needing to know about frames.
 */

import { type TextStyleToken } from "../config/Typography";
import { theme } from "../config/Theme";
import { useScale } from "../format";

type ColorToken = keyof typeof theme.colors;
type TextAlign = "left" | "center" | "right" | "justify";

export type TextProps = {
  /** Typography role from `config/Typography.ts`. Default "body". */
  variant?: TextStyleToken;
  /** Semantic color token from the theme. Default "textPrimary". */
  color?: ColorToken;
  /** Text alignment. */
  align?: TextAlign;
  /** 0–1. Convenient for fade animations without touching `style`. */
  opacity?: number;
  /** Max line width. Number = base-px (scaled); string = raw CSS (e.g. "70%"). */
  maxWidth?: number | string;
  /** Truncate to N lines with an ellipsis. */
  lineClamp?: number;
  /** Escape hatch / animation props (transform, opacity, filter…). Merged last. */
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

export const Text: React.FC<TextProps> = ({
  variant = "body",
  color = "textPrimary",
  align,
  opacity,
  maxWidth,
  lineClamp,
  style,
  className,
  children,
}) => {
  const { scale } = useScale();
  const base = theme.typography.textStyles[variant];

  const composed: React.CSSProperties = {
    fontFamily: base.fontFamily,
    fontSize: scale(base.fontSize),
    fontWeight: base.fontWeight,
    lineHeight: base.lineHeight,
    letterSpacing: base.letterSpacing,
    color: theme.colors[color],
    ...(align ? { textAlign: align } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
    ...(maxWidth !== undefined
      ? { maxWidth: typeof maxWidth === "number" ? scale(maxWidth) : maxWidth }
      : {}),
    ...(lineClamp !== undefined
      ? {
          display: "-webkit-box",
          WebkitLineClamp: lineClamp,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }
      : {}),
    ...style,
  };

  return (
    <div className={className} style={composed}>
      {children}
    </div>
  );
};
