/**
 * requests/process — the Request Processing pipeline entry points (ADR-008).
 *
 * `processRequest` turns untrusted input into a guaranteed-valid, guaranteed-serializable
 * `ExecutionRequest` via: parse → migrate → validate-envelope → normalize → apply-defaults. It owns
 * SYNTAX only (structure, version, JSON-safety); it touches NO registry and performs NO semantic
 * validation, defaults, or rendering (Execution owns those). Always returns a `Result`; it catches
 * `JSON.parse` + expected migration `DomainError`s and RETHROWS unexpected errors.
 */

import { DomainError, sanitize } from "../errors";
import { CURRENT_REQUEST_VERSION, migrationRegistry } from "./version";
import { createReport, type RequestReportBuilder } from "./report";
import { findNonJsonPath } from "./jsonSafety";
import {
  type NormalizedExecutionRequest,
  type RawExecutionRequest,
  type RawInput,
  type RequestContext,
  type RequestResult,
  type RequestSchemaVersion,
} from "./types";

const ENVELOPE_KEYS = new Set([
  "version", "id", "template", "params", "brand", "theme", "transitions", "music", "timing",
  "format", "width", "height", "fps", "duration", "durationInFrames",
]);
const NUMERIC_KEYS: (keyof RawExecutionRequest)[] = ["width", "height", "fps", "duration", "durationInFrames"];

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const deriveRequestId = (id: unknown): string => `req:${typeof id === "string" && id.length > 0 ? id : "anonymous"}`;

/** Stage: parse. JSON.parse a string (catching the throw) or accept a value; guard it's an object. */
const parse = (input: RawInput, report: RequestReportBuilder): RawExecutionRequest | null => {
  let value: unknown = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input);
    } catch {
      report.issue("parse", { code: "invalid-json", message: "Request is not valid JSON." });
      report.failStage("parse");
      return null;
    }
  }
  if (!isPlainObject(value)) {
    report.issue("parse", { code: "invalid-request-shape", message: "Request must be a JSON object.", actual: sanitize(value) });
    report.failStage("parse");
    return null;
  }
  report.ok("parse");
  return value;
};

/** Stage: migrate. Single-step (`vN → vN+1`) chain from the declared version up to the target. */
const migrate = (
  raw: RawExecutionRequest,
  ctx: RequestContext,
  target: RequestSchemaVersion,
  report: RequestReportBuilder,
): { raw: RawExecutionRequest; from: RequestSchemaVersion } | null => {
  const declared = typeof raw.version === "string" && raw.version.length > 0 ? raw.version : CURRENT_REQUEST_VERSION;
  const fromN = Number(declared);
  const toN = Number(target);
  if (!Number.isInteger(fromN) || fromN < 1 || !Number.isInteger(toN) || toN < 1) {
    report.issue("migrate", { code: "invalid-version", message: `Invalid request version "${declared}".`, path: "version", actual: declared });
    report.failStage("migrate");
    return null;
  }
  if (fromN > toN) {
    report.issue("migrate", { code: "unsupported-version", message: `Request version "${declared}" is newer than supported "${target}".`, path: "version", expected: target, actual: declared });
    report.failStage("migrate");
    return null;
  }
  const migrations = ctx.migrations ?? migrationRegistry;
  let current = raw;
  for (let v = fromN; v < toN; v += 1) {
    const key = String(v);
    if (!migrations.has(key)) {
      report.issue("migrate", { code: "unsupported-version", message: `No migration from version "${v}" to "${v + 1}".`, path: "version", actual: declared });
      report.failStage("migrate");
      return null;
    }
    try {
      current = migrations.require(key)(current);
    } catch (error) {
      if (error instanceof DomainError) {
        report.issue("migrate", { code: error.code, message: error.message, ...(error.path !== undefined ? { path: error.path } : {}) });
        report.failStage("migrate");
        return null;
      }
      throw error; // unexpected — never masked
    }
  }
  report.ok("migrate", fromN === toN ? "current" : `${fromN}→${toN}`);
  return { raw: current, from: declared };
};

