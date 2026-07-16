/**
 * ComparisonScene — equal panes set against each other.
 *
 * An optional eyebrow/title header, then each child becomes an equal-width pane (a column
 * in portrait), rising in on a stagger. The panes are yours — plan A vs plan B, before vs
 * after, us vs them, rent vs buy, manual vs automated. Structural only; no copy baked in.
 */

import React from "react";
import { FadeUp } from "../animations";
import { Column, Eyebrow, Headline, Row } from "../components";
import { type SpacingToken } from "../config/Layout";
import { useFormat } from "../format";
import { SceneFrame, STAGGER_STEP, TEXT_ALIGN, staggered, type Alignment, type SceneBaseProps } from "./SceneFrame";

export type ComparisonSceneProps = SceneBaseProps & {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  /** Content alignment for the header. Default "center". */
  align?: Alignment;
  /** Gap between panes. Default "lg". */
  gap?: SpacingToken;
};

export const ComparisonScene: React.FC<ComparisonSceneProps> = ({
  eyebrow,
  title,
  align = "center",
  gap = "lg",
  surface,
  background,
  safeArea,
  delay = 0,
  style,
  className,
  children,
}) => {
  const { isPortrait } = useFormat();
  const ta = TEXT_ALIGN[align];
  const header: Array<(d: number) => React.ReactNode> = [];
  if (eyebrow) header.push((d) => <FadeUp delay={d}><Eyebrow align={ta}>{eyebrow}</Eyebrow></FadeUp>);
  if (title) header.push((d) => <FadeUp delay={d}><Headline align={ta}>{title}</Headline></FadeUp>);

  const kids = React.Children.toArray(children);
  const paneBase = delay + header.length * STAGGER_STEP;
  const panes = kids.map((child, i) => (
    <FadeUp key={i} delay={staggered(paneBase, i)} style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
      {child}
    </FadeUp>
  ));

  return (
    <SceneFrame
      surface={surface}
      background={background}
      safeArea={safeArea}
      align={isPortrait ? "stretch" : align}
      justify="center"
      style={style}
      className={className}
    >
      {header.map((build, i) => (
        <React.Fragment key={i}>{build(staggered(delay, i))}</React.Fragment>
      ))}
      {kids.length > 0 ? (
        isPortrait ? (
          <Column gap={gap} align="stretch" justify="center">{panes}</Column>
        ) : (
          <Row gap={gap} align="stretch" justify="center">{panes}</Row>
        )
      ) : null}
    </SceneFrame>
  );
};
