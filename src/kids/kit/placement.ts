/** Position a character by its feet: shared by every story's characters. */

import type React from "react";

export type Placed = {
  /** Feet position in composition pixels. */
  x: number;
  y: number;
  /** Rendered height in pixels. */
  size?: number;
  flip?: boolean;
  /** Extra rotation in degrees, around the feet. */
  rotate?: number;
  opacity?: number;
};

export const place = ({ x, y, size = 200, flip, rotate = 0, opacity = 1 }: Placed): React.CSSProperties => ({
  position: "absolute",
  left: x - size / 2,
  top: y - size,
  width: size,
  height: size,
  transformOrigin: "50% 100%",
  rotate: `${rotate}deg`,
  scale: flip ? "-1 1" : "1 1",
  opacity,
});
