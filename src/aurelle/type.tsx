/**
 * aurelle/type — the film's typographic voice.
 *
 * Two faces do all the work: an editorial high-contrast serif (Playfair Display) for the house
 * name, seasons and reveal lines, and a spaced modern sans (Jost) for overlines, labels and
 * technical chrome — the luxury-serif / modern-sans pairing the brief asks for. These are thin
 * wrappers over a scaled <div>: fully controlled (family, size, tracking, weight, colour) so
 * the AURELLE act stays visually independent of any theme role. Sizes are base-px at 1080 and
 * scaled by useScale(); nothing here animates — scenes drive motion via the primitives.
 */

import React from "react";
import { useScale } from "../format";
import { CREAM } from "../promo/palette";
import { FONT } from "./config";

export const Display: React.FC<{
  children: React.ReactNode;
  /** Base-px font size at 1080. */
  size?: number;
  color?: string;
  weight?: number;
  /** em tracking. */
  tracking?: number;
  lineHeight?: number;
  align?: React.CSSProperties["textAlign"];
  italic?: boolean;
  soft?: boolean;
  style?: React.CSSProperties;
}> = ({ children, size = 104, color = CREAM, weight = 600, tracking = 0.02, lineHeight = 1.02, align = "center", italic = false, soft = false, style }) => {
  const { scale } = useScale();
  return (
    <div
      style={{
        fontFamily: soft ? FONT.serifSoft : FONT.serif,
        fontSize: scale(size),
        fontWeight: weight,
        fontStyle: italic ? "italic" : "normal",
        letterSpacing: `${tracking}em`,
        lineHeight,
        color,
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Label: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  tracking?: number;
  align?: React.CSSProperties["textAlign"];
  style?: React.CSSProperties;
}> = ({ children, size = 22, color = CREAM, weight = 600, tracking = 0.34, align = "center", style }) => {
  const { scale } = useScale();
  return (
    <div
      style={{
        fontFamily: FONT.label,
        fontSize: scale(size),
        fontWeight: weight,
        letterSpacing: `${tracking}em`,
        textTransform: "uppercase",
        color,
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Body: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  tracking?: number;
  align?: React.CSSProperties["textAlign"];
  style?: React.CSSProperties;
}> = ({ children, size = 30, color = CREAM, weight = 400, tracking = 0.02, align = "center", style }) => {
  const { scale } = useScale();
  return (
    <div
      style={{
        fontFamily: FONT.sans,
        fontSize: scale(size),
        fontWeight: weight,
        letterSpacing: `${tracking}em`,
        color,
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
