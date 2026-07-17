# Fonts

## Purpose

Document the deterministic, provider-based font system: how fonts load once, why rendering is
deterministic and offline, and how coverage is proven. Source: `src/config/fonts/*`. The
framework does **not** depend directly on Google Fonts — only on a provider contract.

## Concepts

- **Provider-agnostic manifest** (`manifest.ts`): the single source of truth for which faces to
  load — `{ family, weights, styles, subsets }`. Lists **only** the weights/styles the
  components actually use (8 faces across Playfair Display, Cormorant Garamond, Poppins, Jost).
- **`FontProvider`** (`types.ts`): a contract `{ name, load(faces) }`. The framework depends on
  this interface, not on any font source.
- **`GoogleFontProvider`** (`GoogleFontProvider.ts`): the first provider — the **only** module
  that imports `@remotion/google-fonts`. A `LocalFontProvider` (via `@remotion/fonts`) could be
  dropped in by changing one line, with no consumer changes.
- **Loader** (`index.ts`): selects the provider and loads the manifest **once** on import;
  exports `fontsReady` / `waitForFonts()`.

## Determinism

- Fonts are **vendored** in `node_modules` (not fetched at render), so rendering is
  **offline and deterministic** — no render-time network.
- The provider opens Remotion `delayRender` handles (via `@remotion/google-fonts`), so the
  renderer **blocks frame capture until faces are ready**.
- The loader is imported **once at the app entry** (`src/index.ts`), before `registerRoot`, and
  no visual layer imports it — the loader sits below the visual graph.

> **Bundler note:** because the load is a side effect, the font modules are listed in
> `package.json` `sideEffects` so the entry's side-effect-only import is never tree-shaken.

## Coverage guarantee

`src/config/__tests__/fonts.test.ts` derives the **required** `(family, weight, style)` set from
`typography.textStyles` + the `CTA`/`Quote` overrides and asserts the manifest matches it
**exactly** — proving *every typography token is backed by a loaded face* and *no unused faces
are loaded*. If you add a weight to a variant and forget the manifest, this test fails.

## Examples

Manifest entry:
```ts
{ family: "Cormorant Garamond", weights: [500], styles: ["normal", "italic"], subsets: ["latin"] }
```

Await readiness (rarely needed; the renderer already gates):
```ts
import { waitForFonts } from "./config/fonts";
await waitForFonts();
```

## Best practices

- Add a face to the **manifest** when you introduce a new weight/style — the coverage test is
  your guardrail.
- Keep the loader imported exactly once, at the entry.
- Load only the subsets you need (latin) to keep the bundle small.

## Common mistakes

- Importing a font module from a visual layer (breaks the dependency direction; also risks
  loading twice).
- Adding a `textStyles` weight without a matching manifest face — the coverage test fails.
- Assuming a family renders without a manifest entry — you'll silently get a system fallback.

## Extension points

- **Swap providers:** implement `FontProvider` (e.g. `LocalFontProvider` via `@remotion/fonts`
  + `staticFile`) and assign it in `index.ts` — no consumer changes.
- **Add a family/weight:** extend the manifest; update the coverage expectation.
