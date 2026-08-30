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
  type SceneMap,
  type TimingConfig,
  type TransitionConfig,
  type VideoConfigInput,
} from "../composition";
import { type TransitionMap } from "../transitions";
import { type AssetMap } from "../assets";
import { type BrandMap } from "../brand";
import { type ThemeMode } from "../config/Theme";
import { type ExecutionReport } from "../execution";
import { type FrameworkDescriptor } from "../metadata";
import { type ParameterTypeMap, type ValidatorMap } from "../parameters";
import { type ParamsOf, type TemplateMap } from "../templates";
import { type AssetManifest } from "../manifest";
import { type PlannedRequirement, type UnresolvedReference } from "../requirements/types";

/**
 * The content a compiler is built over — plain object maps, never registries. Registries are an
 * implementation detail the SDK does not ask users to think about.
 *
 * EXTEND SEMANTICS: compiler configuration extends the framework defaults; matching keys override
 * builtins. Providing `scenes: { myScene }` ADDS to the ten builtin scenes rather than replacing
 * them; the same holds for every family. `templates` is REQUIRED — the framework ships none, and it
 * binds the typed template map `M`.
 */
export type CompilerConfig<M extends TemplateMap> = {
  templates: M;
  /**
   * What the pack's assets ARE — provenance, durations, licences, readiness.
   *
   * Declared here because requirement planning needs it and a pack already
   * carries one: `productionPack` has had a manifest since the render boundary
   * landed, and this is the type finally admitting it. Without one a plan can
   * still say which assets a render names, but every one of them comes back
   * unresolved — which is honest, and useless.
   */
  manifest?: AssetManifest;
  scenes?: SceneMap;
  transitions?: TransitionMap;
  assets?: AssetMap;
  brands?: BrandMap;
  parameterTypes?: ParameterTypeMap;
  validators?: ValidatorMap;
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
/**
 * What a specific render would need, as a plan rather than a rendering.
 *
 * Answers "what assets will THIS request reference?" — which is a different
 * question from "what does the pack contain", and the difference is roughly
 * threefold for the first production campaign. A generator acting on the pack
 * would produce assets nothing renders.
 *
 * Validated exactly as `compile` validates: same orchestrator, same stages, so
 * a request `compile` refuses cannot produce a plausible-looking plan here.
 * Pure — no filesystem, no probe, no bundler, no browser.
 */
export type RequirementResult =
  | {
      ok: true;
      template: string;
      /** The version that was planned against — the registered one. */
      version: string;
      /** Every asset this render names, deduplicated, in first-reference order. */
      requirements: PlannedRequirement[];
      /**
       * Assets the composition names that the manifest does not describe.
       *
       * Reported rather than dropped: a silently omitted requirement is one a
       * render will demand later, with nothing pointing back to the plan that
       * failed to mention it.
       */
      unresolved: UnresolvedReference[];
      report: ExecutionReport;
    }
  | { ok: false; report: ExecutionReport };

export type Compiler<M extends TemplateMap> = {
  compile(request: CompileRequest<M>): CompileResult;
  describe(): FrameworkDescriptor;
  /**
   * What a specific render would need, without rendering it.
   *
   * Takes the same request `compile` takes, because it answers a question about
   * the same thing — and running it through the same path is what guarantees
   * the two cannot disagree about whether a request is valid.
   */
  requirementsFor(request: CompileRequest<M>): RequirementResult;
};
