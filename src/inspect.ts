/**
 * inspect — the package's React-free transport-validation entry (`./inspect`, Phase S4).
 *
 * SIDE-EFFECT FREE and REACT-FREE BY CONSTRUCTION. This entry exists for edge / gateway / serverless
 * tiers that validate untrusted request JSON before forwarding it to a React-bearing render worker.
 * Its entire runtime closure is the transport front-end (`errors`, `registry`, `requests`) — it
 * imports NO React, Remotion, `@remotion/*`, or scene components. A committed guard test
 * (`__tests__/inspect-surface.test.ts`) proves this and fails if a future edit drags them in.
 *
 * Runtime reflection is NOT here: `describeFramework()` reflects real registries and therefore imports
 * scene definitions (React-bearing). Reflection is available only through `compiler.describe()` on the
 * root `.` entry. `FrameworkDescriptor` is re-exported TYPE-ONLY below so transport code can type a
 * serialized catalog without pulling the runtime reflector — an erased import, no runtime edge.
 */

// ══ Runtime — transport validation (Result-returning; the throwing variant stays internal) ═══════
export { processRequest, CURRENT_REQUEST_VERSION } from "./requests";

// ══ Types — request contract (the closure of `processRequest`'s signature) ══════════════════════
export type {
  RawInput,
  RawExecutionRequest,
  NormalizedExecutionRequest,
  RequestContext,
  RequestResult,
  RequestReport,
  RequestStage,
  RequestIssue,
  RequestWarning,
  RequestSpan,
  RequestSchemaVersion,
  Migration,
} from "./requests";

// ══ Types — inspection (type-only; lets transport code type a serialized catalog, no runtime pull) ══
export type { FrameworkDescriptor } from "./metadata";
