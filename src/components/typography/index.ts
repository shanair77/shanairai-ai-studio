/**
 * components/typography/ — Semantic type roles.
 *
 * Named typographic components that give copy an editorial role instead of a raw size.
 * Each composes the `Text` primitive, so all of them read family/weight/tracking from the
 * theme, scale their size through `useScale()`, take a semantic `color` token, and flow in
 * normal document order (safe inside `<SafeArea>` / `<Container>`). No size is hardcoded.
 *
 * Every role inherits `Text`'s props — `align`, `maxWidth`, `opacity`, `color`, `lineClamp`,
 * and a `style` passthrough that is the injection point for future frame-driven animation.
 *
 * Headline    — h1, the dominant line (pass variant="display" for a hero).
 * Subheadline — h2, secondary title beneath a Headline.
 * Paragraph   — body running copy.
 * Caption     — small supporting / fine-print text.
 * Eyebrow     — overline label above a headline (accent).
 * Kicker      — overline lead-in above a headline (secondary accent).
 * Quote       — serif pull-quote, italic by default.
 * CTA         — action label (accent, heavier weight, wider tracking).
 */

export { Headline, type HeadlineProps } from "./Headline";
export { Subheadline, type SubheadlineProps } from "./Subheadline";
export { Paragraph, type ParagraphProps } from "./Paragraph";
export { Caption, type CaptionProps } from "./Caption";
export { Eyebrow, type EyebrowProps } from "./Eyebrow";
export { Kicker, type KickerProps } from "./Kicker";
export { Quote, type QuoteProps } from "./Quote";
export { CTA, type CTAProps } from "./CTA";
