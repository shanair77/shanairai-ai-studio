# Motion

## Purpose

Document the motion primitive library: how animation is driven, the shared timing contract,
and every primitive. Source: `src/animations/*`. Consumes `config/Animation` (easings) +
`config/Timing` (durations).

## Concepts

- **Frame-driven, always.** Every primitive reads `useCurrentFrame()` and maps it through
  `interpolate()`. **CSS/Tailwind transitions and animations are forbidden** — they don't
  render. This is the single most important motion rule.
- **Wrapper components.** Each primitive wraps its `children` in an element with an inline,
  animated `style` (merged last), so it composes around any typography/layout primitive and a
  caller's `style` can override it.
- **Seconds, not frames.** `duration`/`delay` are authored in seconds and converted against the
  live `fps` (`useVideoConfig()`), so a primitive behaves identically at any frame rate.
- **Named or custom easing.** `easing` accepts a token from `config/Animation` (`"entrance"`,
  `"luxe"`, `"exit"`, …) or a raw easing function.
- **Format-correct.** Travel/blur distances are authored at `BASE_WIDTH` and scaled via
  `useScale()`.

Shared contract (`useAnimationProgress`): one-shot primitives map the frame to an eased
`0 → 1` progress over `[delay, delay + duration]`, clamped outside.

## Primitives

**One-shot** (props: `duration`, `delay`, `easing`, `style`):

| Primitive | Effect |
|---|---|
| `FadeIn` / `FadeOut` | opacity |
| `FadeUp` / `FadeDown` | fade + vertical travel |
| `FadeLeft` / `FadeRight` | fade + horizontal travel |
| `ScaleIn` | fade + scale-up pop (`from`) |
| `BlurReveal` | fade + focus pull (`blur`) |
| `HeroReveal` | composite fade + zoom + blur + rise |

**Continuous** (span the clip / loop):

| Primitive | Effect / props |
|---|---|
| `KenBurns` | slow zoom + pan (`from`, `to`, `panX`, `panY`) |
| `Float` | looping sine drift (`amplitude`, `period`, `axis`) |
| `Parallax` | steady depth drift (`distance`, `speed`, `axis`, `reverse`) |

Directional fades take a `distance` (base-px). Transforms use the CSS `translate`/`scale`
shorthands (not `transform` strings), per the repo authoring rules.

## Examples

```tsx
<FadeUp delay={0.2}><Headline>Title</Headline></FadeUp>
<HeroReveal><Headline variant="display">Hero</Headline></HeroReveal>
<KenBurns from={1} to={1.08}><Img src={staticFile("bg.jpg")} /></KenBurns>
<Float amplitude={12} period={3}><Logo /></Float>
```

Custom easing / duration:
```tsx
<ScaleIn duration={0.8} easing="overshoot" from={0.9}>{content}</ScaleIn>
```

## Best practices

- Compose motion around content (`<FadeUp><Headline/></FadeUp>`); let scenes stagger by
  increasing `delay`.
- Author durations in seconds; let the primitive convert to frames.
- Reuse the easing tokens for a consistent house feel.

## Common mistakes

- Reaching for a CSS `transition`/`animation` or a Tailwind `animate-*` class — it won't render.
- Building a `transform` string instead of the `translate`/`scale` shorthands.
- Driving a value off wall-clock time / `Date.now()` instead of `useCurrentFrame()` — breaks
  determinism.

## Extension points

- Add a primitive by consuming `useAnimationProgress` (one-shot) or reading the frame directly
  (continuous), and mapping progress to a `style`. Mirror an existing file.
- For scene-to-scene motion, use the **transition** engine, not a motion primitive
  ([TRANSITIONS.md](./TRANSITIONS.md)).
