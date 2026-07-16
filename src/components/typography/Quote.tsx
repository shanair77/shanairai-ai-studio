/**
 * Quote — Pull-quote / editorial excerpt.
 *
 * A featured line of quoted or emphasized copy. Composes `Text` with the `h3` token
 * (the delicate serif in the type system) and an italic slant by default for an editorial
 * feel. Size scales through `useScale()`; nothing is hardcoded.
 *
 * Inherits all `Text` props: `align`, `maxWidth`, `opacity`, semantic `color`, `lineClamp`.
 * Animation-ready — pass a helper's returned transform/opacity via `style` (merged last).
 * Renders in normal document flow, so it sits correctly inside `<SafeArea>` / `<Container>`.
 */

import { Text, type TextProps } from "../Text";

export type QuoteProps = TextProps & {
  /** Render italic (editorial pull-quote convention). Default true. */
  italic?: boolean;
};

export const Quote: React.FC<QuoteProps> = ({
  variant = "h3",
  color = "textPrimary",
  italic = true,
  style,
  ...rest
}) => (
  <Text
    variant={variant}
    color={color}
    style={{ ...(italic ? { fontStyle: "italic" } : {}), ...style }}
    {...rest}
  />
);
