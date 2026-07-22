/**
 * assets/resolve — resolve a definition into a `ResolvedAsset`, with clear failures.
 *
 * Resolution fails clearly when: no resolver supports the source, the requested renderer
 * category is incompatible, or declared metadata is invalid. (Missing-asset-name errors come
 * from the registry's `require`.)
 */

import { DomainError } from "../errors";
import { DEFAULT_RESOLVERS } from "./resolvers";
import { type AssetCategory, type AssetDefinition, type AssetMetadata, type AssetSourceResolver, type ResolvedAsset } from "./types";

/** Throw if declared metadata is impossible. */
export const validateMetadata = (name: string, metadata?: AssetMetadata): void => {
  if (!metadata) return;
  const positive = (v: number | undefined, key: string) => {
    if (v !== undefined && !(typeof v === "number" && Number.isFinite(v) && v > 0)) {
      throw new DomainError({
        code: "invalid-asset-metadata",
        message: `Asset "${name}": metadata.${key} must be a positive number, got ${String(v)}.`,
        path: `metadata.${key}`,
        actual: v ?? null,
      });
    }
  };
  positive(metadata.width, "width");
  positive(metadata.height, "height");
  positive(metadata.durationInSeconds, "durationInSeconds");
};

/** Assert a definition's category is one of `allowed` (renderer compatibility). */
export const assertCategory = (name: string, def: AssetDefinition, allowed: readonly AssetCategory[]): void => {
  if (!allowed.includes(def.category)) {
    throw new DomainError({
      code: "asset-category",
      message: `Asset "${name}" is a "${def.category}" asset but was requested as ${allowed.map((c) => `"${c}"`).join(" | ")}.`,
      expected: [...allowed],
      actual: def.category,
    });
  }
};

/** Resolve a definition's source into a `ResolvedAsset`. */
export const resolveAsset = (
  name: string,
  def: AssetDefinition,
  resolvers: AssetSourceResolver[] = DEFAULT_RESOLVERS,
): ResolvedAsset => {
  validateMetadata(name, def.metadata);
  const resolver = resolvers.find((r) => r.supports(def.source));
  if (!resolver) {
    throw new DomainError({
      code: "unresolvable-source",
      message: `Asset "${name}": no resolver supports its source (${JSON.stringify(def.source)}).`,
    });
  }
  return resolver.resolve(def.source, def.category, def.metadata);
};
