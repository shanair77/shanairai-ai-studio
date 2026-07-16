/**
 * OutroScene — the closing card.
 *
 * An optional mark pops in, then title → subtitle → actions rise beneath it, centred. The
 * bookend to HeroScene: a sign-off, a handle, a "thanks for watching", a next-step prompt.
 * All copy and any mark are supplied by the caller — nothing is baked in.
 */

import { FadeUp, ScaleIn } from "../animations";
import { Headline, Subheadline } from "../components";
import { SceneFrame, TEXT_ALIGN, renderStaggered, type Alignment, type SceneBaseProps } from "./SceneFrame";

export type OutroSceneProps = SceneBaseProps & {
  /** Optional mark above the title (any node). Supplied by the caller. */
  mark?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Closing actions / handles (any node). */
  actions?: React.ReactNode;
  /** Content alignment. Default "center". */
  align?: Alignment;
  /** Measure for title/subtitle, in base-px. */
  maxWidth?: number;
};

export const OutroScene: React.FC<OutroSceneProps> = ({
  mark,
  title,
  subtitle,
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
  if (mark) items.push((d) => <ScaleIn delay={d}>{mark}</ScaleIn>);
  if (title)
    items.push((d) => <FadeUp delay={d}><Headline align={ta} maxWidth={maxWidth}>{title}</Headline></FadeUp>);
  if (subtitle)
    items.push((d) => (
      <FadeUp delay={d}><Subheadline align={ta} maxWidth={maxWidth}>{subtitle}</Subheadline></FadeUp>
    ));
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
