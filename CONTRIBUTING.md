# Contributing to AI Studio

Thanks for your interest in contributing. This file is the quick version; the full guide lives in [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md).

## The green gate

Every change must pass the single verification gate before it can merge:

```bash
npm run verify   # eslint + tsc (production) + tsc (tests) + vitest
```

- Public API changes must be intentional and are locked by the exported-surface tests (`src/__tests__/`).
- If behavior or the public surface changes, update the docs.
- Keep changes scoped — no unrelated cleanup bundled into a feature or fix.

## Workflow

1. Fork and branch from `main`.
2. Make your change; add or update tests.
3. Run `npm run verify` locally.
4. Open a PR using the pull request template.

## Where things live

- Architecture and decision records: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md), [`docs/SDK_DESIGN.md`](./docs/SDK_DESIGN.md), [`docs/adr/`](./docs/adr/)
- Authoring guide: [`docs/AUTHORING_GUIDE.md`](./docs/AUTHORING_GUIDE.md)
- Testing strategy: [`docs/TESTING.md`](./docs/TESTING.md)

See [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) for the complete guidelines.
