/**
 * requests/jsonSafety — detect the first non-JSON-safe value in a request (ADR-008 §4.7).
 *
 * Unlike `errors/sanitize` (which *converts* diagnostic values), this *detects and reports* so the
 * pipeline can REJECT a request that carries a function, symbol, bigint, non-finite number, React
 * element, class instance, or a cycle — guaranteeing the emitted `ExecutionRequest` is serializable.
 * `undefined` is treated as absent (JSON drops it) and is not an error.
 */

const REACT_ELEMENT = Symbol.for("react.element");

const isPlainObject = (o: object): boolean => {
  const proto = Object.getPrototypeOf(o);
  return proto === Object.prototype || proto === null;
};

const at = (value: unknown, path: string, seen: WeakSet<object>): string | null => {
  if (value === null || value === undefined) return null;
  switch (typeof value) {
    case "string":
    case "boolean":
      return null;
    case "number":
      return Number.isFinite(value) ? null : (path || "(root)");
    case "bigint":
    case "symbol":
    case "function":
      return path || "(root)";
    default:
      break; // object
  }
  const obj = value as object;
  if ((obj as { $$typeof?: symbol }).$$typeof === REACT_ELEMENT) return path || "(root)";
  if (seen.has(obj)) return path || "(root)"; // circular
  if (Array.isArray(obj)) {
    seen.add(obj);
    for (let i = 0; i < obj.length; i += 1) {
      const p = at(obj[i], `${path}[${i}]`, seen);
      if (p) { seen.delete(obj); return p; }
    }
    seen.delete(obj);
    return null;
  }
  if (!isPlainObject(obj)) return path || "(root)"; // class instance / exotic
  seen.add(obj);
  for (const key of Object.keys(obj)) {
    const p = at((obj as Record<string, unknown>)[key], path ? `${path}.${key}` : key, seen);
    if (p) { seen.delete(obj); return p; }
  }
  seen.delete(obj);
  return null;
};

/** The path of the first non-JSON-safe value, or `null` if the whole value is serializable. */
export const findNonJsonPath = (value: unknown): string | null => at(value, "", new WeakSet());
