/**
 * MediaScene — a footage-led shot: full-bleed media with optional restrained typography.
 *
 * The workhorse of a commercial. Where the other scenes are type-first with an optional
 * background, this one is picture-first: the plate IS the content, and any words are a lower
 * third laid over it. Copy is deliberately limited to three slots so a montage shot cannot
 * quietly turn into a text card — if a scene needs more than a label, a line and a caption, it
 * wants `centered` or `feature` instead.
 *
 * Type defaults to the bottom of the frame with the scrim anchored to match, which is where a
 * 9:16 social edit wants it. Pass `justify` to move it and set the backdrop's own scrim
 * direction to follow.
 */

import { BlurReveal, FadeUp } from "../animations";
import { Caption, Eyebrow, Headline } from "../components";
import { MediaBackdrop, type MediaBackdropProps } from "../media";
import { SceneFrame, TEXT_ALIGN, renderStaggered, type Alignment, type SceneBaseProps } from "./SceneFrame";

export type MediaSceneProps = SceneBaseProps & {
  /** The plate. Omit to fall back to the scene's plain `surface` / `background`. */
  media?: MediaBackdropProps;
  /** Small label above the title — a place name, a section marker. */
  eyebrow?: React.ReactNode;
  /** The line. Kept short by intent; revealed with a focus pull. */
  title?: React.ReactNode;
  /** One supporting line beneath the title. */
  caption?: React.ReactNode;
  /** Horizontal alignment of the type block. Default "start". */
  align?: Alignment;
  /** Vertical placement of the type block. Default "end" (lower third). */
  justify?: "start" | "center" | "end";
  /** Type size for the title. Default "h1"; use "display" for a single-word card. */
  titleVariant?: "display" | "h1" | "h2";
  /** Measure for the title/caption, in base-px. */
  maxWidth?: number;
};

export const MediaScene: React.FC<MediaSceneProps> = ({
  media,
  eyebrow,
  title,
  caption,
  align = "start",
  justify = "end",
  titleVariant = "h1",
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
    items.push((d) => (
      <BlurReveal delay={d}>
        <Headline variant={titleVariant} align={ta} maxWidth={maxWidth}>{title}</Headline>
      </BlurReveal>
    ));
  if (caption)
    items.push((d) => <FadeUp delay={d}><Caption align={ta} maxWidth={maxWidth}>{caption}</Caption></FadeUp>);

  return (
    <SceneFrame
      surface={surface}
      background={media ? <MediaBackdrop {...media} /> : background}
      safeArea={safeArea}
      align={align === "center" ? "center" : "stretch"}
      justify={justify}
      style={style}
      className={className}
    >
      {renderStaggered(items, delay)}
      {children}
    </SceneFrame>
  );
};
