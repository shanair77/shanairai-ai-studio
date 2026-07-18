# ADR-006 — Parameter Engine (declarative, serializable template parameters)

- **Status:** Accepted — pending Phase 21 implementation
- **Date:** 2026-07-18
- **Deciders:** Framework architecture
- **Related:** ADR-001 (registry kernel + typed family recipe), ADR-002 (capabilities precedent),
  ADR-003 (asset engine + name selection), ADR-004 (brand system + name selection), ADR-005
  (template engine — the consumer of parameters). The registry kernel's family recipe is reused
  for the parameter *type* vocabulary; the serialization boundary (code-behind-a-name) is reused
  for validators.

---

## 1. Context

A template's inputs today are an opaque generic `P extends TemplateParams` plus an optional
**imperative** `validate?: (params: P) => void` closure (ADR-005 §4.1). TypeScript erases `P` at
runtime, so the framework cannot answer "what does this template accept?" There is no defaults
engine, no declarative validation, and no machine-readable description that an AI Director, a web
form, Remotion Studio, a CLI, or a REST endpoint could read. Every template hand-rolls
`p.body ?? ""` and ad-hoc `if (!p.title) throw`.

## 2. Problem

Provide a **declarative, serializable, React-independent, validated** description of a template's
parameters: self-describing (types + constraints + defaults + metadata), enforced uniformly, and
consumable by many surfaces without touching React — while preserving the JSON `{ template,
params }` boundary an AI Director emits.

## 3. Alternatives considered

- **A. Keep the raw `P` + imperative `validate`.** Zero new surface, but no introspection, no
  defaults engine, no shared vocabulary; each surface re-describes params.
- **B. Parameters as a global registry family** (a `parameterRegistry` of individually-named
  `ParameterDefinition`s). Rejected: a single parameter is not independently selectable the way a
  scene or brand is — it only has meaning inside its template. A registry whose entries are never
  selected by name is a false parallel to the other families.
- **C. Adopt Zod.** A runtime dependency that couples the schema to a library, undermines the
  JSON/AI-Director boundary (Zod schemas aren't serializable), and contradicts the framework's
  standing no-Zod, structural-validation stance.
- **D. Hybrid — a `ParameterType` registry family + an embedded `ParameterSchema` + a pure
  `ParameterResolver` (chosen).** The parameter *type vocabulary* is the fifth-recipe registry
  (Definition + Registry + erased Resolver); each template's *schema* is embedded declarative
  policy; a pure resolver folds caller values + defaults + validation into immutable
  `ResolvedParameters`. Fully serializable, React-free, no new dependency.

## 4. Decision

```mermaid
flowchart TD
  TYPES["parameterTypeRegistry<br/>createParameterTypeDefinition&lt;V&gt;"] --> RESOLVE
  SCHEMA["TemplateDefinition.parameters?: ParameterSchema<br/>(embedded, declarative policy)"] --> RESOLVE
  CALLER["caller values (spec.params, JSON)"] --> RESOLVE["resolveParameters(schema, values, ctx)"]
  RESOLVE --> RESULT["Result&lt;ResolvedParameters, ParameterIssue[]&gt;"]
  RESULT --> BUILD["template.build(readonly params, ctx)  (in buildFromTemplate)"]
```

### 4.1 Type registry vs embedded schema (the split)

- The **parameter *type* vocabulary is a registry family**: `parameterTypeRegistry` of
  `ParameterTypeDefinition`s, extended via `createRegistry(...)` / `.extend(...)`, resolved through
  an **erased** `ParameterTypeResolver` (`require → ParameterTypeDefinition<any>`) — identical to
  scenes/transitions/assets/brands.
- Each template's **`ParameterSchema` stays embedded** in `TemplateDefinition` (new optional
  `parameters?`), replacing the imperative `validate`.

### 4.2 Strict behavior/policy separation

`ParameterTypeDefinition` describes **HOW a value behaves** — nothing template-specific. It must
never accumulate policy (no per-template defaults, labels, or min/max on the type).
`ParameterDefinition` describes **HOW THIS TEMPLATE USES THAT TYPE** — required, default,
constraints, conditions, metadata, ui.

