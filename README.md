# AI Studio

**A registry-driven declarative compiler for programmatic video, built on [Remotion](https://remotion.dev).**
Describe a video as data — templates, scenes, transitions, brands, assets — and `compile()` it into a Remotion `<Composition>`. Type-safe at the authoring surface, deterministic at render time, and safe to drive from a server or an AI agent.

[![npm](https://img.shields.io/npm/v/@shanairai/ai-studio/alpha.svg)](https://www.npmjs.com/package/@shanairai/ai-studio)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

> **Status: alpha (`0.1.0-alpha.0`).** The public API is close to frozen and locked by tests, but may still change before `1.0`. Pin an exact version and watch the changelog.

---

## Why it exists

Remotion is imperative React: you write components and render them frame by frame. But a lot of video work wants the opposite — a **declarative request** ("this template, these parameters, this brand") that a server, a form, or an AI agent can produce as plain data, and a **compiler** that turns it into a real, renderable composition.

AI Studio is that compiler:

- **One authoring vocabulary** — everything is registered and referenced by name via `define*` (templates, scenes, transitions, brands, assets).
- **Result-typed, never throws on bad input** — `compile()` returns `{ ok, ... }`; expected failures come back as a structured report, framework bugs are never masked.
- **Reflective** — `compiler.describe()` returns a JSON-safe catalog so tools and agents can discover what's available.
- **Two entry points** — the full SDK (`.`) and a **React-free** transport-validation entry (`./inspect`) for edge/gateway tiers.

It does not replace Remotion — Remotion is the render host. AI Studio produces the `<Composition>` that Remotion renders.

## Installation

```bash
npm i @shanairai/ai-studio react react-dom remotion @remotion/transitions @remotion/google-fonts
```

TypeScript users should also add the React types:

```bash
npm i -D @types/react
```

**Requirements:** Node ≥ 18, React 19, Remotion 4. `react`, `remotion`, `@remotion/transitions`, and `@remotion/google-fonts` are **required peer dependencies** (the built-in scenes use them to render).

## Quick Start

Define a template, build a compiler, and compile a request into a composition:

```ts
import { createCompiler, defineTemplate } from "@shanairai/ai-studio";

// 1. Author a template: typed params in → composition data out. It never returns React.
const promo = defineTemplate({
  name: "promo",
  parameters: {
    parameters: [{ key: "title", type: "string", required: true }],
  },
  build: (p: { title: string }) => ({
    scenes: [
      { scene: "hero", duration: 2, props: { title: p.title } },
      { scene: "outro", duration: 2 },
    ],
    transitions: { type: "fade", duration: 0.5 },
  }),
});

// 2. Bind a compiler over your templates (plus any brands/scenes/assets you register).
const compiler = createCompiler({ templates: { promo } });

// 3. Compile a request. The result is a discriminated union — no try/catch.
const result = compiler.compile({
  id: "MyVideo",
  template: "promo",
  params: { title: "Ship faster" },
});

if (!result.ok) {
  console.error(result.report.issues); // structured, JSON-safe diagnostics
} else {
  console.log(result.composition);
  // → { id: "MyVideo", component, durationInFrames: 105, fps: 30, width: 1080, height: 1920 }
}
```

`result.composition` is a **`BuiltComposition`** — exactly the props a Remotion `<Composition>` needs.

### Mount it in Remotion

```tsx
// src/Root.tsx
import { Composition } from "remotion";
import { createCompiler, defineTemplate } from "@shanairai/ai-studio";

const promo = defineTemplate({
  name: "promo",
  parameters: { parameters: [{ key: "title", type: "string", required: true }] },
  build: (p: { title: string }) => ({
    scenes: [
      { scene: "hero", duration: 2, props: { title: p.title } },
      { scene: "outro", duration: 2 },
    ],
    transitions: { type: "fade", duration: 0.5 },
  }),
});

const compiler = createCompiler({ templates: { promo } });
const result = compiler.compile({ id: "Promo", template: "promo", params: { title: "Ship faster" } });

export const RemotionRoot = () => {
  if (!result.ok) throw new Error("compile failed: " + JSON.stringify(result.report.issues));
  const c = result.composition;
  return (
    <Composition
      id={c.id}
      component={c.component}
      durationInFrames={c.durationInFrames}
      fps={c.fps}
      width={c.width}
      height={c.height}
    />
  );
};
```

Register `RemotionRoot` with Remotion's `registerRoot`, then `npx remotion render Promo out/promo.mp4`.

## Core Concepts

| Concept | What it is |
|---|---|
| **Registries** | Every content kind — templates, scenes, transitions, brands, assets — is registered and referenced **by name**. One mental model everywhere. |
| **`define*`** | The authoring vocabulary: `defineTemplate`, `defineScene`, `defineTransition`, `defineBrand`, `defineAsset`, `defineAssetKit`. Each is a typed, no-runtime identity binding. |
| **The compiler** | `createCompiler(config)` binds your content once and returns `{ compile, describe }`. |
| **`CompileRequest` / `CompileResult`** | A request is plain data (`id`, `template`, `params`, optional `brand` / `format` / `transitions` / `music` / `timing`). The result is `{ ok: true, composition, report }` or `{ ok: false, report }`. |
| **Extend semantics** | Anything you pass in config **extends** the framework defaults; a matching key **overrides** the built-in. `scenes: { myScene }` adds to the built-in scenes rather than replacing them. |

The framework ships **no content** — the ten built-in scenes (`hero`, `centered`, `split`, `feature`, `gallery`, `comparison`, `quote`, `cta`, `logo-reveal`, `outro`) and the built-in transitions (`fade`, `dissolve`, `slide`, `wipe`, `clockWipe`, `iris`) are the starting kit; you register your own on top.

## Compiler API

```ts
const compiler = createCompiler({
  templates: { promo },          // required — binds the typed template map
  // scenes, transitions, brands, assets, parameterTypes, validators — all optional plain maps
});

const result = compiler.compile(request); // → CompileResult (never throws for bad input)
const catalog = compiler.describe();       // → FrameworkDescriptor (see Reflection)
```

Compilation is **Result-only** by design — you always branch on `result.ok`. A failed compile carries an append-only `report` whose `issues[]` are attributed to the stage that produced them (`resolve-template`, `resolve-parameters`, `build-composition`, …), each with a stable `code` and `message`.

## The two entry points

### `.` — the full SDK
`createCompiler`, the `define*` family, and all public types. Importing it pulls React (a `BuiltComposition` *is* a React component), so it belongs wherever you actually build or render.

### `./inspect` — React-free transport validation
For an edge/gateway tier that must **validate untrusted request JSON before** forwarding it to a render worker, without importing React or the compiler:

```ts
import { processRequest } from "@shanairai/ai-studio/inspect";

export async function handler(req: Request): Promise<Response> {
  const result = processRequest(await req.json()); // syntax, versioning, JSON-safety — no registries, no React
  if (!result.ok) {
    return Response.json(result.report, { status: 400 });
  }
  // Forward result.request to a worker that runs compiler.compile(...)
  return Response.json({ accepted: true });
}
```

`dist/inspect.js` has **zero external runtime imports** — no React, no Remotion. It also re-exports the `FrameworkDescriptor` **type**, so transport code can type a serialized catalog without pulling the runtime reflector.

## Reflection

`compiler.describe()` returns a JSON-safe `FrameworkDescriptor` — the discoverable catalog of everything the compiler knows:

```ts
const d = compiler.describe();
d.templates;       // each template + its parameter schema
d.scenes;          // scenes + defaultDuration + opaque (transition compatibility)
d.brands;          // registered brands
d.parameterTypes;  // the built-in + custom parameter types
d.capabilities;    // rolled-up capability report
```

This is the foundation of the **agent loop**: `describe()` → propose a request from what's discoverable → `compile()` → refine against the returned report.

## Architecture (in one breath)

A request flows through a fixed pipeline of pure stages — resolve template → check capabilities → resolve & validate parameters → run the template's pure `build` → validate output → assemble → build composition — into a terminal `BuiltComposition`. Remotion is the native render host; the compiler's boundary ends at the composition. Full detail in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) and [`docs/SDK_DESIGN.md`](./docs/SDK_DESIGN.md).

## Examples

Runnable example apps are landing in an `examples/` directory alongside the alpha:

1. **Quick Start** — the snippet above, end to end, rendered to MP4.
2. **API server** — `./inspect` validates requests at the edge; a worker compiles and renders.
3. **Custom scene pack** — author `defineScene` / `defineTransition` and use them in a template.
4. **Brand variants** — one template compiled across multiple `defineBrand`s.
5. **AI agent** — `describe()` → build a request → `compile()` → read the report.

## Documentation

| Start here | Then |
|---|---|
| [Authoring Guide](./docs/AUTHORING_GUIDE.md) — scenes, transitions, templates, brands, assets | [API reference](./docs/API.md) |
| [Architecture](./docs/ARCHITECTURE.md) — layers + dependency rules | [SDK Design & Decision Records](./docs/SDK_DESIGN.md) |
| [Registries](./docs/REGISTRIES.md) · [Composition Engine](./docs/COMPOSITION_ENGINE.md) | [Theming](./docs/THEMING.md) · [Transitions](./docs/TRANSITIONS.md) · [Fonts](./docs/FONTS.md) |
| [Building custom scenes](./docs/BUILDING_CUSTOM_SCENES.md) · [custom transitions](./docs/BUILDING_CUSTOM_TRANSITIONS.md) | [ADRs](./docs/adr/) · [Testing](./docs/TESTING.md) |
| [LuxuryReel](./docs/LUXURY_REEL.md) — the 30 s Instagram montage composition (`src/luxury/`) | [Footage spec](./public/luxury/README.md) |

## API stability

The public surface of both entry points is **locked by tests** (an exact runtime-export lock, a declaration-leak guard, and a React-free guard). For the alpha:

- **Frozen:** the runtime surface of `.` (`createCompiler`, the six `define*`, `DomainError`) and `./inspect` (`processRequest`, `CURRENT_REQUEST_VERSION`).
- **May still evolve** before `1.0`: additive type exports, new built-in content, and diagnostics detail. Breaking changes will bump the pre-release version and be listed in the changelog.

This is `0.1.0-alpha`: treat the API as stable-but-not-final, and pin an exact version.

## FAQ

**Is this Remotion?** No — it's built *on* Remotion. Remotion renders; AI Studio compiles a declarative request into the `<Composition>` Remotion renders. You keep using the Remotion CLI/Studio to preview and render.

**Do I have to use the built-in scenes?** No. They're a starting kit. Register your own with `defineScene` and reference them by name; config extends the defaults.

**Does `compile()` throw?** Not for bad input — it returns `{ ok: false, report }`. It only throws for genuine framework bugs (never masked).

## Contributing

The single green gate is `npm run verify` (lint + typecheck + tests). See [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) and [`docs/TESTING.md`](./docs/TESTING.md).

## License

[MIT](./LICENSE) © Shanair Johnson.
