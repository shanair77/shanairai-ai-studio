# Asset Error Taxonomy

How the asset engine (`src/assets/`) decides between `DomainError` and raw `Error`. Established and
test-protected in **Phase 40**. Builds on the error model in
[ADR-007](./adr/ADR-007-lifecycle-execution-engine.md).

## The design rule

Every thrown error in the asset engine is one of two kinds:

| Throw | Meaning | Who caused it | How the Execution Engine treats it |
|---|---|---|---|
| **`DomainError`** | An **expected user / configuration failure** | The author's registry, request, or asset definition | **Classified** into an `ExecutionReport` issue — reported, not crashed |
| **raw `Error`** | An **internal invariant or programmer error** | A framework bug, or misuse of an internal API | **Rethrown** as an unexpected failure — surfaces as a crash so the bug is visible |

The rule in one line: **if a correct caller can trigger it by supplying bad configuration, it is a
`DomainError`; if only a bug or internal-API misuse can trigger it, it stays a raw `Error`.**

## Why the distinction exists

`execute()` catches `DomainError` and turns it into a diagnostic; it **rethrows everything else**
(ADR-007). That split is only useful if the two error kinds are used honestly:

- Making a genuine bug a `DomainError` would **mask it** as a "config issue" in the report, and the
  broken invariant would be silently swallowed instead of surfacing.
- Making a user-configuration failure a raw `Error` would **crash** the compiler on ordinary bad
  input instead of returning an actionable, path-addressed diagnostic.

So the taxonomy is what lets an SDK consumer trust that a failed `compile()` report describes *their*
mistake, while a thrown exception means *our* bug.

## The five `DomainError` codes

| Code | Site | When it fires | Diagnostics carried |
|---|---|---|---|
| `invalid-asset-metadata` | `resolve.ts` `validateMetadata` | Declared metadata (width/height/duration) is not a positive number | `path`, `actual` |
| `asset-category` | `resolve.ts` `assertCategory` | An asset is used where its category isn't allowed (e.g. an image requested as audio) | `expected`, `actual` |
| `unresolvable-source` | `resolve.ts` `resolveAsset` | No registered resolver supports the declared source shape | — |
| `invalid-asset-source` | `resolvers.ts` `RemoteAssetResolver` | A remote source is not a valid `http(s)` URL | `actual` |
| `unknown-asset` | `AssetKit.tsx` kit lookup | A brand kit references an asset name that isn't registered | `actual` |

`asset-category` and `unknown-asset` **reuse** codes that already exist in the Parameter Engine —
they mean exactly the same thing there, so one code carries one meaning across the framework.

## The four intentional raw `Error` guards

These are **not** bugs to convert — they are deliberately raw, because only a framework fault or
internal-API misuse can reach them:

| Site | Guard | Why raw `Error` |
|---|---|---|
| `resolvers.ts` `LocalAssetResolver.resolve` | source kind ≠ `local` | Unreachable in engine flow — `supports()` gates the kind first; reached only by calling `.resolve()` directly with the wrong kind |
| `resolvers.ts` `RemoteAssetResolver.resolve` | source kind ≠ `remote` | Same invariant, mirrored |
| `AssetKit.tsx` `useAssetRegistry` | no `<AssetRegistryProvider>` in the tree | React-hook misuse (a programming error), not configuration |
| `AssetKit.tsx` `fileSrc` | resolved asset kind ≠ `file` | Invariant guard for reserved-but-unbuilt asset kinds no resolver ever produces |

## Enforced by tests

The taxonomy is a behavioral contract, not a convention. Phase 40 added focused assertions
(`src/assets/__tests__/resolve.test.ts`, `resolvers.test.ts`, `AssetKit.test.ts`) proving that:

1. each of the five converted cases throws a `DomainError`,
2. each exposes the expected `code` (and `path` / `expected` / `actual` where applicable),
3. at least one invariant guard remains `instanceof Error` but **`not instanceof DomainError`**, and
4. the original error messages are preserved.

Changing an asset throw's kind or code will fail these tests — so the vocabulary above cannot drift
from the implementation without a deliberate, reviewed edit.
