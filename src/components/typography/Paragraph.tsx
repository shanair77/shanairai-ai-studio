/**
 * Paragraph — Body copy role.
 *
 * Multi-line running text. Composes `Text` with the `body` token; pair with `maxWidth`
 * for a comfortable measure and `lineClamp` to cap overflow. No size is hardcoded — it
 * scales through `useScale()`.
 *
 * Inherits all `Text` props: `align`, `maxWidth`, `opacity`, semantic `color`, `lineClamp`.
 * Animation-ready — pass a helper's returned transform/opacity via `style` (merged last).
 * Renders in normal document flow, so it sits correctly inside `<SafeArea>` / `<Container>`.
 */

import { Text, type TextProps } from "../Text";

export type ParagraphProps = TextProps;

export const Paragraph: React.FC<ParagraphProps> = ({
  variant = "body",
  color = "textPrimary",
  ...rest
}) => <Text variant={variant} color={color} {...rest} />;