```ts
// BEHAVIOR ONLY — the registry family.
type ParameterTypeDefinition<V = unknown> = {
  name: string;
  parse: (raw: unknown, def: ParameterDefinition, ctx: ParameterContext) => V;                 // JSON → typed value
  validate?: (value: V, def: ParameterDefinition, ctx: ParameterContext, issues: ParameterIssue[], path: string) => void;
  serialize?: (value: V) => ParameterValue;                                                     // typed value → JSON
  ui?: ParameterUIHints;                                                                        // DEFAULT hints (overridable)
  capabilities?: ParameterCapabilities;                                                         // machine-read
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParameterTypeMap = Record<string, ParameterTypeDefinition<any>>;
type ParameterTypeResolver = { require(name: string): ParameterTypeDefinition<any>; has(n: string): boolean; keys(): string[] };
const createParameterTypeDefinition: <V>(spec: ParameterTypeDefinition<V>) => ParameterTypeDefinition<V>;
const parameterTypeRegistry: Registry<ParameterTypeMap>;   // built-in types (§4.4)
```

### 4.3 Type relationships (policy grouped into nested objects — no "fat" definition)

```ts
type ParameterValue = string | number | boolean | null | ParameterValue[] | { [k: string]: ParameterValue };

type ParameterTypeName =
  | "string" | "text" | "number" | "boolean" | "enum" | "color"
  | "image" | "video" | "audio" | "brand" | "date" | "url" | "list" | "group";   // reserved: "richText"

type EnumOption = { value: ParameterValue; label?: string; icon?: string };

type ParameterConstraints = {
  min?: number; max?: number; step?: number;         // number / date bound / string-length / list-length
  pattern?: string;                                  // regex source (string / url)
  enum?: readonly ParameterValue[]; options?: EnumOption[];
  itemType?: ParameterTypeName;                      // list element type
  fields?: ParameterDefinition[];                    // group/object nested params (the ONLY value nesting)
  assetCategory?: AssetCategory;                     // image/video/audio → required category
};

// V1 condition model (declarative JSON). An expression AST is reserved for V2 (§12) — NOT implemented.
type ParameterCondition =
  | { key: string; equals: ParameterValue }
  | { key: string; in: ParameterValue[] }
  | { key: string; exists: boolean }
  | { all: ParameterCondition[] } | { any: ParameterCondition[] } | { not: ParameterCondition };
type ParameterConditions = { requiredWhen?: ParameterCondition; visibleWhen?: ParameterCondition };

type ParameterUIHints = {
  control?: "input" | "textarea" | "select" | "radio" | "switch" | "slider" | "colorPicker" | "assetPicker" | "datePicker" | "repeater";
  rows?: number; unit?: string; columns?: number; collapsible?: boolean;
};
type ParameterMetadata = {
  label?: string; description?: string; placeholder?: string; helpText?: string;
  group?: string;                                    // ParameterGroup id
  advanced?: boolean; order?: number; icon?: string;
};
type ParameterCapabilities = { localizable?: boolean; responsive?: boolean; computed?: boolean; aiGeneratable?: boolean };

// POLICY — how THIS template uses a type. Nested objects keep it lean + evolvable.
type ParameterDefinition = {
  key: string;
  type: ParameterTypeName;
  required?: boolean;
  default?: ParameterValue;
  validators?: string[];                             // NAMED refs (serializable) → validatorRegistry
  constraints?: ParameterConstraints;
  conditions?: ParameterConditions;
  metadata?: ParameterMetadata;
  ui?: ParameterUIHints;                             // overrides the type's default hints
  capabilities?: ParameterCapabilities;
};

// UI ORGANIZATION ONLY — never affects validation or the resolved value shape (§4.9).
type ParameterGroup = { id: string; label?: string; description?: string; order?: number; advanced?: boolean; parameters: string[] };

type ParameterSchema = {
  version?: number;
  parameters: ParameterDefinition[];                 // ordered
  groups?: ParameterGroup[];                         // optional UI sections
  capabilities?: ParameterCapabilities;
};
```

### 4.4 Parameter types (built-in vocabulary)