/** Stage: validate-envelope. Structural (shape) checks against the current grammar — no semantics. */
const validateEnvelope = (raw: RawExecutionRequest, report: RequestReportBuilder): boolean => {
  const issues: { code: string; message: string; path: string; actual?: unknown }[] = [];
  const bad = (path: string, code: string, message: string, actual?: unknown) => issues.push({ code, message, path, actual });

  if (typeof raw.id !== "string" || raw.id.trim().length === 0) bad("id", "invalid-envelope", "`id` must be a non-empty string.", raw.id);
  if (typeof raw.template !== "string" || raw.template.trim().length === 0) bad("template", "invalid-envelope", "`template` must be a non-empty string.", raw.template);
  if (raw.params !== undefined && !isPlainObject(raw.params)) bad("params", "invalid-envelope", "`params` must be an object.", raw.params);
  if (raw.brand !== undefined && typeof raw.brand !== "string" && !isPlainObject(raw.brand)) bad("brand", "invalid-envelope", "`brand` must be a string or a BrandConfig object.", raw.brand);
  if (raw.theme !== undefined && typeof raw.theme !== "string") bad("theme", "invalid-envelope", "`theme` must be a string.", raw.theme);
  if (raw.transitions !== undefined && (!isPlainObject(raw.transitions) || typeof raw.transitions.type !== "string")) bad("transitions", "invalid-envelope", "`transitions` must be an object with a string `type`.", raw.transitions);
  if (raw.music !== undefined && !isPlainObject(raw.music)) bad("music", "invalid-envelope", "`music` must be an object.", raw.music);
  if (raw.timing !== undefined && !isPlainObject(raw.timing)) bad("timing", "invalid-envelope", "`timing` must be an object.", raw.timing);
  if (raw.format !== undefined && typeof raw.format !== "string") bad("format", "invalid-envelope", "`format` must be a string.", raw.format);
  for (const key of NUMERIC_KEYS) {
    const v = raw[key];
    if (v !== undefined && (typeof v !== "number" || !Number.isFinite(v))) bad(String(key), "invalid-envelope", `\`${String(key)}\` must be a finite number.`, v);
  }

  if (issues.length > 0) {
    issues.forEach((i) => report.issue("validate-envelope", { code: i.code, message: i.message, path: i.path, actual: sanitize(i.actual) }));
    report.failStage("validate-envelope");
    return false;
  }
  report.ok("validate-envelope");
  return true;
};

/** Stage: normalize. Transport canonicalization + quarantine of unknown fields + JSON-safety. */
const normalize = (raw: RawExecutionRequest, report: RequestReportBuilder): RawExecutionRequest | null => {
  const out: RawExecutionRequest = {};
  for (const key of Object.keys(raw)) {
    if (!ENVELOPE_KEYS.has(key)) {
      report.warning("normalize", { code: "unknown-field", message: `Unknown field "${key}" dropped.`, path: key });
      continue;
    }
    out[key] = raw[key];
  }
  if (typeof out.id === "string") out.id = out.id.trim();
  if (typeof out.template === "string") out.template = out.template.trim();
  if (typeof out.brand === "string") out.brand = out.brand.trim();

  const badPath = findNonJsonPath(out);
  if (badPath !== null) {
    report.issue("normalize", { code: "non-serializable", message: `Value at "${badPath}" is not JSON-serializable.`, path: badPath });
    report.failStage("normalize");
    return null;
  }
  report.ok("normalize");
  return out;
};

/** Orchestrate the pipeline. Never throws for expected bad input; rethrows unexpected errors. */
export function processRequest(input: RawInput, ctx: RequestContext = {}): RequestResult {
  const target = ctx.targetVersion ?? CURRENT_REQUEST_VERSION;
  const report = createReport(target);

  const parsed = parse(input, report);
  if (!parsed) return { ok: false, report: report.build(ctx.requestId ?? "req:anonymous") };

  const migrated = migrate(parsed, ctx, target, report);
  if (!migrated) return { ok: false, report: report.build(ctx.requestId ?? deriveRequestId(parsed.id), typeof parsed.version === "string" ? parsed.version : undefined) };

  const requestId = ctx.requestId ?? deriveRequestId(migrated.raw.id);

  if (!validateEnvelope(migrated.raw, report)) return { ok: false, report: report.build(requestId, migrated.from) };

  const normalized = normalize(migrated.raw, report);
  if (!normalized) return { ok: false, report: report.build(requestId, migrated.from) };

  // Stage: apply-defaults (envelope-level only — NOT parameter defaults).
  if (normalized.params === undefined) normalized.params = {};
  delete normalized.version; // consumed by migrate; not part of the ExecutionRequest
  report.ok("apply-defaults");

  report.ok("complete");
  return { ok: true, request: normalized as unknown as NormalizedExecutionRequest, report: report.build(requestId, migrated.from) };
}

/** Throwing convenience for simple callers (mirrors `executeOrThrow`). */
export function processRequestOrThrow(input: RawInput, ctx: RequestContext = {}): NormalizedExecutionRequest {
  const result = processRequest(input, ctx);
  if (!result.ok) {
    const detail = result.report.issues.map((i) => ` - [${i.code}] ${i.stage}${i.path !== undefined ? ` (${i.path})` : ""}: ${i.message}`).join("\n");
    throw new Error(`Request processing failed:\n${detail}`);
  }
  return result.request;
}
