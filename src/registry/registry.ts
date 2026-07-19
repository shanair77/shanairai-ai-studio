/**
 * registry — the generic, dependency-free registry kernel.
 *
 * A `Registry<M>` maps string keys to definitions of a single family (scenes, and later
 * transitions / assets / effects / brands / templates). It is the shared primitive every
 * typed registry in the framework is built on, so they all expose the same surface:
 * `keys / has / get / require / extend / entries`. It knows nothing about any domain — the
 * definition shape is supplied by each family.
 *
 * `extend` is immutable: it returns a NEW registry with the added/overridden entries, which
 * keeps registries hermetic (no shared global mutation) and gives type-safe third-party
 * extension for free.
 */

import { DomainError } from "../errors";

export type DefinitionMap = Record<string, unknown>;

export interface Registry<M extends DefinitionMap> {
  /** The raw definition map (read-only). */
  readonly entries: M;
  /** All registered keys. */
  keys(): (keyof M & string)[];
  /** Whether a key is registered. */
  has(key: string): boolean;
  /** Typed lookup for a known key. */
  get<K extends keyof M & string>(key: K): M[K];
  /** Dynamic lookup for a runtime string key; throws if absent. */
  require(key: string): M[keyof M];
  /** Immutable extension — returns a new registry with `entries` added/overriding. */
  extend<E extends DefinitionMap>(entries: E): Registry<Omit<M, keyof E> & E>;
}

/** Build a registry from a definition map. */
export const createRegistry = <M extends DefinitionMap>(entries: M): Registry<M> => {
  const map: M = { ...entries };

  return {
    entries: map,
    keys: () => Object.keys(map) as (keyof M & string)[],
    has: (key) => Object.prototype.hasOwnProperty.call(map, key),
    get: (key) => map[key],
    require: (key) => {
      if (!Object.prototype.hasOwnProperty.call(map, key)) {
        const known = Object.keys(map).join(", ") || "(none)";
        // Expected configuration failure (unknown scene/transition/asset/brand/template name).
        throw new DomainError({
          code: "unknown-entry",
          message: `Registry: no entry registered as "${key}". Registered: ${known}.`,
          actual: key,
        });
      }
      return map[key as keyof M];
    },
    extend: <E extends DefinitionMap>(more: E) =>
      createRegistry({ ...map, ...more } as Omit<M, keyof E> & E),
  };
};
