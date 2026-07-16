/**
 * Eyebrow — Small label above a headline.
 *
 * A short, spaced-out category or section label that introduces the Headline beneath it.
 * Composes `Text` with the `overline` token (accent font, widest tracking) and the `accent`
 * color, uppercased by default. Distinct from Kicker only in emphasis color — see Kicker.
 *
 * Inherits all `Text` props: `align`, `maxWidth`, `opacity`, semantic `color`, `lineClamp`.
 * Animation-ready — pass a helper's returned transform/opacity via `style` (merged last).
 * Renders in normal document flow, so it sits correctly inside `<SafeArea>` / `<Container>`.
 */

import { Text, type TextProps } from "../Text";

export type EyebrowProps = TextProps & {
  /** Render in uppercase (label convention). Default true. */
  uppercase?: boolean;
};

export const Eyebrow: React.FC<EyebrowProps> = ({
  variant = "overline",
  color = "accent",
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
