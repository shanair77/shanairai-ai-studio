/**
 * QuoteScene — a featured quotation or testimonial.
 *
 * An optional eyebrow over a large Quote that blurs into focus, with an attribution line
 * beneath. Reusable for a client testimonial, a customer story, a narrative pull-quote, a
 * founder line — anywhere a single voice carries the beat.
 */

import { BlurReveal, FadeUp } from "../animations";
import { Caption, Eyebrow, Quote } from "../components";
import { SceneFrame, TEXT_ALIGN, renderStaggered, type Alignment, type SceneBaseProps } from "./SceneFrame";

export type QuoteSceneProps = SceneBaseProps & {
  eyebrow?: React.ReactNode;
  /** The quotation. Rendered as a Quote. */
  quote?: React.ReactNode;
  /** Attribution line beneath the quote. Rendered as a Caption. */
  attribution?: React.ReactNode;
  /** Content alignment. Default "center". */
  align?: Alignment;
  /** Measure for the quote, in base-px. */
  maxWidth?: number;
};

export const QuoteScene: React.FC<QuoteSceneProps> = ({
  eyebrow,
  quote,
  attribution,
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
  if (quote)
    items.push((d) => (
      <BlurReveal delay={d}><Quote align={ta} maxWidth={maxWidth}>{quote}</Quote></BlurReveal>
    ));
  if (attribution)
    items.push((d) => <FadeUp delay={d}><Caption align={ta}>{attribution}</Caption></FadeUp>);

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
