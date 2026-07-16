# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A [Remotion](https://remotion.dev) project — videos are authored as React components and rendered frame-by-frame to video. Uses React 19, TypeScript, and Tailwind v4 (wired into Remotion's webpack via `@remotion/tailwind-v4`).

## Commands

```bash
npm run dev                              # Launch Remotion Studio (interactive preview/editor)
npm run build                            # Bundle the project (remotion bundle)
npm run lint                             # eslint src && tsc — the full check, run before finishing
npx remotion render                      # Render a composition to video
npx remotion still MyComp --frame=30 --scale=0.25   # Render one frame to sanity-check layout
npx remotion studio --no-open            # Start Studio headless (prints preview URL)
npx remotion add <pkg>                   # Add @remotion/*, mediabunny, zod at the correct version
```

There is no test suite. `npm run lint` runs both ESLint and `tsc` (typecheck, `noEmit`) — that is the verification step.

## Architecture

The render entry point is a registration chain, not a page:

- `src/index.ts` calls `registerRoot(RemotionRoot)` — this is the entry Remotion loads.
- `src/Root.tsx` (`RemotionRoot`) is where every `<Composition>` must be registered. A composition not reachable from here does not exist to the Studio or renderer.
- `src/Composition.tsx` defines a `<Composition>` (id, `durationInFrames`, `fps`, `width`, `height`, `component`) whose `component` is the React tree rendered per frame.

`remotion.config.ts` configures the CLI/bundler only (image format, Tailwind, overwrite behavior). Per the file's own note, it does **not** apply when rendering via the Node APIs — pass options directly there instead. It is excluded from `tsconfig.json`.

`tsconfig.json` sets `noUnusedLocals` and `strict`, so unused variables fail the typecheck.

## Remotion authoring rules (non-obvious, enforced by convention)

These come from the local skills in `.agents/skills/` and matter because violating them produces video that renders incorrectly even though it looks fine in a browser:

- **CSS transitions/animations and Tailwind animation classes are forbidden** — they do not render. Animate by reading `useCurrentFrame()` and driving values through `interpolate()`.
- Prefer `interpolate()` over `spring()`. Keep the `interpolate()` call inline in the `style` prop (keeps keyframes editable in Studio). Use `Easing.bezier()` / `Easing.spring()` for custom timing.
- Prefer the `scale` / `translate` / `rotate` CSS shorthands over building `transform` strings.
- Assets go in `public/` and are referenced with `staticFile()`. Use `<Img>` for images and `@remotion/media`'s `<Video>` / `<Audio>` for media.
- Delay/limit content with `<Sequence from={...} durationInFrames={...}>`; add `layout="none"` for inline (non-absolute-fill) content.
- Give `Interactive`, `Solid`, and `Sequence` a descriptive `name` prop so they are editable in Studio.

## Skills library

`.agents/skills/` (mirrored under `.agents/skills/remotion-best-practices/`) is a deep, task-indexed reference for Remotion — captions, transitions, effects, 3D, audio visualization, fonts, voiceover, FFmpeg, `calculateMetadata`, Zod-parameterized compositions, and SaaS/`<Player>`/Lambda rendering. Consult the relevant `SKILL.md` there before implementing anything beyond a basic animation; the effects list and rendering paths in particular are extensive.
