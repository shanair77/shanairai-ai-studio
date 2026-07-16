/**
 * components/ — Foundational UI primitives.
 *
 * Low-level, brand-agnostic building blocks that read tokens from the theme and scale
 * with `useScale()`. Everything higher up (titles, layouts, scenes) composes these.
 *
 * Text       — typographic primitive (variants, color, clamp, maxWidth).
 * Container  — neutral layout box (padding/margin/radius/background, flex, absolute).
 * Stack      — overlapping layers on the z-axis.
 * Row        — horizontal flex layout.
 * Column     — vertical flex layout.
 * typography/— semantic type roles (Headline, Paragraph, Eyebrow, Quote, CTA, …).
 *
 * (Grid, Card, and Spacer are intentionally not here yet.)
 */

export { Text, type TextProps } from "./Text";
export { Container, type ContainerProps } from "./Container";
export { Stack, type StackProps } from "./Stack";
export { Row, type RowProps } from "./Row";
export { Column, type ColumnProps } from "./Column";
export * from "./typography";
