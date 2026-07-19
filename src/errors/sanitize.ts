/**
 * errors/sanitize — deterministic conversion of an arbitrary value into a JSON-safe DiagnosticValue.
 *
 * Diagnostics must never leak functions, symbols, React elements, class instances, stacks,
 * timestamps, or memory addresses (ADR-007 §4.6). `sanitize` maps every non-JSON value to a stable
 * tag string, guards cycles, and caps depth — so an `ExecutionReport` is always serializable and
 * deterministic.
 */

import { type DiagnosticValue } from "./DomainError";

const MAX_DEPTH = 8;
// React elements carry this marker; detected without importing React.
const REACT_ELEMENT = Symbol.for("react.element");

const isPlainObject = (o: object): boolean => {
  const proto = Object.getPrototypeOf(o);
  return proto === Object.prototype || proto === null;
};

const at = (value: unknown, depth: number, seen: WeakSet<object>): DiagnosticValue => {
  if (value === null || value === undefined) return null;

  switch (typeof value) {
    case "string":
      return value;
    case "number":
      return Number.isFinite(value) ? value : null; // NaN / ±Infinity are not JSON
    case "boolean":
      return value;
    case "bigint":
      return "[bigint]";
    case "symbol":
      return "[symbol]";
    case "function":
      return "[function]";
    default:
      break; // "object"
  }

  const obj = value as object;
  if (depth >= MAX_DEPTH) return "[max-depth]";
  if (seen.has(obj)) return "[circular]";
  if ((obj as { $$typeof?: symbol }).$$typeof === REACT_ELEMENT) return "[ReactElement]";

  if (Array.isArray(obj)) {
    seen.add(obj);
    const out = obj.map((v) => at(v, depth + 1, seen));
    seen.delete(obj);
    return out;
  }

  if (!isPlainObject(obj)) return "[object]"; // class instance / exotic — never leak internals

  seen.add(obj);
  const out: { [key: string]: DiagnosticValue } = {};
  for (const key of Object.keys(obj)) {
    out[key] = at((obj as Record<string, unknown>)[key], depth + 1, seen);
  }
  seen.delete(obj);
  return out;
};

/** Deterministically reduce any value to a JSON-safe `DiagnosticValue`. */
export const sanitize = (value: unknown): DiagnosticValue => at(value, 0, new WeakSet());
