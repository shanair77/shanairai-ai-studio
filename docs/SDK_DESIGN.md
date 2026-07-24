# AI-Studio — v1 SDK Architecture & Public API Design

> **Status:** design review, pre-implementation. No SDK code has been written.
> **Basis:** HEAD `30ab67a` (Phase 45). Every claim re-verified against current source.
>
> **Revision history**
> - Rev 4 — recorded **DR-S4**: `./inspect` guarantees runtime (not declaration) independence from
>   React/Remotion; the accepted declaration-level references are documented. See Decision Records.
> - Rev 3 — recorded the **Phase S0** decision (settled): `processRequest` stays a standalone,
>   React-free, registry-free transport front-end; `compile` is the semantic compiler over a
>   normalized `CompileRequest`. See the **Decision Records** appendix (DR-S0), §9, and §10.
> - Rev 2 — updated for **Phase 44** (`c06d372`, remove authored per-scene `durationInFrames`) and
>   **Phase 45** (`30ab67a`, move scene opacity to `SceneDefinition`). These resolve the "Phase F"
>   authored-timing/opacity freeze-blocker flagged in Rev 1; see §5, §8, §9, §10.
> - Rev 1 — initial 10-section review at HEAD `47c0e1d`.

## 1. Framework Identity

AI-Studio is a **registry-driven declarative video compiler built on Remotion**. It **consumes** a *request* — a template name plus JSON parameters, resolved against typed registries of scenes, transitions, assets, brands, templates, and parameter types the user has registered — and **compiles** it through a fixed pipeline of pure stages (resolve template → check capabilities → resolve/validate parameters → run the template's pure `build` → validate output → assemble schema → build composition) into a **`BuiltComposition`**: a terminal artifact of `{ id, component: React.FC, durationInFrames, fps, width, height }` that plugs directly into Remotion's `<Composition>`. It also **produces**, on the same registries, a JSON-safe **`FrameworkDescriptor`** for reflection. Its intended users are **developers building Remotion video systems** (who author templates/brands/assets as code and compile requests to compositions), **services** that must validate untrusted request JSON and render server-side, and **AI agents** that reflect over the registries and propose requests. It is not a rendering engine (Remotion is the host), not a UI, and not a template marketplace — it ships **zero** content; all content is user-registered.

## 2. Public API Philosophy

1. **Registry-first.** Every content kind is registered and referenced by name. The SDK must have no second way to supply content (the removed inline `BrandConfig` was the last exception; do not reintroduce that shape for any kind). *Why: uniformity is the framework's defining property and its lowest maintenance cost — one mental model for scenes, transitions, brands, assets, templates.*
2. **One public way to do a thing.** There are four `execute*` entry points and two request-processing entry points internally; the public API should expose **one** compile path and **one** reflect path. *Why: N public ways = N×(docs + tests + back-compat surface) forever.*
3. **Minimal public surface; internal compiler stages stay internal.** The stage helpers, report builders, `ExecutionContext`, resolvers, and the registry kernel's erased internals are implementation. *Why: everything exported is frozen; the cheapest type to maintain is the one you never exported.*
4. **Declarative requests, imperative template authoring.** A request is pure JSON (AI- and wire-friendly). A template is code (`build(params, ctx)`) — kept imperative deliberately (the stage set is closed and non-homomorphic). *Why: matches the two real author roles — agents fill params, developers write templates.*
5. **Explicit over implicit.** Registries are configured once and passed explicitly; no ambient global registry mutation in the public path. *Why: hidden global state is the hardest thing to reason about at year 5.*
6. **Reflective by construction.** Anything a tool/agent needs to discover must be in `describeFramework()`. If a capability can't be reflected, it shouldn't be a first-class public path (this is why inline brands were removed, and why scene opacity is a static reflected boolean — see §5). *Why: the SDK's agent/Studio story depends on discovery.*
7. **Result-typed, never-mask-bugs.** Expected failures are classified into a report; framework bugs are rethrown. The public result must be a discriminated union that makes "no usable output on failure" unrepresentable. *Why: this invariant is enforced across the codebase; the public API must not weaken it.*
8. **Prefer removal.** When a candidate export has no consumer, delete it rather than ship it "just in case." *Why: you can add public surface in a minor; you can only remove it in a major.* (Applied concretely in Phases 44/45: authored `durationInFrames` and per-instance `opaque` were removed rather than frozen.)

## 3. Public Surface Inventory

Classification of what exists today, by subsystem (representative — decision-relevant items called out):

| Subsystem | Item | Class | Why |
|---|---|---|---|
| **errors** | `DomainError`, `sanitize` | **PUBLIC** | The error contract; consumers catch/inspect `DomainError`. |
| | `Result<T,E>`, `ok`, `err` | **REMOVE** | Single real consumer (`resolveParameters`); `execution`/`requests` roll their own unions. A "shared" primitive shared by nobody. |
| **registry** | `createRegistry`, `Registry` | **ADVANCED** | Needed only if a user builds dynamic registries; the common path takes plain maps. `Registry.entries` (by-ref) and `get()` (dead) must not leak. |
| **contracts** | `FrameworkRegistries` | **INTERNAL** | The registries bundle; surfaced only as the shape of `createCompiler` config, not as a named export. |
| | `ExecutionRequest`, diagnostics generics | **INTERNAL** | The wire/stage protocol; the public request/report types are bespoke projections. |
| **requests** | `processRequest`, `processRequestOrThrow` | **PUBLIC** (conditionally) | The untrusted-input front-end — valuable for servers. Gated on fixing the version-baseline bug. |
| | `RequestEnvelope` | **REMOVE** | Dead type — referenced by **no function signature** (verified). Pure misleading surface. |
| | `migrationRegistry`, `findNonJsonPath`, `CURRENT_REQUEST_VERSION` | **INTERNAL** / **DEFER** | Migration is unbuilt (registry always empty); expose only if/when migrations ship. |
| | `RequestResult` | **INTERNAL** | Leaks `NormalizedExecutionRequest`; the public shape is a bespoke `ValidatedRequest`. |
| **execution** | `execute` | **INTERNAL** | The engine — wrapped by the public compiler, not exported directly. |
| | `executeOrThrow`, `executeTyped`, `executeTypedOrThrow` | **REMOVE** (from public intent) | Four entry points collapse to instance methods; the typed inference moves onto the compiler. |
| | `ExecutionContext`, `ExecutionEnvironment` | **REMOVE** | Exported but **unconstructable** by callers and never returned. Dead public types. |
| | `ExecutionResult` (with `schema`) | **INTERNAL** | Leaks `CompositionSchemaBase`; public result drops `schema`. |
| | `ExecutionReport`, `ExecutionIssue`, `ExecutionStage` | **PUBLIC** | The report is the diagnostic contract; stage names become part of it. |
| | `ExecutionInput.locale` | **REMOVE** | Reserved, never read. |
| **metadata** | `describeFramework`, `getCapabilities`, `FrameworkDescriptor` + descriptor types | **PUBLIC** | The reflection backbone — the single most under-exposed asset today (0 consumers, not in `lib.ts`). |
| | `describeScenes`/`describeTemplates`/… (per-family) | **INTERNAL** | `describeFramework` is the one public reflect call; per-family projectors are internal. |
| **templates** | `createTemplateDefinition` (→ `defineTemplate`), `TemplateDefinition`, `ParameterSchema`, `TemplateContext`, `TemplateOutput` | **PUBLIC** | The authoring surface (now clean — see §5). |
| | stage helpers (`resolveTemplate`, `runTemplate`, `assembleTemplateSchema`, …) | **INTERNAL** | Compiler internals. |
| | `TemplateCompositionFor`, `ParamsOf`, `templateRegistry` | **INTERNAL**/**ADVANCED** | Inference machinery; surfaced via the compiler, not raw. |
| **parameters** | `ParameterSchema`, `ParameterDefinition`, `ParameterTypeName`, `createParameterTypeDefinition`, `validatorRegistry` | **PUBLIC** (schema) / **ADVANCED** (custom types/validators) | Schema is authored; custom types/validators are the extension seam. |
| | `resolveParameters`, `resolveParametersDetailed`, `validateParameters`, `parameterTypeRegistry` | **INTERNAL** | Engine internals. |
| **composition** | `BuiltComposition` | **PUBLIC** | The terminal artifact — clean. |
| | `CompositionSchema`, `SceneConfig`, `MusicConfig`, `TimingConfig`, `TransitionConfig` | **INTERNAL** (v1) | The IR is now clean but should stay internal until a direct-authoring path is designed. |
| | `buildComposition` | **INTERNAL**/**DEFER** | Direct schema→composition path; defer until `CompositionSchema` is a public authored type. |
| | `createSceneDefinition` (→ `defineScene`), `createTransitionDefinition` (→ `defineTransition`), `SceneDefinition`, `TransitionDefinition` | **PUBLIC** | Building-block authoring. `SceneDefinition.opaque?: boolean` is now the sole owner of scene opacity (Phase 45). |
| | the 80-symbol `composition/index.ts` barrel re-exporting registry/transitions/assets/brand | **INTERNAL** | Never re-export this barrel from the SDK; it republishes four layers. |
| **brand** | `createBrandDefinition` (→ `defineBrand`), `BrandDefinition`, `brandRegistry` | **PUBLIC** (def) / **INTERNAL** (registry) | Identity-only definition (now clean). |
| | `BrandProvider`, `useBrand`, `resolveBrand`, `ResolvedBrand` | **INTERNAL** | Render/resolution internals. |
| **branding** | `BrandLogo`, `Watermark` | **REMOVE** | Dead code — zero importers. Delete the directory. |
| **assets** | `createAssetDefinition` (→ `defineAsset`), `createAssetKit`, `AssetDefinition`, `AssetCategory` | **PUBLIC** | Asset authoring. |
| | `AssetRegistryProvider`/`useAssetRegistry` (standalone) | **INTERNAL** | The standalone hook has no production consumer. |
| **scenes** | scene components/primitives | **DEFER** | Content — arguably not part of the compiler SDK at all (users bring scenes). |
| **empty stubs** | `backgrounds`/`effects`/`icons`/`layouts`/`music`/`titles` | **REMOVE** | Six git-tracked `export {}` directories. |

## 4. Proposed v1 Package Layout

**Recommendation: one entry, plus one React-free subpath. Two entries total.**

```
"."         full SDK — createCompiler, define*, all public types (pulls React: output is a component)
"./inspect" React-free subset — describeFramework + FrameworkDescriptor + request-validation + report/request types
```

- `.` is what 90% of users import. It transitively pulls React (a `BuiltComposition` *is* a React component), so servers that only validate/reflect shouldn't be forced through it.
- `./inspect` guarantees a **React-free** path for edge/serverless request-validation and catalog reflection. This is the one split that pays for itself; it's the difference between a Lambda importing React or not.
- **No `./core`, no `./react`, no `./advanced` in v1.** `execute`/`buildComposition`/`createRegistry` are internal or advanced-later; adding a subpath is a non-breaking minor, so defer until a real consumer asks. One-or-two entries is the ceiling for v1.

## 5. Public Type Review

| Type | Public? | Freeze-safe? | Leaks impl? | Redesign first? |
|---|---|---|---|---|
| **`BuiltComposition`** | Yes | **Yes** | `component: React.FC` (inherent, fine) | No. Already the narrow render descriptor. |
| **`CompileRequest<M>`** (new) | Yes | Yes | Must **not** alias `ExecutionRequest` | Define narrow: `{ id, template, params, format?/…, brand?: string, theme?, transitions?, music?, timing? }`. All member types are clean. |
| **`CompileResult`** (new) | Yes | Yes | Must **drop `schema`** | Bespoke `{ ok: true; composition; report } \| { ok: false; report }`. Do **not** reuse `ExecutionResult` (leaks `CompositionSchemaBase`). |
| **`FrameworkDescriptor`** + descriptors | Yes | **Yes** | No | Clean; the reflection contract. Freeze with `SCHEMA_VERSION`. `SceneDescriptor.opaque: boolean` remains a static reflected value (Phase 45 kept it a boolean — no function ever enters metadata). |
| **`ExecutionReport`/`Issue`/`Warning`/`Stage`** | Yes | Yes, with care | Freezes the 9 stage names as public strings | Acceptable — but decide consciously that stage names are contract. |
| **`TemplateDefinition`/`TemplateOutput`/`TemplateContext`** | Yes | **Yes (Phase F resolved)** | No | `TemplateOutput.scenes: SceneConfigBase[]` is now clean: authored scene config carries `duration` (seconds), `label`, `props`, `transition` — **no** `durationInFrames` (Phase 44) and **no** `opaque` (Phase 45). Freeze-safe. |
| **`SceneConfig` / `SceneConfigBase`** | Internal (v1) | **Yes** | No | Post-44/45 the authored shape is `{ scene, props?, duration?, label?, transition? }`. The prior open question (per-instance `durationInFrames`/`opaque`) is closed. |
| **`SceneDefinition<P>`** | Yes | **Yes** | No | Now the **sole owner of opacity**: `opaque?: boolean` (default true), consumed by the timeline's opacity contract and reflected as `SceneDescriptor.opaque`. Single inference site for `P` (`component`), so inference is clean. Deliberately **no** function/`isOpaque`/`opacityMode` form in v1 (no consumer; additive later if one appears). |
| **`ParameterSchema`/`ParameterDefinition`** | Yes | Yes | No | Clean (`{ parameters }`). `ParameterTypeName` closed union is correct. |
| **`TransitionDefinition`** | Yes | Yes | `present` exposes `@remotion/transitions` shape (acceptable; Remotion is peer) | No. |
| **`BrandDefinition`** | Yes | **Yes** | No | Identity-only (Phase 39). |
| **`AssetDefinition`** | Yes | Yes | `AssetSource` has reserved-never-produced kinds | Minor: trim reserved kinds before freeze, or accept as inert. |
| **`CompositionSchema`** | **No (v1)** | n/a | it *is* the IR | Keep internal; expose only if a direct-authoring path is designed post-v1. |
| **`ExecutionRequest`/`ExecutionResult`/`ExecutionContext`/`RequestResult`/`RequestEnvelope`/`Result<T,E>`** | **No** | n/a | yes / dead | Not public. |
| **`Registry`/`createRegistry`** | Advanced-later | Yes | `.entries` by-ref, dead `get()` | Trim `get()`; don't expose `.entries` mutation in docs. |

## 6. Public Function Review

| Function | Verdict | Reasoning |
|---|---|---|
| **`createCompiler`** (new) | **PUBLIC** | The one configured entry: binds registries once, hosts typed `compile`. |
| `compile(request)` | **PUBLIC** | The one compile path. Result-typed. |
| `compileOrThrow(request)` | **DEFER** | Start Result-only; a throwing façade is a trivial non-breaking add later. Removing it later is breaking. Prefer the smaller surface. |
| `describeFramework()` | **PUBLIC** | Exposed as the compiler's `.describe()` and via `./inspect`. The reflection backbone. |
| `processRequest` | **PUBLIC** (conditional) | Valuable for servers; **gate on the version-baseline fix**. Exposed as a standalone in `./inspect` (registry-agnostic transport validation — must **not** be a compiler method implying registry-awareness). |
| `buildComposition` | **DEFER** | Public only when `CompositionSchema` becomes a public authored type; not v1. |
| `execute` | **INTERNAL** | Wrapped by `compile`. One public compile way. |
| `createRegistry` | **ADVANCED** (later) | Not needed in v1: config takes plain maps. |
| `defineTemplate` | **PUBLIC** | Rename of `createTemplateDefinition`. |
| `defineScene` | **PUBLIC** | Rename of `createSceneDefinition` — this is where a scene declares `opaque` (Phase 45). |
| `defineTransition` | **PUBLIC** | Rename of `createTransitionDefinition`. |
| `defineBrand` | **PUBLIC** | Rename of `createBrandDefinition`. |
| `defineAsset` | **PUBLIC** | Rename of `createAssetDefinition` (+ `defineAssetKit` for kits). |
| `executeOrThrow`/`executeTyped`/`executeTypedOrThrow` | **REMOVE** | Collapse into the compiler instance; the typed inference lives on `compile<M>`. |

Net public function surface: **`createCompiler` + `defineTemplate/Scene/Transition/Brand/Asset` + `describeFramework` + `processRequest`** — plus `DomainError`/`sanitize`.

## 7. SDK User Experience

**A. Remotion developer** — configure once, compile, hand to Remotion:
```ts
import { createCompiler, defineTemplate, defineBrand } from "@shanairai/ai-studio";
const compiler = createCompiler({ templates: { promo }, brands: { acme } });
const r = compiler.compile({ template: "promo", params: { title: "Ship" }, brand: "acme", format: "vertical" });
if (r.ok) return <Composition id={r.composition.id} component={r.composition.component}
  durationInFrames={r.composition.durationInFrames} fps={r.composition.fps}
  width={r.composition.width} height={r.composition.height} />;
```

**B. Server / API developer** — validate untrusted JSON without pulling React, then compile:
```ts
import { processRequest } from "@shanairai/ai-studio/inspect";   // React-free
const v = processRequest(await req.json());
if (!v.ok) return Response.json(v.report, { status: 400 });
```

**C. AI agent** — reflect, then propose a request against what's discoverable:
```ts
import { describeFramework } from "@shanairai/ai-studio/inspect";
const menu = compiler.describe();       // templates + param schemas + brands + scenes (incl. opaque) + capabilities
```
Scene opacity being a static reflected boolean means an agent can pick transition-compatible scenes from `describe()` alone.

**D. Plugin / tool author** — contribute content and read the catalog:
```ts
import { defineScene, describeFramework } from "@shanairai/ai-studio";
export const myScene = defineScene({ component: MyScene, opaque: false }); // transparent overlay scene
```

## 8. Stability Analysis — types frozen by v1

| Frozen type | Regret risk | Likely evolution | Safe to freeze now? |
|---|---|---|---|
| `BuiltComposition` | **Low** | Stable; mirrors Remotion `<Composition>` props | **Yes** |
| `CompileRequest` | **Low–med** | May gain fields — additive | **Yes** |
| `CompileResult` | Low | Report may gain fields (additive) | **Yes** if `schema` is dropped |
| `FrameworkDescriptor` / `SceneDescriptor` | Low | Additive per family; `SceneDescriptor.opaque` stays boolean | **Yes** |
| `ExecutionReport`/`Stage` | **Med** | Stage-name renames are breaking | Yes, if stage names are accepted as contract |
| `TemplateOutput` / `SceneConfigBase` | **Low (was Med)** | Additive; the timing/opacity leak is **closed** (Phases 44/45) | **Yes** — the prior "not yet" is resolved |
| `SceneDefinition` | Low | `isOpaque?: (props)=>boolean` is a purely additive future minor if a real consumer appears | **Yes** — `opaque?: boolean` frozen |
| `TemplateDefinition`/`ParameterSchema`/`BrandDefinition`/`AssetDefinition` | Low | Additive | **Yes** |
| `AssetSource` | Low | Reserved kinds may activate (additive) or be trimmed (breaking) | Trim reserved kinds **before** freeze |

Headline: with Phases 37–45 complete, **the authored model is freeze-ready.** Phases 44/45 removed the last authored-type risk (per-scene `durationInFrames`; per-instance `opaque`), so `TemplateOutput`/`SceneConfigBase`/`SceneDefinition` can freeze honestly. No remaining authored type is blocked on a design decision.

## 9. Remaining Architectural Debt (ranked)

**Must fix before SDK:**
1. **Wire and surface the compiler.** `execute` + `describeFramework` have **0 consumers** and aren't exported. This *is* the SDK. *(The `processRequest`↔`compile` relationship — the one design decision this item carried — is now settled; see Decision Records: DR-S0.)*
2. **`CompileResult` must not leak `CompositionSchemaBase`** (today `ExecutionResult` does). Define the bespoke public result.
3. **Version-baseline bug** (`process.ts:63`: absent version → `CURRENT`, not `"1"`) — must fix before `processRequest` is public.
4. **Remove dead/misleading exports from any public path:** `RequestEnvelope`, `migrationRegistry`, `ExecutionContext`/`ExecutionEnvironment`, `ExecutionInput.locale`, `Result<T,E>` as "shared."

*(Resolved since Rev 1: "Decide Phase F (`durationInFrames`/`opaque`)" — done via Phases 44/45. No longer a blocker.)*

**Can wait until after v1:**
5. Direct-authoring path (`buildComposition` + public `CompositionSchema`).
6. `./core`/advanced `createRegistry` entry.
7. `compileOrThrow`, dual-format CJS.
8. `isOpaque?: (props)=>boolean` — add only when a genuinely prop-dependent transparent scene exists (none today).

**Pure cleanup (any time):**
9. Delete `src/branding/` + the six empty stub dirs.
10. Shrink the 80-symbol `composition` god-barrel.
11. Trim `Registry.get()`, `AssetSource` reserved kinds.
12. Documentation debt (`AssetRef`/catalog references in `docs/API.md`, `docs/ROADMAP.md`, `docs/COMPOSITION_ENGINE.md`, `docs/TESTING.md`) — already scheduled.

## 10. Recommendation

**GO** — with a defined, short pre-exposure phase list. The content **and** authored-timing/opacity models are now freeze-ready (Phases 37–45); what remains is **wiring, one result-type fix, and a handful of deletions** — implementation work, not open architecture.

Exact phases (each: implement → verify → byte-identical demo + `describeFramework()` → stop → review):

- **Phase S0 — One design decision (no code). ✅ SETTLED.** `processRequest` ↔ `compile` resolved as a **separate front-end** (transport validation is not folded into `compile`). Recorded permanently in Decision Records: DR-S0.
- **Phase S1 — Correctness fixes (internal).** Fix the version-baseline bug; define a bespoke internal result without the `schema` leak; delete `RequestEnvelope`, `ExecutionContext`/`Environment` exports, `ExecutionInput.locale`; demote `executeOrThrow`/`executeTyped*` to internal.
- **Phase S2 — `createCompiler` + `compile` + `describe`.** Build the instance over `execute`, with typed `compile<M>` inference; define `CompileRequest`/`CompileResult`.
- **Phase S3 — `define*` renames + public entry (`.`).**
- **Phase S4 — `./inspect` subpath** (React-free `describeFramework` + `processRequest`).
- **Phase S5 — Cleanup** (`branding/`, stub dirs, god-barrel, `Registry.get`) — parallelizable, non-blocking.

*(Rev 1's separate "freeze decision on Phase F" phase is dropped — Phases 44/45 already resolved it. `TemplateOutput`/`SceneConfigBase`/`SceneDefinition` are ready to freeze as they stand at HEAD `30ab67a`.)*

The guidance for the decade-long maintainer is unchanged: **the biggest risk is what you'd be tempted to add.** Ship `createCompiler` + five `define*` + `describeFramework` + `processRequest`, and add `execute`, `buildComposition`, `createRegistry`, `compileOrThrow`, and any dynamic-opacity resolver only when a real consumer demands them. Every function you *don't* export in v1 is a function you can design correctly later instead of maintaining forever.

## Decision Records

Permanent, settled architecture decisions. These are not open questions — they are fixed contracts the implementation must uphold. Reopening one requires an explicit new decision, not incidental drift.

### DR-S0 — `processRequest` and `compile` are permanently separate

**Status:** Settled (Phase S0). **Decision:** transport-validation is a **separate front-end**, not folded into `compile`.

**Rationale (summary):** the two layers sit on opposite sides of both the React boundary and the registry boundary. `processRequest` is React-free and registry-free and belongs on the `./inspect` path so an edge/server tier can reject malformed requests without importing React or the compiler; `compile` is registry-bearing and React-producing and runs on the render tier. Their types already compose (`NormalizedExecutionRequest = ExecutionRequest`), and a semantics-preserving handoff is already proven by test. Folding would break the React-free validation path, force two disjoint report vocabularies into one incoherent report, and create a second way to do one thing. Full analysis: Phase S0 review.

**The contract:**

1. **`processRequest()` remains a standalone, React-free, registry-free transport front-end.**
2. **`compile()` remains the semantic compiler** and accepts a normalized `CompileRequest`.
3. **`processRequest()` owns**, exclusively:
   - parsing
   - migration
   - envelope validation
   - normalization
   - default application
4. **`compile()` owns**, exclusively:
   - template resolution
   - capability validation
   - registry-backed parameter validation
   - template execution
   - output validation
   - composition assembly
5. **`compile()` may perform only a minimal structural sanity guard** (object; `template` string; `params` object) to prevent malformed JavaScript inputs from becoming unclassified framework failures. This guard is a defensive backstop, not transport validation.
6. **`compile()` must never perform migration, normalization, transport validation, or default application.** Those responsibilities permanently belong to `processRequest()`.

### DR-S4 — `./inspect` guarantees runtime independence, not declaration independence

**Status:** Accepted (Phase S4). This is a deliberate design decision, **not** technical debt.

**Decision.** The contractual guarantee of the `./inspect` entry is **runtime** independence from React and Remotion. The compiled entry `dist/inspect.js` has **zero** external module imports — no `react`, `remotion`, or `@remotion/*` — verified at the built-artifact level and enforced permanently by the committed React-free guard test (`src/__tests__/inspect-surface.test.ts`). Declaration-level (`.d.ts`) references to React/Remotion are understood, intentional, and accepted; the entry does **not** promise a React/Remotion-free *declaration* graph.

**What the declaration references are, and why they exist.** A focused build-pipeline investigation (grounded in the actual emitted `.d.ts`, not speculation) found two distinct causes:

1. **`react` and `@remotion/transitions` — a declaration-bundling artifact.** tsup bundles the `lib` and `inspect` declarations into one shared type chunk that also contains the root entry's React-bearing types (`AssetKit → React.FC`, `TransitionDefinition → TransitionPresentation`). rollup-plugin-dts hoists that chunk's external side-effect imports into every entry that imports the chunk, so they appear atop `inspect.d.ts` even though inspect's own exported types never reference them. Proven by building `inspect` in isolation, which drops both references entirely.
2. **`remotion` — a genuine type dependency via `ThemeMode`.** It survives isolation. The chain: the request contract exposes `theme?: ThemeMode`; `ThemeMode = keyof typeof themes`; the theme tokens are typed in `config/Animation.ts` via `import { Easing } from "remotion"` (`linear: Easing.linear`). So the emitted `ThemeMode` inlines `typeof remotion.Easing.linear`, and any type exposing `theme?: ThemeMode` transitively names a Remotion type.

**Why we accept it rather than eliminate it.** No build-configuration change removes all references without violating another constraint:

- *Isolated per-entry declaration builds* remove `react`/`@remotion/transitions` but **duplicate the shared declaration text** (inspect's `.d.ts` grows ~10×) and still leave `remotion`.
- *`tsc`-generated declarations* avoid the eager side-effect imports but emit directory-specifier imports that strict consumer module resolution can reject, and still leave `remotion`.
- Removing the final `remotion` reference is a **source-level architectural refactor** (redefine `ThemeMode` as a standalone literal union independent of `keyof typeof themes`, plus a type-module boundary keeping request/descriptor types out of any module importing React-bearing types) — not a build-config change.

The team intentionally chose **not** to make that tradeoff for Phase S4: it would either duplicate declarations or add architectural complexity **without improving runtime behavior**, which is the only behavior that governs how `./inspect` deploys. React and Remotion are declared **peer dependencies**, so a type-checking consumer resolves the declaration references regardless.

**The contract:**

1. `./inspect` guarantees **runtime** independence from React/Remotion; `dist/inspect.js` imports nothing external. This is enforced by the committed React-free guard.
2. Declaration-level React/Remotion references are **accepted and intentional**, not a defect to be fixed under time pressure.
3. Full declaration-level independence, if ever required, is a **dedicated future phase** (redefine `ThemeMode`; introduce a request/descriptor type-module boundary) — undertaken only when a real consumer needs it, never as incidental cleanup.
