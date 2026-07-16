/**
 * SafeArea — Keep key content inside a platform-safe region.
 *
 * Applies one of the fractional inset presets from `config/Layout.ts`
 * (default / social / minimal) as padding, converting fractions to pixels against
 * the live composition size. Top/bottom use height; left/right use width — so the
 * same preset frames correctly in portrait, landscape, and square.
 *
 *   default — light margins for general framing.
 *   social  — extra bottom room for captions/CTAs, extra top for handles/UI.
 *   minimal — near-edge, for full-bleed hero moments.
 *
 * Pass `debug` to overlay the boundary in Studio (never shows unless requested).
 * This is a layout wrapper only — it renders no visual chrome of its own.
 */

import { AbsoluteFill } from "remotion";
import { safeAreas, type SafeAreaToken } from "../config/Layout";
import { theme, withAlpha } from "../config/Theme";
import { useFormat } from "./useFormat";

type SafeAreaProps = {
  /** Which inset preset to apply. Defaults to "default". */
  preset?: SafeAreaToken;
  children?: React.ReactNode;
  /** Extra styles merged onto the padded container (e.g. flex alignment). */
  style?: React.CSSProperties;
  /** Show the safe-area boundary as a dashed overlay (Studio debugging only). */
  debug?: boolean;
};

export const SafeArea: React.FC<SafeAreaProps> = ({
  preset = "default",
  children,
  style,
  debug = false,
}) => {
  const { width, height } = useFormat();
  const insets = safeAreas[preset];

  const paddingTop = insets.top * height;
  const paddingBottom = insets.bottom * height;
  const paddingLeft = insets.left * width;
  const paddingRight = insets.right * width;

  return (
    <AbsoluteFill style={{ paddingTop, paddingBottom, paddingLeft, paddingRight, ...style }}>
      {children}
      {debug ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: paddingTop,
              bottom: paddingBottom,
              left: paddingLeft,
              right: paddingRight,
              border: `2px dashed ${withAlpha(theme.palette.gold[500], 0.9)}`,
              boxSizing: "border-box",
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
