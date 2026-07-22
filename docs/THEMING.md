# Theming

## Purpose

Explain the design-token system, the theme object, the theme context that lets brands recolor
the whole tree, and how brand overrides are resolved. Sources: `src/config/*`, `src/brand/*`. Decision: [ADR-001 §3](./adr/ADR-001-typed-scene-registration.md).

## Concepts

- **Tokens** are the single source of design truth (`config/Colors`, `Typography`, `Layout`,
  `Timing`, `Animation`). Components never use raw values.
- **`theme`** composes the tokens into one object: `theme.colors`, `theme.typography`,
  `theme.palette`, `theme.gradients`, `theme.animation`, `theme.timing`, `theme.layout`.
  `darkTheme` is the inverted variant; `themes = { light, dark }`.
- **Semantic colors** are role names, not hues, so a brand can remap them:
  `background`, `surface`, `surfaceAlt`, `overlay`, `textPrimary`, `textSecondary`, `textMuted`,
  `textInverse`, `primary`, `onPrimary`, `accent`, `onAccent`, `secondary`, `onSecondary`,
  `border`, `divider`, `highlight`, `shadow`.
- **Theme context** (`config/ThemeContext`): `ThemeProvider` + `useTheme()`. Lives at the
  bottom of the graph so any primitive reads the active theme with a downward import. Outside a
  provider, `useTheme()` returns the default `theme` — so a bare primitive renders unchanged.

## How brand color flows

```
brand (config) → resolveBrand → concrete Theme → BrandThemeProvider (context) → useTheme() in Text/Container/CTA
```

Primitives read colors/typography from `useTheme()`, so a brand's overrides recolor the whole
composition. `BrandProvider` (in `src/brand`) supplies the resolved brand theme over the config-layer
`ThemeProvider`/`useTheme`.

## Brand overrides

`ThemeOverrides` currently allows **colors only**:

```ts
type ThemeOverrides = { colors?: Partial<SemanticColors> };
```

`SemanticColors` values are typed as `string`, so any color format is accepted
(`"#0E1B2B"`, `"rgba(…)"`, `"hsl(…)"`). `resolveBrand` merges the overrides onto the chosen
base (`mode: "light" | "dark"`) — **immutably**, without mutating the shared `theme`.

```ts
resolveBrand({ mode: "dark", theme: { colors: { accent: "#00E0C6" } } });
// → { name, theme: <dark base with accent overridden>, mark }
```

> Broadening overrides beyond colors (typography, spacing, motion) is a roadmap item (T2).

## Examples

Token usage inside a primitive:
```ts
const theme = useTheme();
style={{ color: theme.colors.textPrimary, ...theme.typography.textStyles.h1 }}
```

Brand theming (register a brand, then select it by name):
```ts
const brands = createRegistry({
  midnight: createBrandDefinition({
    name: "Midnight", mode: "light",
    theme: { colors: { background: "#0E1B2B", textPrimary: "#E8F0FF", accent: "#00E0C6" } },
  }),
});

buildComposition(
  { id, scenes: [...], brand: "midnight" },
  sceneRegistry, transitionRegistry, assetRegistry, brands,
);
```

## Best practices

- Use **semantic** tokens (`accent`, `textPrimary`) in components — not palette hues
  (`plum[700]`), which are for bespoke work.
- Override brands at the config level; don't edit `config/Colors.ts` for a one-off video.
- Keep contrast pairs consistent (`primary`/`onPrimary`, `accent`/`onAccent`).

## Common mistakes

- Reading `theme` via the static import in a component instead of `useTheme()` — brand overrides
  then won't apply (this was review finding T1; primitives use the context).
- Expecting typography/spacing to change per brand — only colors are overridable today.
- Putting a raw hex in a component.

## Extension points

- Broaden `ThemeOverrides` (a new slice + merge in `resolveBrand`).
- A `brandRegistry` of reusable brand definitions — see
  [REGISTRIES.md](./REGISTRIES.md#future-registries).
