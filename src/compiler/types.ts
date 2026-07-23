/**
 * compiler/types — the public compiler contract (Phase S2).
 *
 * These are the SDK's OWN types. `CompileRequest` is defined STRUCTURALLY rather than aliased to the
 * internal `TemplateCompositionFor`, so the public surface can evolve independently of the template
 * engine's request shape (SDK design DR-S0 §5, decision #1). It is structurally identical today; that
 * is a coincidence to preserve deliberately, not a coupling. `CompileResult` reuses the existing
 * `ExecutionReport` diagnostic contract and deliberately OMITS `schema` — no `CompositionSchemaBase`
 * ever reaches a public result.
 */

import {
  type BuiltComposition,
  type MusicConfig,
  type TimingConfig,
  type TransitionConfig,
  type VideoConfigInput,
} from "../composition";
import { type ThemeMode } from "../config/Theme";
import { type FrameworkRegistries } from "../contracts";
import { type ExecutionReport } from "../execution";
import { type FrameworkDescriptor } from "../metadata";
import { type Registry } from "../registry";
import { type ParamsOf, type TemplateMap } from "../templates";

/**
 * The registries a compiler is built over. `templates` is REQUIRED — the framework ships none, and it
 * binds the typed template map `M`. Every other family is optional and falls back to its framework
 * default through the standard resolution path (`resolveRegistries`, invoked inside the engine).
 */
export type CompilerConfig<M extends TemplateMap> = {
  templates: Registry<M>;
  scenes?: FrameworkRegistries["scenes"];
  transitions?: FrameworkRegistries["transitions"];
  assets?: FrameworkRegistries["assets"];
  brands?: FrameworkRegistries["brands"];
  parameterTypes?: FrameworkRegistries["parameterTypes"];
  validators?: FrameworkRegistries["validators"];
};

/**
 * A typed compile request: a template name from `M` plus its inferred params, over the shared
 * canvas / brand / theme / transitions / music / timing fields. Declared here as part of the SDK
 * contract — intentionally NOT an alias of the internal `TemplateCompositionFor`.
 */
export type CompileRequest<M extends TemplateMap> = VideoConfigInput & {
  id: string;
  brand?: string;
  theme?: ThemeMode;
  transitions?: TransitionConfig;
  music?: MusicConfig;
  timing?: TimingConfig;
} & {
  [N in keyof M & string]: { template: N; params: ParamsOf<M[N]> };
}[keyof M & string];

/**
 * The result of a compile. Success carries the terminal `BuiltComposition`; both branches carry the
 * append-only `ExecutionReport`. There is intentionally NO `schema` field — the config-shaped
 * `CompositionSchemaBase` is an internal execution detail and never a public result.
 */
export type CompileResult =
  | { ok: true; composition: BuiltComposition; report: ExecutionReport }
  | { ok: false; report: ExecutionReport };

/** A compiler bound to a fixed set of registries. */
export type Compiler<M extends TemplateMap> = {
  compile(request: CompileRequest<M>): CompileResult;
  describe(): FrameworkDescriptor;
};
