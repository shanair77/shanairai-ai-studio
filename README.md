# AI-Studio

A configuration-driven video framework built on [Remotion](https://remotion.dev). You describe
a video as data — scenes, transitions, brand, music — and the engine assembles the final
`<Composition>`. Type-safe at the authoring surface, deterministic in rendering, brand-aware,
and strictly layered.

> Core architecture stable through Phase 12. Built with React 19, TypeScript, Tailwind v4.

## Documentation

Full documentation lives in **[`docs/`](./docs/README.md)**:

| Start here | Then |
|---|---|
| [docs/README.md](./docs/README.md) — overview, philosophy, quick start | [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — layers + dependency rules |
| [AUTHORING_GUIDE.md](./docs/AUTHORING_GUIDE.md) — build scenes, transitions, compositions, brands | [API.md](./docs/API.md) — every public API |
| [FRAMEWORK.md](./docs/FRAMEWORK.md) · [COMPOSITION_ENGINE.md](./docs/COMPOSITION_ENGINE.md) · [REGISTRIES.md](./docs/REGISTRIES.md) | [ROADMAP.md](./docs/ROADMAP.md) · [CONTRIBUTING.md](./docs/CONTRIBUTING.md) · [TESTING.md](./docs/TESTING.md) |

Subsystems: [THEMING](./docs/THEMING.md) · [TYPOGRAPHY](./docs/TYPOGRAPHY.md) ·
[MOTION](./docs/MOTION.md) · [LAYOUT](./docs/LAYOUT.md) · [TRANSITIONS](./docs/TRANSITIONS.md) ·
[FONTS](./docs/FONTS.md) · [Custom scenes](./docs/BUILDING_CUSTOM_SCENES.md) ·
[Custom transitions](./docs/BUILDING_CUSTOM_TRANSITIONS.md) · [ADRs](./docs/adr/)

## Commands

```console
npm i                          # install
npm run dev                    # Remotion Studio (interactive preview)
npm run verify                 # lint + typecheck + tests — the single green gate
npx remotion render Demo out/demo.mp4   # render the demo composition
npx remotion upgrade           # upgrade Remotion
```

CLAUDE.md and `.agents/skills/` document the Remotion authoring rules this framework enforces.

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
