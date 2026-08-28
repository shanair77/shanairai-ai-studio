/**
 * render.ts — the public `@shanairai/ai-studio/render` entry point.
 *
 * A separate module from `lib.ts` on purpose, and the separation is enforced by a
 * committed test: the root entry must never reach `@remotion/renderer` or
 * `@remotion/bundler`, so that a caller who only compiles never pays for — or has
 * to install — a headless browser.
 */

export * from "./render/index";
