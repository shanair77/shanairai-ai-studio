/**
 * Column — Vertical flex layout.
 *
 * Stacks children top-to-bottom with a scaled `gap` token. `align` controls the cross
 * (horizontal) axis, `justify` the main (vertical) axis. `fill` makes the column expand
 * to take the remaining height of a flex parent.
 */

import { spacing, type SpacingToken } from "../config/Layout";
import { useScale } from "../format";

type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";

const ALIGN: Record<Align, React.CSSProperties["alignItems"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

const JUSTIFY: Record<Justify, React.CSSProperties["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

export type ColumnProps = {
  /** Spacing token for the gap between children. */
  gap?: SpacingToken;
  /** Cross-axis (horizontal) alignment. */
  align?: Align;
  /** Main-axis (vertical) distribution. */
  justify?: Justify;
  /** Expand to fill the remaining height of a flex parent. */
  fill?: boolean;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

export const Column: React.FC<ColumnProps> = ({ gap, align, justify, fill, style, className, children }) => {
  const { scale } = useScale();

  const composed: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    ...(gap !== undefined ? { gap: scale(spacing[gap]) } : {}),
    ...(align ? { alignItems: ALIGN[align] } : {}),
    ...(justify ? { justifyContent: JUSTIFY[justify] } : {}),
    ...(fill ? { flex: 1, minHeight: 0 } : {}),
    ...style,
  };

  return (
    <div className={className} style={composed}>
      {children}
    </div>
  );
};
