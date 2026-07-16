/**
 * SplitScene — two panes side by side.
 *
 * Lays a `start` and `end` pane in a Row (landscape/square) or stacks them in a Column
 * (portrait), each sliding in from its side. `ratio` sets the proportion, `reverse` swaps
 * order. Pane content is whatever you pass — copy beside media, chart beside caption,
 * agent beside transcript, before beside after. Purely structural; brings no copy.
 */

import { FadeLeft, FadeRight } from "../animations";
import { Column, Row } from "../components";
import { type SpacingToken } from "../config/Layout";
import { useFormat } from "../format";
import { SceneFrame, STAGGER_STEP, type SceneBaseProps } from "./SceneFrame";

export type SplitSceneProps = SceneBaseProps & {
  /** Primary pane (slides in from the left / top). */
  start?: React.ReactNode;
  /** Secondary pane (slides in from the right / bottom). */
  end?: React.ReactNode;
  /** Swap the order of the two panes. */
  reverse?: boolean;
  /** Flex proportion [start, end]. Default [1, 1]. */
  ratio?: [number, number];
  /** Cross-axis alignment of the panes. Default "center". */
  align?: "start" | "center" | "end" | "stretch";
  /** Gap between panes. Default "xl". */
  gap?: SpacingToken;
};

export const SplitScene: React.FC<SplitSceneProps> = ({
  start,
  end,
  reverse = false,
  ratio = [1, 1],
  align = "center",
  gap = "xl",
  surface,
  background,
  safeArea,
  delay = 0,
  style,
  className,
}) => {
  const { isPortrait } = useFormat();
  const [f1, f2] = ratio;

  const paneStart = start ? (
    <FadeRight key="start" delay={delay} style={{ flex: f1, minWidth: 0, minHeight: 0 }}>
      {start}
    </FadeRight>
  ) : null;
  const paneEnd = end ? (
    <FadeLeft key="end" delay={delay + STAGGER_STEP} style={{ flex: f2, minWidth: 0, minHeight: 0 }}>
      {end}
    </FadeLeft>
  ) : null;
  const panes = reverse ? [paneEnd, paneStart] : [paneStart, paneEnd];

  return (
    <SceneFrame
      surface={surface}
      background={background}
      safeArea={safeArea}
      align="stretch"
      justify="center"
      style={style}
      className={className}
    >
      {isPortrait ? (
        <Column gap={gap} align="stretch" justify="center" style={{ flex: 1 }}>
          {panes}
        </Column>
      ) : (
        <Row gap={gap} align={align} justify="center" style={{ flex: 1, width: "100%" }}>
          {panes}
        </Row>
      )}
    </SceneFrame>
  );
};
