/**
 * Kicker — Short lead-in phrase above a headline.
 *
 * Sibling to Eyebrow: same `overline` token and uppercase treatment, but carries the
 * `secondary` accent color so it reads as a punchier lead-in rather than a neutral
 * category label. Choose Eyebrow or Kicker by which accent the scene calls for.
 *
 * Inherits all `Text` props: `align`, `maxWidth`, `opacity`, semantic `color`, `lineClamp`.
 * Animation-ready — pass a helper's returned transform/opacity via `style` (merged last).
 * Renders in normal document flow, so it sits correctly inside `<SafeArea>` / `<Container>`.
 */

import { Text, type TextProps } from "../Text";

export type KickerProps = TextProps & {
  /** Render in uppercase (label convention). Default true. */
  uppercase?: boolean;
};

export const Kicker: React.FC<KickerProps> = ({
  variant = "overline",
  color = "secondary",
  uppercase = true,
  style,
  ...rest
}) => (
  <Text
    variant={variant}
    color={color}
    style={{ ...(uppercase ? { textTransform: "uppercase" } : {}), ...style }}
    {...rest}
  />
);
