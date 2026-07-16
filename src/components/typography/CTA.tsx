/**
 * CTA — Call-to-action label.
 *
 * Action-oriented text ("Shop now", "Learn more") meant to draw the eye. Composes `Text`
 * with the `body` token and the `accent` color, adding a heavier weight and wider tracking
 * drawn from the typography tokens (never raw numbers) so it reads as an actionable label.
 * This is a text role only — it renders no button chrome; wrap it in `Container` for that.
 *
 * Inherits all `Text` props: `align`, `maxWidth`, `opacity`, semantic `color`, `lineClamp`.
 * Animation-ready — pass a helper's returned transform/opacity via `style` (merged last).
 * Renders in normal document flow, so it sits correctly inside `<SafeArea>` / `<Container>`.
 */

import { theme } from "../../config/Theme";
import { Text, type TextProps } from "../Text";

export type CTAProps = TextProps & {
  /** Render in uppercase for a stronger label read. Default false. */
  uppercase?: boolean;
};

export const CTA: React.FC<CTAProps> = ({
  variant = "body",
  color = "accent",
  uppercase = false,
  style,
  ...rest
}) => (
  <Text
    variant={variant}
    color={color}
    style={{
      fontWeight: theme.typography.fontWeights.semibold,
      letterSpacing: theme.typography.letterSpacing.wide,
      ...(uppercase ? { textTransform: "uppercase" } : {}),
      ...style,
    }}
    {...rest}
  />
);
