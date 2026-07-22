/**
 * requests/types — the Request Processing Pipeline's types (ADR-008).
 *
 * This layer converts untrusted input into a guaranteed-valid, guaranteed-serializable
 * `ExecutionRequest`. It owns SYNTAX only — structure, version, normalization, JSON-safety — and
 * touches no registry and no semantics (Execution owns those). The diagnostic/report protocol is the
 * shared `contracts` `Report<RequestStage>`; the request contract is `contracts.ExecutionRequest`.
 */

import { type Registry } from "../registry";
import { type ExecutionRequest, type Issue, type Report, type Span, type Warning } from "../contracts";
import { type MusicConfig, type TimingConfig, type TransitionConfigBase, type VideoConfigInput } from "../composition";
import { type ThemeMode } from "../config/Theme";

/** Untrusted input: a JSON string or an already-parsed value. */
export type RawInput = string | unknown;

/** Post-parse, pre-validation. */
export type RawExecutionRequest = Record<string, unknown>;

/** The request schema version (numeric string, e.g. "1"). */
export type RequestSchemaVersion = string;

/** The structural request envelope validated here; `params` is the OPAQUE payload (Execution validates it). */
export type RequestEnvelope = VideoConfigInput & {
  version?: RequestSchemaVersion;
  id: string;
  template: string;
  brand?: string;
  theme?: ThemeMode;
  transitions?: TransitionConfigBase;
  music?: MusicConfig;
  timing?: TimingConfig;
};

/** The validated, normalized, guaranteed-serializable output — the type Execution consumes. */
export type NormalizedExecutionRequest = ExecutionRequest;

/** The ordered pipeline stages (ADR-008 §4.4). */
export type RequestStage = "parse" | "migrate" | "validate-envelope" | "normalize" | "apply-defaults" | "complete";

export type RequestIssue = Issue<RequestStage>;
export type RequestWarning = Warning<RequestStage>;
export type RequestSpan = Span<RequestStage>;

/** Append-only, deterministic, JSON-safe. */
export type RequestReport = Report<RequestStage> & {
  requestId: string;
  fromVersion?: RequestSchemaVersion;
  toVersion: RequestSchemaVersion;
};

export type RequestResult =
  | { ok: true; request: NormalizedExecutionRequest; report: RequestReport }
  | { ok: false; report: RequestReport };

/** A single-step migration: `vN → vN+1`. Pure and defensive over unknown input. */
export type Migration = (raw: RawExecutionRequest) => RawExecutionRequest;
export type MigrationMap = Record<RequestSchemaVersion, Migration>;
export type MigrationRegistry = Registry<MigrationMap>;

/** Registry-FREE options. */
export type RequestContext = {
  /** Upgrade target (default `CURRENT_REQUEST_VERSION`). */
  targetVersion?: RequestSchemaVersion;
  /** Version-keyed single-step migrations (default: the empty built-in registry). */
  migrations?: MigrationRegistry;
  /** Caller-supplied request id; else derived deterministically from the request id. */
  requestId?: string;
};
