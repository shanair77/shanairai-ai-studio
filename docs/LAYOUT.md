# Layout & Runtime

## Purpose

Document the layout primitives and the format-runtime that makes them responsive: `useFormat`,
`useScale`, `SafeArea`, and `Text`/`Container`/`Row`/`Column`/`Stack`. Sources: `src/format/*`,
`src/components/*`, tokens in `config/Layout.ts`.

## Concepts

### The runtime (`format`)

- **`useScale()`** scales base-authored tokens by the **short side** of the composition
  (`shortSide / BASE_WIDTH`). Because `BASE_WIDTH = 1080` is the short side of every standard
  format, the factor is `1` across portrait/landscape/square — so type and spacing stay
  proportional. Returns `{ factor, scale(v), scaleRounded(v) }`.
- **`useFormat()`** reports `{ width, height, fps, aspectRatio, orientation, isPortrait/…,
  shortSide, longSide, name }` — branch scene layout by orientation without hardcoding pixels.
- **`SafeArea`** applies a fractional inset preset (`default` / `social` / `minimal`) as padding
  so key content stays inside platform-safe margins. `debug` overlays the boundary in Studio.

### Layout tokens (`config/Layout`)

`spacing` (`none…4xl`), `radii`, `borderWidths`, `zIndex` (named layers), `formats`
(vertical/horizontal/square), `safeAreas` (fractional insets). All px tokens are authored at
`BASE_WIDTH` and scaled at render.

### Layout primitives (`components`)

| Primitive | Role |
|---|---|
| `Container` | Neutral box: padding/margin (spacing tokens), radius, `background` (semantic color), width/height, flex + center helpers, absolute/`fill`, `safeArea` preset. |
| `Row` | Horizontal flex: `gap` (spacing token), `align`, `justify`, `wrap`. |
| `Column` | Vertical flex: `gap`, `align`, `justify`, `fill`. |
| `Stack` | Overlapping z-layers (each child on its own `AbsoluteFill`); `zIndex` (number or named token). |
| `Text` | The typographic primitive — see [TYPOGRAPHY.md](./TYPOGRAPHY.md). |

Spacing/gap/radius accept **tokens** (`"lg"`, `"md"`); dimensions accept a number (base-px,
scaled) or a raw CSS string.

## Examples

```tsx
<Container fill background="background" center>
  <Column gap="lg" align="center">
    <Row gap="md"><Badge/><Badge/></Row>
    <Headline>Centered</Headline>
  </Column>
</Container>

<Stack>
  <Background/>          {/* bottom layer */}
  <Content/>            {/* painted on top */}
</Stack>

<SafeArea preset="social"><Caption>@handle</Caption></SafeArea>
```

## Best practices

- Use spacing/radius **tokens** and let `useScale` handle format — don't compute pixels by hand.
- Use `Row`/`Column` for flow, `Stack` only for true overlapping layers.
- Wrap key content in `SafeArea` (or a scene's `safeArea` prop) so it survives platform crops.
- Branch on `useFormat().isPortrait` for orientation-specific layout (as scenes do).

## Common mistakes

- Passing a raw pixel number where a spacing token is expected (loses scaling intent).
- Using `Stack` for flow layout (it absolutely-positions every child).
- Hardcoding a background hex instead of a semantic `background`/`surface` token.

## Extension points

- New layout primitive → compose scaling via `useScale` and spacing tokens; mirror
  `Row`/`Column`.
- New safe-area preset or format → add to `config/Layout.ts` (`safeAreas` / `formats`).
