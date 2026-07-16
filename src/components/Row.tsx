/**
 * Row — Horizontal flex layout.
 *
 * Lays children left-to-right with a scaled `gap` token. `align` controls the cross
 * (vertical) axis, `justify` the main (horizontal) axis, using short, readable values.
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

export type RowProps = {
  /** Spacing token for the gap between children. */
  gap?: SpacingToken;
  /** Cross-axis (vertical) alignment. */
  align?: Align;
  /** Main-axis (horizontal) distribution. */
  justify?: Justify;
  /** Allow children to wrap onto multiple lines. */
  wrap?: boolean;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

export const Row: React.FC<RowProps> = ({ gap, align, justify, wrap, style, className, children }) => {
  const { scale } = useScale();

  const composed: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    ...(gap !== undefined ? { gap: scale(spacing[gap]) } : {}),
    ...(align ? { alignItems: ALIGN[align] } : {}),
    ...(justify ? { justifyContent: JUSTIFY[justify] } : {}),
    ...(wrap ? { flexWrap: "wrap" } : {}),
    ...style,
  };

  return (
    <div className={className} style={composed}>
      {children}
    </div>
  );
};