| Type | Value | Behavior notes (in the type, not the definition) |
|---|---|---|
| `string` | `string` | length via `min/max`; `pattern` |
| `text` | `string` | multiline; default ui `textarea` |
| `richText` *(reserved)* | `{ format, content }` | **future** — declared, not implemented |
| `number` | `number` | `min/max/step` |
| `boolean` | `boolean` | type default `false` |
| `enum` | member of `enum`/`options` | membership |
| `color` | `string` | hex/rgb/token grammar |
| `image`/`video`/`audio` | `string` (asset **name**) | existence + `assetCategory` match (§4.10) |
| `brand` | `string` (brand **name**) | existence (§4.10) |
| `date` | `string` (ISO-8601) | `min/max` ISO bounds |
| `url` | `string` | URL grammar; scheme allowlist via metadata |
| `list` | `ParameterValue[]` | `itemType`; length `min/max`; recursive |
| `group` | `{ [k]: ParameterValue }` | `fields`; recursive; the only value nesting |

### 4.5 Validation pipeline (explicit, ordered)

```
Raw JSON
  → Type parse            (type.parse: coerce/guard each provided value; shape issues)
  → Type validation       (type.validate: intrinsic validity — color/url/date grammar, asset/brand name)
  → Default resolution    (absent key ← parameter default ← type default)
  → Template constraints   (min/max/step/pattern/enum/options; list + group recursion)
  → Named validators      (validators[]: resolved by name from validatorRegistry)
  → Conditional rules     (requiredWhen/visibleWhen evaluated over the now-complete value set)
  → ResolvedParameters    (deeply readonly — §4.11)
```

Required enforcement is evaluated in the **conditional-rules** stage, because `requiredWhen` may
reference other keys and therefore needs all defaults resolved first. Each stage appends
`ParameterIssue`s; the pipeline is data-in/data-out with no side effects.

### 4.6 Issue model (rich, path-addressed)

```ts
type ParameterIssue = {
  path: string;                     // dotted + array-indexed, e.g. "features[2].title"
  code: string;                     // machine code, e.g. "required", "min", "pattern", "unknown-asset"
  severity: "error" | "warning";
  message: string;                  // human-readable
  expected?: unknown; actual?: unknown;
};
```
`path` (not `key`) scales to nested groups and list items; `severity` lets forms/AI show warnings
without failing; `expected`/`actual` power precise UI + AI feedback.

### 4.7 Resolver — Result-based engine + throwing helper

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; errors: E };

type ParameterResolver = {
  validate(schema: ParameterSchema, values: Record<string, ParameterValue>, ctx?: ParameterContext): ParameterIssue[];   // non-throwing
  resolve(schema: ParameterSchema, values: Record<string, ParameterValue>, ctx?: ParameterContext): Result<ResolvedParameters, ParameterIssue[]>;
  resolveOrThrow(schema: ParameterSchema, values: Record<string, ParameterValue>, ctx?: ParameterContext): ResolvedParameters;   // convenience
};
```

**Tradeoff.** The engine works internally with `Result` because it composes naturally for forms,
CLIs, and AI slot-filling (collect *all* issues; no control-flow-by-exception; pairs with
`validate()`). A throwing `resolveOrThrow` is provided for the build path, where an invalid
composition should fail fast (mirroring `validateComposition`). `buildFromTemplate` uses
`resolveOrThrow`; interactive surfaces use `resolve`/`validate`. Result-first keeps the core honest
and lets each caller pick its error discipline.

### 4.8 Conditions: V1 now, expression AST reserved (V2)

V1 ships the boolean/comparison model above (`equals | in | exists | all | any | not`) — enough for
show/require-when logic and fully JSON. A general **expression AST** (arithmetic, cross-parameter
references, functions) is **reserved for V2 and intentionally not implemented** (§12).

### 4.9 Groups are UI-only

`ParameterGroup` organizes parameters into sections for presentation (forms/Studio) and **must
never affect validation or the resolved value shape**. Value nesting belongs exclusively to
`ParameterDefinition.constraints.fields` (the `group` type). A group referencing a key changes
*where it renders*, never *whether/how it validates*.

### 4.10 Asset & brand validation — names only

The `image`/`video`/`audio` types verify **existence** (`ctx.assets.has(name)`) and **category
compatibility** (the definition's `category` discriminant). They do **not** call `resolveAsset`,
load bytes, or inspect asset `metadata` — the Asset Engine (ADR-003) owns all of that. The `brand`
type verifies **existence** only (`ctx.brands.has(name)`); the Brand Engine (ADR-004) owns brand
semantics. This keeps the parameter layer a pure validator of *references*, not a resolver.

### 4.11 Immutable resolved parameters

```ts
type DeepReadonly<T> = T extends (infer U)[] ? ReadonlyArray<DeepReadonly<U>>
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
type ResolvedParameters = DeepReadonly<Record<string, ParameterValue>>;
```
`build()` receives deeply-readonly params and **must not mutate** them — a documented contract that
keeps template builds pure and deterministic (ADR-005 §4.4).

### 4.12 build() integration + precedence

`resolveTemplateComposition` (ADR-005) gains one step:
```ts
const params = template.parameters
  ? resolveParameters(template.parameters, spec.params, { assets, brands, format })   // Result → throw on errors
  : spec.params;                                                                       // legacy: raw P + imperative validate
