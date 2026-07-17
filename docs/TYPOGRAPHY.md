# Typography

## Purpose

Document the type system: the tokens, the `Text` primitive, and the semantic type-role
components. Sources: `src/config/Typography.ts`, `src/components/Text.tsx`,
`src/components/typography/*`.

## Concepts

- **Tokens** (`config/Typography`): `fontFamilies` (display/serif/body/accent stacks),
  `fontWeights` (light…bold), `letterSpacing`, `lineHeights`, `fontSizes` (px at
  `BASE_WIDTH = 1080`), and `textStyles` — ready-made role presets
  (`display`, `h1`, `h2`, `h3`, `body`, `caption`, `overline`).
- **`Text`** is the one primitive that turns a `variant` (a `textStyles` key) into styled text.
  It reads family/weight/tracking from the token and scales **only** the font size via
  `useScale()`; colors + typography come from `useTheme()`.
- **Type roles** (`components/typography`) are thin semantic wrappers over `Text` — they pick a
  default `variant` + `color` and a role treatment, so scenes read as roles, not sizes.

### Roles → tokens

| Component | variant | default color | treatment |
|---|---|---|---|
| `Headline` | `h1` (or `display`) | `textPrimary` | — |
| `Subheadline` | `h2` | `textSecondary` | — |
| `Paragraph` | `body` | `textPrimary` | — |
| `Caption` | `caption` | `textMuted` | — |
| `Eyebrow` | `overline` | `accent` | uppercase |
| `Kicker` | `overline` | `secondary` | uppercase |
| `Quote` | `h3` (serif) | `textPrimary` | italic |
| `CTA` | `body` | `accent` | semibold + wide tracking |

All roles inherit `Text`'s props: `align`, `maxWidth`, `opacity`, semantic `color`,
`lineClamp`, and a `style` passthrough (the animation injection point). `Eyebrow`/`Kicker` add
`uppercase?`; `Quote` adds `italic?`; `CTA` adds `uppercase?`.

## Scaling & fonts

- `fontSize` is authored at `BASE_WIDTH` and multiplied by the format's short-side factor
  (`useScale`), so type reads identically across portrait/landscape/square.
- The four families (Playfair Display, Cormorant Garamond, Poppins, Jost) are loaded
  deterministically — see [FONTS.md](./FONTS.md). The font manifest is proven to cover exactly
  the weights/styles these roles require.

## Examples

```tsx
<Headline align="center" maxWidth={900}>Everything composes</Headline>
<Paragraph color="textMuted">Typography, motion, theme — from one config.</Paragraph>
<Quote>Describe the video as data.</Quote>          // serif, italic
<Eyebrow>Composition Engine</Eyebrow>               // gold, uppercase, tracked
```

Animate a role by wrapping it in a motion primitive (the `style` passthrough carries the
transform):
```tsx
<FadeUp><Headline>Title</Headline></FadeUp>
```

## Best practices

- Choose a **role** (`Headline`, `Quote`) over `Text` with a raw variant — it carries the right
  color + treatment.
- Set `maxWidth` for a comfortable measure on body copy; use `lineClamp` to cap overflow.
- Never hardcode a font size — pick a `variant`.

## Common mistakes

- Passing a pixel font size via `style` instead of a variant.
- Double-wrapping: a scene slot already renders a role, so pass text, not a `<Headline>`.
- Assuming a weight is loaded — if you introduce a new weight, add it to the font manifest or
  the coverage test fails (see [FONTS.md](./FONTS.md)).

## Extension points

- Add a `textStyles` variant in `config/Typography.ts` (then a matching font face in the
  manifest).
- Add a new type role by composing `Text` with a default variant/color — mirror the existing
  role files.
