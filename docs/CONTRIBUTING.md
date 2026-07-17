# Contributing

## Purpose

Define the standards a change must meet: coding style, architecture rules, naming, testing,
and when an ADR is required. The bar is: the framework should read as one coherent system.

## Concepts

Work proceeds in **phases** — self-contained, reviewed units that end green on
`npm run verify`. Architectural decisions are recorded as [ADRs](./adr/). Documentation and
tests are part of the change, not an afterthought.

## Coding standards

- **TypeScript strict.** `strict`, `noUnusedLocals`, `noEmit`. No `any` — the two erased
  registry slots that genuinely require it carry a scoped `eslint-disable` with a justification
  comment; do not add more.
- **Match the surrounding code.** Comment density, naming, and idiom should look native to the
  file. Every module opens with an intent-level doc comment.
- **No hardcoded design values.** Colors, sizes, spacing, timing, easing come from `config`
  tokens — never raw hex/px/seconds in components or scenes.
- **Frame-driven motion only.** Animate via `useCurrentFrame()` + `interpolate()`. CSS/Tailwind
  transitions and animations do not render and are forbidden (see [MOTION.md](./MOTION.md)).
- **Config-driven assembly.** The builder assembles trees with `createElement`; no hardcoded
  scene trees or templates.
- **Prettier-formatted.** Keep imports ordered and grouped as the existing files do.

## Architecture rules

- **Dependencies point downward only.** A layer imports only from layers beneath it; `config`
  and `registry` are leaves. See [ARCHITECTURE.md](./ARCHITECTURE.md). A single upward import
  (e.g. a primitive importing the engine) is a defect — it creates a cycle.
- **Shared mechanism goes in the foundation.** Cross-cutting primitives (the theme context, the
  registry kernel) live in `config`/`registry`, not in a domain layer.
- **Registries are the extension seam.** New scene/transition/asset/brand/effect/template
  families follow the [registry recipe](./REGISTRIES.md), reusing `createRegistry`.
- **No business logic in the framework.** Brands, content, and assets are supplied per video.
- *Future hardening:* an ESLint boundary rule (`import/no-restricted-paths` /
  `eslint-plugin-boundaries`) to enforce the direction mechanically.

## Naming conventions

- **Definitions/factories:** single verb `create` + precise noun — `createSceneDefinition`,
  `createTransitionDefinition`, `createRegistry` (ADR-001). Future families follow
  `create<X>Definition`.
- **Registries:** `<x>Registry` (e.g. `sceneRegistry`, `transitionRegistry`).
- **Maps:** `builtin<X>s` (e.g. `builtinScenes`, `builtinTransitions`); `<X>Map` for the type.
- **Components:** PascalCase; scenes end in `Scene` (the historical `CTASection` is the lone
  exception). Props types are `<Component>Props`.
- **Config types:** `<X>Config` / `<X>ConfigFor<M>`; erased runtime shapes are `<X>ConfigBase`.
- **Files:** one primitive/definition per file, named after the export.

## Testing requirements

Every change must keep `npm run verify` green and add tests for new logic:

- **Pure logic** (timeline, config/brand/video resolution, registries) → Vitest unit tests with
  fake registries, no rendering.
- **Config typing** (new scene/transition names or props) → type-level tests (`expectTypeOf` +
  `@ts-expect-error`) under `test:typecheck`.
- **Assembly** (builder output shape) → structural tests that inspect the element tree without
  rendering.
- **Visuals** → render smoke stills for anything new that renders (scenes, transitions).

See [TESTING.md](./TESTING.md).

## ADR requirements

Write an ADR (in `docs/adr/`, `ADR-00N-title.md`) **before implementing** when a change:

- alters a public contract or the dependency graph,
- introduces or changes a registry family or the engine pipeline,
- makes a decision with meaningful alternatives and long-term consequences.

An ADR states: problem, alternatives considered, chosen design, dependency impact, migration
strategy, risks, and future extension points. See [ADR-001](./adr/ADR-001-typed-scene-registration.md)
and [ADR-002](./adr/ADR-002-transition-architecture.md) as templates.

## Examples

A well-formed change: one phase, an ADR if architectural, source + tests + docs updated, green
`verify`, a single focused commit.

## Best practices

- Read the relevant subsystem doc + the nearest existing module before writing.
- Prefer composing a lower primitive to duplicating it a layer up.
- Update `API.md` and the subsystem doc in the same change that alters public surface.

## Common mistakes

- Adding a feature the config/registries can't express (breaks the config-driven contract).
- Skipping the ADR for an architectural change.
- Introducing `any`, a raw design value, or a CSS transition.

## Extension points

- New capability → a registry family ([REGISTRIES.md](./REGISTRIES.md)).
- New subsystem → a downward-only layer ([ARCHITECTURE.md](./ARCHITECTURE.md)).
