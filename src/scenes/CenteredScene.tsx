/**
 * CenteredScene — the general-purpose centered content block.
 *
 * eyebrow → title → body → actions, centred on both axes and fading up on a stagger. The
 * everyday workhorse for a single message: a stat, a definition, a step, a takeaway.
 * Title is a Headline, body a Paragraph; pass text or nodes, and add more via `children`.
 */

import { FadeUp } from "../animations";
import { Eyebrow, Headline, Paragraph } from "../components";
import { SceneFrame, TEXT_ALIGN, renderStaggered, type Alignment, type SceneBaseProps } from "./SceneFrame";

export type CenteredSceneProps = SceneBaseProps & {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  /** Body copy beneath the title. Rendered as a Paragraph. */
  body?: React.ReactNode;
  actions?: React.ReactNode;
  /** Content alignment. Default "center". */
  align?: Alignment;
  /** Measure for title/body, in base-px. */
  maxWidth?: number;
};

export const CenteredScene: React.FC<CenteredSceneProps> = ({
  eyebrow,
  title,
  body,
  actions,
  align = "center",
  maxWidth,
  surface,
  background,
  safeArea,
  delay = 0,
  style,
  className,
  children,
}) => {
  const ta = TEXT_ALIGN[align];
  const items: Array<(d: number) => React.ReactNode> = [];
  if (eyebrow) items.push((d) => <FadeUp delay={d}><Eyebrow align={ta}>{eyebrow}</Eyebrow></FadeUp>);
  if (title)
    items.push((d) => <FadeUp delay={d}><Headline align={ta} maxWidth={maxWidth}>{title}</Headline></FadeUp>);
  if (body)
    items.push((d) => <FadeUp delay={d}><Paragraph align={ta} maxWidth={maxWidth}>{body}</Paragraph></FadeUp>);
  if (actions) items.push((d) => <FadeUp delay={d}>{actions}</FadeUp>);

  return (
    <SceneFrame
      surface={surface}
      background={background}
      safeArea={safeArea}
      align={align}
      justify="center"
      style={style}
      className={className}
    >
      {renderStaggered(items, delay)}
      {children}
    </SceneFrame>
  );
};
