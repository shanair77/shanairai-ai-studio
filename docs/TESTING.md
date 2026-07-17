# Testing

## Purpose

Document the test strategy and the exact commands: the `verify` gate, lint, unit tests, type
tests, structural tests, and render smoke tests. Establishes what "green" means.

## Concepts

Tests are split by what they can prove without rendering:

- **Pure logic** — deterministic functions (timeline, config/brand/video resolution,
  registries). Unit-tested in Node with fake registries; no DOM.
- **Types** — that config names/props are compile-checked. Verified by `tsc` on the test
  project via `@ts-expect-error` + `expectTypeOf`.
- **Assembly** — that the builder emits the right element tree. Structural tests inspect
  `createElement` output without rendering.
- **Visuals** — that scenes/transitions actually look right. Render smoke stills (manual /
  CI-optional), plus the deterministic byte-diff checks used during development.

Tooling: **Vitest** (`environment: "node"`, no jsdom). Tests live in `__tests__/` folders and
are typechecked by a dedicated `tsconfig.test.json` (kept out of the production `tsc`).

## Commands

```bash
npm run verify         # the gate: lint + test:typecheck + test
npm run lint           # eslint src && tsc   (production typecheck)
npm run test           # vitest run           (unit + structural + type tests)
npm run test:watch     # vitest               (watch mode)
npm run test:typecheck # tsc -p tsconfig.test.json  (typechecks tests, incl. @ts-expect-error)
```

`verify` is the single green gate every change must pass.

## Test types, by example

### Unit (pure logic)
`src/composition/__tests__/Timeline.test.ts`, `VideoConfig.test.ts`, `BrandConfig.test.ts`,
`SceneRegistry.test.ts`, `CompositionSchema.test.ts`, `src/config/__tests__/fonts.test.ts`.
Timeline/registry tests inject **fake registries** so they never touch real scenes or rendering:

```ts
const fakeScenes: SceneResolver = { require: (n) => ({ component: () => null, defaultDuration: 5 }), has: () => true, keys: () => [] };
const t = resolveTimeline(cfg, 30, fakeScenes, fakeTransitions);
expect(t.durationInFrames).toBe(240);
```

### Type tests
`SceneTypes.test.ts`, `TransitionTypes.test.ts`. Checked by `test:typecheck` — an
`@ts-expect-error` that stops erroring **fails** the typecheck:

```ts
// @ts-expect-error "herro" is not a scene name
const bad: CompositionSchema = { id, scenes: [{ scene: "herro" }] };
expectTypeOf<Extract<SceneConfig, { scene: "hero" }>["props"]>().toEqualTypeOf<HeroSceneProps | undefined>();
```

### Structural assembly tests
`StructuralAssembly.test.ts` invokes the built component and walks the element tree (no
rendering) to assert `TransitionSeries.Sequence` / `.Transition` interleaving and run-splitting
at cuts.

### Render smoke tests
Not a Vitest suite (they need a real render). During development, render stills and compare:

```bash
npx remotion still Demo out/hero.png --frame=60 --scale=0.5     # eyeball a scene
npx remotion render Demo out/demo.mp4 --scale=0.5               # full render
```

For determinism checks, render the same frame twice and `md5` the PNGs — identical means
deterministic. A render-context harness (`document.fonts.check`, snapshot diffs) is a roadmap
item.

## Configuration

- `vitest.config.ts` — `environment: "node"`, `include: src/**/__tests__/**/*.test.ts`.
- `tsconfig.test.json` — extends the base, re-includes tests + `vitest.config.ts`, uses
  `moduleResolution: bundler` for Vitest's exports-map packages.
- Production `tsconfig.json` **excludes** tests, so `npm run lint` stays scoped to shippable
  code (the replacement typecheck is `test:typecheck`).

## Best practices

- Test pure logic with fake registries — fast, hermetic, no rendering.
- Guard every new config name/prop with a type test (`@ts-expect-error` for the failure case).
- Add a structural test when you change the builder's output shape.
- Render a smoke still for anything new that renders.

## Common mistakes

- Putting tests where the production `tsc` compiles them (breaks `lint`) — keep them in
  `__tests__/`.
- Mocking more of `remotion` than needed — only `staticFile` is mocked (in the CompositionSchema
  suite) for the local-path branch.
- Asserting on rendered pixels in a Node unit test — use structural/type tests there; render
  separately.

## Extension points

- Add a render-context suite (jsdom/happy-dom or a Remotion render harness) for visual
  assertions.
- Add an ESLint boundary rule so architecture violations fail `lint`.