template.validate?.(params);       // retained; runs after schema resolution when both exist
const output = template.build(params, ctx);
```

**Value precedence** (orthogonal to ADR-005's transition/music/timing precedence):
```
caller value  >  computed value (future)  >  parameter default  >  type default  >  (absent → required error)
```

### 4.13 Metadata vs capabilities

`metadata`/`ui` are human-/UI-facing and **inert** (never affect validation or rendering);
`capabilities` are machine-read, declarative, and future-facing. The split mirrors ADR-005 §4.1
and must be preserved.

### 4.14 Serialization boundary & the AI Director

The entire `ParameterSchema` — definitions, constraints, enum options, conditions, metadata, ui —
is **pure JSON**. The only non-serializable pieces are **code** (custom validators, later computed
expressions), referenced by **name** from `validatorRegistry` — the identical code-behind-a-name
boundary used for scenes/brands/templates. So `{ template, params }` stays JSON **and** the
template now publishes a machine-readable schema of what it accepts — the missing half of the AI
Director vocabulary (ADR-004 §4.8, ADR-005 §4.8). The schema becomes the **single source of truth**
for a future export chain: `ParameterSchema → JSON Schema → OpenAPI → Studio Controls → CLI → Web
Forms → AI Director` (§12).

## 5. Architectural boundaries (hard limits — the Parameter Engine validates data only)

The Parameter Engine does **NOT**, and must never:

- import or render **React** — no elements, no components (§6);
- create a **Context, Provider, or Hook** (§6);
- **load or resolve assets** — it checks a name's existence + category only (§4.10);
- **load or resolve brands** — it checks a name's existence only (§4.10);
- **render** anything or read frames;
- **execute templates** — it does not call `template.build`; it produces `ResolvedParameters` that
  `buildFromTemplate` (the Template Engine) passes to `build`;
- **assemble compositions** — it never touches `buildComposition`, the timeline, or the tree.

Its sole responsibility is: **schema + values → validated, immutable `ResolvedParameters` (or
issues)**. Everything else belongs to a layer that *consumes* the result.

## 6. No Provider, no React (a feature)

Unlike Theme, Assets, and Brand — which each install a Provider because they cross into the render
tree — **parameters are pre-render data**. `src/parameters/` therefore has **no Context, no
Provider, and no Hooks**, and imports no React. This is a deliberate design property, not an
omission: it keeps the engine usable from a CLI, a server, a test, or an AI loop with zero render
context.

## 7. Dependency impact (no cycles)

- **New layer `src/parameters/`** — types, `parameterTypeRegistry`, `createParameterTypeDefinition`,
  `resolveParameters`/`validateParameters`, empty `validatorRegistry`. Depends **downward** only on
  `registry` (kernel), `config` (`FormatName`), `assets` (`AssetCategory`, `AssetRegistry` **type**
  — for name checks), `brand` (`BrandRegistry` **type**). Imports **nothing** from `templates` or
  `composition`.
- **`templates`** adds an edge → `parameters` (optional `parameters?` on `TemplateDefinition`;
  `resolveTemplateComposition` calls `resolveParameters`).
- No back-edge exists (parameters needs only asset/brand *types* for reference validation, all in
  lower layers), so **no cycle**.

## 8. Backward compatibility

Purely additive. `TemplateDefinition.parameters?` is optional; templates without a schema keep the
raw `P` + imperative `validate` path unchanged. `buildComposition`, `CompositionSchema`, and
`buildFromTemplate`'s public surface are untouched. Nothing consumes parameters by default, so the
demo renders **byte-identical**.

## 9. Migration plan (Phase 21 = Parameter Engine Core)

1. `src/parameters/` — types (§4.3); `parameterTypeRegistry` with the built-in types (§4.4);
   `createParameterTypeDefinition`; `resolveParameters` (Result) + `resolveOrThrow` +
   `validateParameters`; empty `validatorRegistry`; barrel.
2. **Templates integration (additive):** `TemplateDefinition.parameters?: ParameterSchema`;
   `resolveTemplateComposition` runs `resolveParameters` when present and passes readonly resolved
   params to `build`; raw `P` + imperative `validate` retained.
3. Tests + fixture schemas (the framework ships **no** business schemas).
4. **Deferred:** computed parameters/expressions, expression-AST conditions (V2), localization,
   responsive variants, AI-generated defaults, JSON-Schema/OpenAPI export, Zod codegen, UI adapters
   (forms/Studio/CLI), lifecycle hooks, `InferParams<Schema>`.

## 10. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Serializability erosion via validator closures | Medium | Named `validatorRegistry` refs; any code closure excluded from the serialized schema + documented. |
| Param-type registry erasure/invariance | Low | `ParameterTypeDefinition<any>` erased resolver + typed `createParameterTypeDefinition` — the solved scenes/assets/brand pattern. |
| Type-vocabulary scope creep | Medium | MVP ships a curated set; `richText`/computed/etc. reserved. |
| Behavior/policy leakage onto the type | Medium | §4.2 forbids template policy on `ParameterTypeDefinition`; enforced by review + tests. |
| Two authoring modes (raw `P` vs schema) | Low | Schema is optional + additive; back-compat; demo byte-identical. |
| Over-abstraction | Medium | Declarative, lean, nested-object policy; no Provider, no React, no hooks in MVP. |
| Precedence confusion (params vs composition) | Low | Orthogonal axes, both documented + tested; computed deferred. |

## 11. Testing strategy

- **Pure:** `resolveParameters` (defaults, coercion, precedence caller > default > type-default),
  each type's `parse`/`validate`, constraints (required, min/max, step, pattern, enum, url/date/
  color, list/group recursion), asset/brand **name** validation against fixture registries,
  `requiredWhen`/`visibleWhen`, `validateParameters` issue reporting (paths, codes, severity),
  **serializability round-trip** (schema → `JSON.stringify`/`parse` → deep-equal), **immutability**
  (a `build` that mutates resolved params is rejected/frozen).
- **Type:** `createParameterTypeDefinition` inference; `@ts-expect-error` for malformed type defs;
  erased-resolver assignability; `DeepReadonly` prevents assignment.
- **Integration:** `buildFromTemplate` with a schema — defaults reach `build`, invalid caller
  values rejected, resolved params correct; **back-compat** (no-schema template unchanged; **demo
  byte-identical**).
- No render dependency (engine is pure).

## 12. Future extension points

- **Computed parameters / expressions** — a named `computeRegistry` (serializable ref) or the
  reserved **expression AST (V2)** for conditions/derivations; `capabilities.computed`.
- **Localization** — locale-keyed values + `ctx.locale`; `capabilities.localizable`.
- **Responsive variants** — format-keyed values + `ctx.format`; `capabilities.responsive`.
- **AI-generated defaults** — `capabilities.aiGeneratable` + a Director-fills hook.
- **Export chain** — `ParameterSchema → JSON Schema → OpenAPI → Studio Controls → CLI → Web Forms →
  AI Director`, each a pure adapter in its own layer; the schema is the single source of truth.
- **Zod generation** — schema → Zod **codegen**, opt-in, **never a runtime dependency**.
- **Lifecycle hooks** — **deferred** (consistent with ADR-005 §4.7): the declarative pipeline plus
  named validators/computes covers the need without reintroducing non-serializable imperative
  seams; revisit alongside the template lifecycle-hook decision.
