/**
 * Stack — Layer children on top of one another (the "z" axis).
 *
 * Fills its parent (AbsoluteFill) and wraps each child in its own absolutely-positioned
 * layer, so later children paint over earlier ones. Use for backgrounds behind content,
 * overlays above it, etc. The whole stack can be placed on a z-layer via `zIndex`
 * (a raw number or a named token from `config/Layout.ts`: background/content/overlay…).
 *
 * For flow layout use Row/Column; Stack is strictly for overlapping layers.
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { zIndex as zLayers } from "../config/Layout";

type ZIndexToken = keyof typeof zLayers;

export type StackProps = {
  /** z-index for the entire stack: a number or a named layer token. */
  zIndex?: number | ZIndexToken;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

export const Stack: React.FC<StackProps> = ({ zIndex, style, className, children }) => {
  const resolvedZ = zIndex === undefined ? undefined : typeof zIndex === "number" ? zIndex : zLayers[zIndex];

  return (
    <AbsoluteFill
      className={className}
      style={{ ...(resolvedZ !== undefined ? { zIndex: resolvedZ } : {}), ...style }}
    >
      {React.Children.map(children, (child, i) => (
        <AbsoluteFill style={{ zIndex: i }}>{child}</AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
