/**
 * Subheadline — Secondary title role.
 *
 * Sits beneath a Headline to extend or qualify it. Composes `Text` with the `h2` token
 * and the muted `textSecondary` color so it reads as support, not competition.
 *
 * Inherits all `Text` props: `align`, `maxWidth`, `opacity`, semantic `color`, `lineClamp`.
 * Animation-ready — pass a helper's returned transform/opacity via `style` (merged last).
 * Renders in normal document flow, so it sits correctly inside `<SafeArea>` / `<Container>`.
 */

import { Text, type TextProps } from "../Text";

export type SubheadlineProps = TextProps;

export const Subheadline: React.FC<SubheadlineProps> = ({
  variant = "h2",
  color = "textSecondary",
  ...rest
}) => <Text variant={variant} color={color} {...rest} />;
